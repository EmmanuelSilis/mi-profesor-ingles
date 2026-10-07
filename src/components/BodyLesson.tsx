import { useEffect, useState } from 'react';
import BodyMap from './body/BodyMap';
import WordList from './body/WordList';
import Quiz from './body/Quiz';

export default function BodyLesson() {
  const [section, setSection] = useState('mapa');
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, [section]);
  return <section className="panel space-y-5">
    <h1 className="text-2xl font-bold">Partes del cuerpo</h1>
    <p>Una lección independiente: explora el cuerpo, escucha las palabras y practica con un examen. No necesitas subir documentos.</p>
    <div className="flex flex-wrap gap-2" aria-label="Actividades de partes del cuerpo">
      {[['mapa','Explorar el cuerpo'],['palabras','Vocabulario y audio'],['examen','Examen del cuerpo']].map(([id,label]) =>
        <button key={id} className={section===id?'action':'rounded-lg border p-3 bg-white'} aria-pressed={section===id} onClick={()=>setSection(id)}>{label}</button>)}
    </div>
    <p className="text-sm text-slate-600">Esta actividad no se sincroniza con Mi progreso. Al salir del apartado se reinicia la práctica.</p>
    <div hidden={section!=='mapa'}><BodyMap /></div>
    <div hidden={section!=='palabras'}><WordList /></div>
    <div hidden={section!=='examen'}><Quiz /></div>
  </section>;
}
