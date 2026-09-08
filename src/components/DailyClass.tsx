import { useState } from 'react';
import { dailyPlan } from '../lib/daily';
import { gradeWriting, type Grade } from '../lib/writing';
import { useCourse } from '../lib/courseStore';
import ProgressiveHints from './ProgressiveHints';

export default function DailyClass() {
  const [plan] = useState(() => { const s = useCourse.getState(); return dailyPlan(s.courses, s.attempts); });
  const [started, setStarted] = useState(false), [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(''), [grade, setGrade] = useState<Grade | null>(null);
  const [score, setScore] = useState(0), [error, setError] = useState('');
  const item = plan[index];
  if (!plan.length) return <section className="panel"><h1 className="text-2xl font-bold">¡Tu repaso está al día!</h1><p>Puedes seguir practicando en Lecciones básicas. Vuelve mañana para tu siguiente repaso.</p></section>;
  if (!item) return <section className="panel space-y-4"><h1 className="text-2xl font-bold">Clase terminada</h1><p>Respuestas correctas: {score} de {plan.length}.</p><p>Tus respuestas quedaron guardadas. Los errores tendrán prioridad en la próxima clase; los aciertos se repasarán después de 1, 3, 7 y 14 días según tu práctica.</p><p>Puedes continuar en Lecciones básicas o descansar por hoy.</p></section>;
  const e = item.exercise;
  function check() {
    if (!answer.trim() || grade) return;
    const result = gradeWriting(e, answer);
    try {
      const s = useCourse.getState();
      if (!s.courses.some(c => c.id === item.course.id)) s.saveCourse(item.course);
      else s.selectCourse(item.course.id);
      useCourse.getState().record({ cardId: e.id, mode: 'daily', answer, correct: result.correct, prompt: e.prompt, expected: e.example, explanation: result.explanation });
      setGrade(result); setScore(v => v + Number(result.correct)); setError('');
    } catch { setError('No se pudo guardar tu respuesta. Inténtalo de nuevo antes de continuar.'); }
  }
  return <section className="panel space-y-4"><h1 className="text-2xl font-bold">Mi clase de hoy</h1>
    {!started ? <><p>Una práctica de unos 10–15 minutos: {plan.length} ejercicios, incluidos {plan.filter(p => p.review).length} de repaso. Priorizamos tus errores y después los temas nuevos.</p><p>Lee la pregunta, intenta responder y pide pistas si las necesitas. Puedes usar cualquier respuesta que admita el ejercicio; la corrección es guiada.</p><button className="action" onClick={() => setStarted(true)}>Comenzar mi clase</button></> : <>
      <p>Ejercicio {index+1} de {plan.length} · {item.review ? 'Repaso' : 'Práctica nueva'} · {e.topic || item.course.fileName}</p>
      <h2 className="text-xl font-semibold">{e.prompt}</h2><p className="text-sm">{e.context}</p>
      <ProgressiveHints key={`${index}-${e.id}`} exercise={e} />
      <form className="space-y-3" onSubmit={event => { event.preventDefault(); check(); }}><label className="block">Tu respuesta en inglés<input className="block border rounded-lg p-3 w-full" value={answer} onChange={event => setAnswer(event.target.value)} disabled={!!grade} autoComplete="off" /></label><button className="action" disabled={!!grade || !answer.trim()}>Comprobar</button></form>
      {error && <p role="alert">{error}</p>}
      {grade && <div role="status" className={`p-4 rounded-lg space-y-3 ${grade.correct ? 'bg-green-50' : 'bg-orange-50'}`}><strong>{grade.correct ? '¡Correcto!' : 'Vamos a repasarlo'}</strong><p>{grade.explanation}</p><p>Ejemplo válido: {grade.example}</p><button className="action" onClick={() => { setIndex(index+1); setAnswer(''); setGrade(null); }}>{index+1 === plan.length ? 'Terminar clase' : 'Siguiente'}</button></div>}
    </>}
  </section>;
}
