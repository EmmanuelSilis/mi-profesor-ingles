import { putOriginal } from '../lib/originals';
import { useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { extractPdfContent, extractImageContent } from '../lib/pdfEngine';
import { analyzeCourse, type SourcePage } from '../lib/course';
import { useCourse } from '../lib/courseStore';
interface Draft { file:File; id:string; name:string; preview:string; pages:SourcePage[]; error?:string; saved?:boolean }
export default function PdfImport(){
 const [drafts,setDrafts]=useState<Draft[]>([]),[busy,setBusy]=useState(false),[progress,setProgress]=useState(''),[error,setError]=useState('');
 const lock=useRef(false), urls=useRef<string[]>([]);const save=useCourse(s=>s.saveCourse);
 useEffect(()=>()=>{urls.current.forEach(u=>URL.revokeObjectURL(u));},[]);
 const {getRootProps,getInputProps}=useDropzone({accept:{'application/pdf':['.pdf'],'image/jpeg':['.jpg','.jpeg'],'image/png':['.png']},multiple:true,maxFiles:10,maxSize:40*1024*1024,disabled:busy,
 onDropRejected:()=>setError('Admite hasta 10 PDF, JPG o PNG por lote; cada archivo puede pesar hasta 40 MB.'),
 onDrop:async files=>{if(!files.length||lock.current)return;lock.current=true;setBusy(true);setError('');
  try{for(let i=0;i<files.length;i++){const file=files[i],id=crypto.randomUUID(),preview=URL.createObjectURL(file);urls.current.push(preview);setProgress(`Archivo ${i+1}/${files.length}: ${file.name}`);
   try{const result=file.name.toLowerCase().endsWith('.pdf')?await extractPdfContent(file,p=>setProgress(`${file.name}: ${p.stage} · página ${p.page}/${p.total}`)):await extractImageContent(file);setDrafts(s=>[...s,{file,id,name:file.name,preview,pages:result.sourcePages}]);}catch(e){setDrafts(s=>[...s,{file,id,name:file.name,preview,pages:[],error:e instanceof Error?e.message:'No se pudo leer.'}]);}
  }}finally{lock.current=false;setBusy(false);}},
 });
 const saveDraft=async(draft:Draft)=>{if(lock.current)return;lock.current=true;setBusy(true);try{if(!draft.pages.some(p=>p.text.trim()))throw new Error('No hay texto legible.');const course=analyzeCourse(draft.pages,draft.name);course.originalName=draft.file.name;await putOriginal(course.id,draft.file);save(course);setDrafts(ds=>ds.map(d=>d.id===draft.id?{...d,saved:true,error:undefined}:d));}catch(e){setError(e instanceof Error?e.message:'No se pudo guardar.');}finally{lock.current=false;setBusy(false);}};
 return <section className="space-y-4"><h1 className="text-2xl font-bold">Importar PDF y fotos</h1><p>Selecciona varios documentos para guardarlos como lecciones. Después puedes combinar sus páginas.</p><div {...getRootProps()} className="border-2 border-dashed rounded-xl p-8 bg-white text-center cursor-pointer"><input {...getInputProps()} aria-label="Seleccionar PDF o fotos"/><p role="status">{busy?progress:'Arrastra tus PDF o fotos, o haz clic para seleccionar'}</p><p className="text-sm mt-2">Hasta 10 archivos por lote, 40 MB por archivo y 100 páginas por PDF. El OCR se procesa localmente.</p></div>{error&&<p role="alert" className="text-red-700">{error}</p>}
 {drafts.map(d=><section key={d.id} className="panel space-y-3"><h2 className="font-bold">{d.name} · {d.pages.length} páginas</h2>{d.error&&<p role="alert">{d.error}</p>}{d.pages.length>0&&<><p className="text-sm">Revisa el OCR. Las respuestas escritas a mano pueden contener errores: no se usan como soluciones de los ejemplos generados.</p>{d.pages.map((p,i)=><details key={p.page}><summary className="cursor-pointer">Página {p.page} · {p.method==='ocr'?`OCR ${Math.round(p.confidence||0)}%`:'Texto'}</summary><a href={`${d.preview}#page=${p.page}`} target="_blank" rel="noreferrer" className="underline text-blue-700">Ver original</a><label className="block">Texto de {d.name}, página {p.page}<textarea disabled={d.saved} className="border rounded p-3 min-h-52 w-full" value={p.text} onChange={e=>setDrafts(ds=>ds.map(x=>x.id===d.id?{...x,pages:x.pages.map((page,j)=>j===i?{...page,text:e.target.value}:page)}:x))}/></label></details>)}<button className="action" disabled={d.saved||busy} onClick={()=>saveDraft(d)}>{d.saved?'Lección guardada':'Guardar esta lección'}</button></>}</section>)}
 </section>;
}
