import { createClient } from '@supabase/supabase-js';
import { create } from 'zustand';
import { useCourse } from './courseStore';
import type { Course } from './course';
import type { Attempt } from './courseStore';
import { mergeAttempts } from './cloudMerge';
import { getOriginal } from './originals';
// Publishable browser key; access is enforced by RLS, never a service-role key.
const url=import.meta.env.VITE_SUPABASE_URL || 'https://ukvdtejxevmzbuomnvxx.supabase.co';
const key=import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_tzX2IVtrzcq0zVZh6qaWBA_Q2igpL8n';
export const supabase=url&&key?createClient(url,key):null;
export const useCloud=create<{userId:string|null;email:string;ready:boolean;busy:boolean;status:string;recovery:boolean}>(()=>({userId:null,email:'',ready:!supabase,busy:false,status:'',recovery:false}));
const guestKey='english-pdf-courses-v1';
export function guestLibrary(){return JSON.parse(localStorage.getItem(guestKey)||'{"state":{"courses":[],"attempts":{}}}').state;}
function switchLibrary(userId:string|null) {
 const name=userId?`${guestKey}-account-${userId}`:guestKey;
 const stored=JSON.parse(localStorage.getItem(name)||'null')?.state;
 useCourse.persist.setOptions({name});
 useCourse.setState({courses:stored?.courses||[],attempts:stored?.attempts||{},activeId:stored?.activeId||null,dirty:stored?.dirty||[]});
}
let syncing=false;
export async function syncLibrary() {
 const userId=useCloud.getState().userId;
 if(!supabase||!userId||syncing)return;
 syncing=true;useCloud.setState({busy:true,status:'Sincronizando…'});
 try {
  const snapshot=useCourse.getState();
  const uploaded:Course[]=[];
  for(const c of snapshot.courses.filter(c=>snapshot.dirty.includes(c.id))) {
   let course={...c};
   if(course.originalName&&!course.originalPath){
    const blob=await getOriginal(course.id);
    if(blob){const path=`${userId}/${course.id}/${crypto.randomUUID()}`;const {error}=await supabase.storage.from('english-originals').upload(path,blob,{contentType:blob.type||'application/pdf'});if(error)throw error;course.originalPath=path;}
   }
   const {error}=await supabase.from('english_lessons').upsert({user_id:userId,id:course.id,course});if(error)throw error;
   uploaded.push(course);
  }
  const rows=[];
  for(const [courseId,attempts] of Object.entries(snapshot.attempts))for(const attempt of attempts){
   const data=new TextEncoder().encode(JSON.stringify([courseId,attempt.cardId,attempt.at,attempt.mode,attempt.answer,attempt.correct]));
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');
   rows.push({user_id:userId,id:hash,course_id:courseId,attempt});
  }
  for(let i=0;i<rows.length;i+=100){const {error}=await supabase.from('english_attempts').upsert(rows.slice(i,i+100),{ignoreDuplicates:true,onConflict:'user_id,id'});if(error)throw error;}
  const remoteCourses:Course[]=[];const remoteAttempts:Record<string,Attempt[]>={};
  for(let offset=0;;offset+=500){const {data,error}=await supabase.from('english_lessons').select('course').eq('user_id',userId).order('id').range(offset,offset+499);if(error)throw error;remoteCourses.push(...data.map(row=>row.course as Course));if(data.length<500)break;}
  for(let offset=0;;offset+=500){const {data,error}=await supabase.from('english_attempts').select('course_id,attempt').eq('user_id',userId).order('id').range(offset,offset+499);if(error)throw error;for(const row of data)(remoteAttempts[row.course_id]??=[]).push(row.attempt as Attempt);if(data.length<500)break;}
  if(useCloud.getState().userId!==userId)return;
  const current=useCourse.getState();
  const completed=uploaded.filter(c=>current.courses.find(x=>x.id===c.id)===snapshot.courses.find(x=>x.id===c.id)).map(c=>c.id);
  const dirty=current.dirty.filter(id=>!completed.includes(id));
  const map=new Map(remoteCourses.map(c=>[c.id,c]));
  for(const c of current.courses)if(dirty.includes(c.id)||!map.has(c.id))map.set(c.id,c);
  useCourse.setState({courses:[...map.values()],activeId:current.activeId||map.keys().next().value||null,attempts:mergeAttempts(current.attempts,remoteAttempts),dirty});
  useCloud.setState({status:'Guardado en tu cuenta. Usa Sincronizar en el otro dispositivo para actualizar.'});
 }catch(e){if(useCloud.getState().userId===userId)useCloud.setState({status:`No se pudo sincronizar. Tus cambios siguen en este navegador. ${e instanceof Error?e.message:'Revisa la conexión y pulsa Sincronizar.'}`});}
 finally{syncing=false;useCloud.setState({busy:false});}
}
export function startCloud() {
 if(!supabase)return ()=>{};
 let stopped=false,lastId:string|null|undefined;
 const apply=(id:string|null,email:string)=>{if(stopped)return;if(id!==lastId){lastId=id;switchLibrary(id);useCloud.setState({userId:id,email,ready:true,status:''});if(id)void syncLibrary();}};
 const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{setTimeout(()=>{if(event==='PASSWORD_RECOVERY')useCloud.setState({recovery:true});apply(session?.user.id||null,session?.user.email||'');},0);});
 supabase.auth.getSession().then(({data,error})=>{if(error)useCloud.setState({ready:true,status:error.message});else apply(data.session?.user.id||null,data.session?.user.email||'');});
 const unsubscribe=useCourse.subscribe((state,previous)=>{if(!syncing&&useCloud.getState().userId&&(state.courses!==previous.courses||state.attempts!==previous.attempts))useCloud.setState({status:'Cambios guardados en este navegador. Pulsa Sincronizar para enviarlos a tu cuenta.'});});
 return ()=>{stopped=true;subscription.unsubscribe();unsubscribe();};
}
