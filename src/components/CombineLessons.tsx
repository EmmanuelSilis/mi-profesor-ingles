import { useState } from 'react';
import { useCourse } from '../lib/courseStore';
import { combineCourses } from '../lib/combine';
export default function CombineLessons(){
 const courses=useCourse(s=>s.courses), save=useCourse(s=>s.saveCourse);
 const [selected,setSelected]=useState<Record<string,number[]>>({}),[title,setTitle]=useState('Mi repaso: lecciones combinadas'),[message,setMessage]=useState('');
 const originals=courses.filter(c=>!c.selections);
 if(!originals.length)return null;
 return <details className="panel"><summary className="font-bold cursor-pointer">Combinar lecciones y elegir páginas</summary><div className="space-y-4 mt-4"><p>Por ejemplo: toda la lección 10 y solo las páginas de origen y nacimiento de la lección 9. El repaso se guarda como otro curso; conserva los originales.</p><label className="block">Nombre del repaso<input className="border rounded p-2 block w-full" value={title} onChange={e=>setTitle(e.target.value)}/></label>
 {originals.map(c=><fieldset key={c.id} className="border rounded p-3"><legend>{c.fileName}</legend><button className="underline text-blue-700" onClick={()=>setSelected(s=>({...s,[c.id]:s[c.id]?.length===c.pages.length?[]:c.pages.map(p=>p.page)}))}>Seleccionar / quitar toda la lección</button><div className="flex flex-wrap gap-4 mt-3">{c.pages.map(p=><label key={p.page}><input type="checkbox" checked={selected[c.id]?.includes(p.page)||false} onChange={e=>setSelected(s=>({...s,[c.id]:e.target.checked?[...(s[c.id]||[]),p.page]:(s[c.id]||[]).filter(n=>n!==p.page)}))}/> Página {p.page}</label>)}</div></fieldset>)}
 <button className="action" onClick={()=>{try{const course=combineCourses(courses,Object.entries(selected).map(([courseId,pages])=>({courseId,pages})),title);save(course);setMessage('Repaso guardado y seleccionado. Abre Escribir y elige el tema que quieras practicar.');}catch(e){setMessage(e instanceof Error?e.message:'No se pudo guardar.');}}}>Guardar repaso combinado</button><p role="status">{message}</p></div></details>;
}
