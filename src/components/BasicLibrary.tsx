import { useState } from 'react';
import { BASIC_LESSONS, basicCourse } from '../lib/basics';
import { useCourse } from '../lib/courseStore';
export default function BasicLibrary({onPractice}:{onPractice:()=>void}){
 const [selected,setSelected]=useState(BASIC_LESSONS[0].id),[error,setError]=useState('');
 const save=useCourse(s=>s.saveCourse);const lesson=BASIC_LESSONS.find(l=>l.id===selected)!;
 const start=()=>{try{save(basicCourse(lesson));setError('');onPractice();}catch{setError('No se pudo guardar la lección en el navegador.');}};
 return <section className="space-y-5"><header><h1 className="text-2xl font-bold">Lecciones básicas de inglés</h1><p className="mt-2">Material incluido en la aplicación. No necesitas PDF, fotos ni una clave de API.</p></header>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{BASIC_LESSONS.map(l=><button key={l.id} onClick={()=>setSelected(l.id)} aria-pressed={selected===l.id} className={`rounded-xl border p-4 text-left ${selected===l.id?'border-orange-500 bg-orange-100':'bg-white'}`}><span className="font-bold block">{l.title}</span><span className="text-sm block mt-1">{l.summary}</span></button>)}</div>
 <article className="panel space-y-4"><h2 className="text-xl font-bold">{lesson.title}</h2><h3 className="font-semibold">Cómo se usa</h3><ul className="list-disc pl-5 space-y-2">{lesson.notes.map(note=><li key={note}>{note}</li>)}</ul><h3 className="font-semibold">Ejemplos</h3><ul className="space-y-2">{lesson.examples.map(example=><li key={example} className="bg-orange-50 p-3 rounded">{example}</li>)}</ul><p>{lesson.questions.length} ejercicios con pistas y explicación de la respuesta.</p><button className="action" onClick={start}>Practicar esta lección</button><p className="text-sm">Al practicar se añade a tus cursos. Puedes combinarla con las páginas de tus documentos. Volver a abrirla conserva su progreso.</p>{error&&<p role="alert">{error}</p>}</article>
 </section>;
}
