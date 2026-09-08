import { useMemo, useState } from 'react';
import type { Course } from '../lib/course';
import { gradeWriting, writingExercises, type Grade } from '../lib/writing';
import { useCourse } from '../lib/courseStore';
import CoursePractice from './CoursePractice';
export default function GuidedWriting({course}:{course:Course}) {
  const [variant,setVariant]=useState(0), [topic,setTopic]=useState('Todos');
  const all=useMemo(()=>writingExercises(course,variant),[course,variant]);
  const topics=['Todos',...new Set(all.map(e=>e.topic || (e.kind==='identity'?'Identidad':'Familia y posesivos')))];
  const exercises=all.filter(e=>topic==='Todos'||(e.topic || (e.kind==='identity'?'Identidad':'Familia y posesivos'))===topic);
  const [index,setIndex]=useState(0), [answer,setAnswer]=useState(''), [hint,setHint]=useState(false);
  const [grade,setGrade]=useState<Grade|null>(null),[exact,setExact]=useState(false),[error,setError]=useState('');
  const record=useCourse(s=>s.record); const exercise=exercises[index];
  const check=()=>{if(!answer.trim()||grade)return;const result=gradeWriting(exercise,answer);try{record({cardId:exercise.id,mode:'writing-structure',answer,correct:result.correct,prompt:exercise.prompt,expected:exercise.example,explanation:result.explanation});setGrade(result);}catch{setError('No se pudo guardar la respuesta.');}};
  return <div className="space-y-4"><div className="flex gap-3"><button className="action" aria-pressed={!exact} onClick={()=>setExact(false)}>Respuestas con estructura</button><button className="rounded-lg border p-3 bg-white" aria-pressed={exact} onClick={()=>setExact(true)}>Completar texto del PDF</button></div>{exact ? <CoursePractice course={course} mode="escribir"/> : <section className="panel space-y-5">
    <h1 className="text-2xl font-bold">Escribir con pistas</h1><p>Practica nacimiento, origen, pronombres, el verbo to be y posesivos. La corrección usa patrones guiados; no analiza cualquier frase libre.</p>
    <label className="block">Tema para repasar<select className="block border rounded-lg p-2 w-full" value={topic} onChange={e=>{setTopic(e.target.value);setIndex(0);setAnswer('');setGrade(null);setHint(false);}}>{topics.map(t=><option key={t}>{t}</option>)}</select></label><button className="underline text-blue-700" onClick={()=>{setVariant(v=>v+1);setIndex(0);setAnswer('');setGrade(null);setHint(false);}}>Cambiar nombres de los ejemplos de nacimiento y origen</button>
    <label className="block">Elegir ejercicio<select className="block border rounded-lg p-2 w-full" value={index} onChange={e=>{setIndex(Number(e.target.value));setAnswer('');setGrade(null);setHint(false);}}>{exercises.map((x,i)=><option key={x.id} value={i}>{i+1}. {x.prompt}</option>)}</select></label>
    <p className="text-sm text-slate-600">{exercise.context}</p><h2 className="text-xl font-semibold">{exercise.prompt}</h2>
    <button className="text-blue-700 underline" onClick={()=>setHint(!hint)} aria-expanded={hint}>{hint?'Ocultar pista':'Necesito una pista'}</button>{hint&&<p className="bg-blue-50 rounded-lg p-4">{exercise.hint}</p>}
    <form className="space-y-3" onSubmit={e=>{e.preventDefault();check();}}><label className="block">Tu respuesta en inglés<input className="block border rounded-lg p-3 w-full mt-2" autoComplete="off" value={answer} disabled={!!grade} onChange={e=>setAnswer(e.target.value)}/></label><button className="action" disabled={!answer.trim()||!!grade}>Revisar estructura</button></form>
    {error&&<p role="alert">{error}</p>}{grade&&<div role="status" className={`rounded-lg p-4 space-y-3 ${grade.correct?'bg-green-50':'bg-orange-50'}`}><h3 className="font-bold">{grade.correct?'Estructura correcta':'Revisa tu respuesta'}</h3><p>{grade.explanation}</p><p>Ejemplo válido: <strong>{grade.example}</strong></p>{exercise.source&&<p className="text-sm">Referencia del PDF: {exercise.source}</p>}<button className="action" onClick={()=>{setGrade(null);setAnswer('');}}>Intentar otra respuesta</button><button className="ml-3 underline" onClick={()=>{setIndex((index+1)%exercises.length);setGrade(null);setAnswer('');setHint(false);}}>Siguiente ejercicio</button></div>}
  </section>}</div>;
}
