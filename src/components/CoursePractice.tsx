import { useEffect, useRef, useState } from 'react';
import { normalizeAnswer, type Course } from '../lib/course';
import { useCourse } from '../lib/courseStore';

interface Recognition {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((e: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null;
  start(): void; abort(): void;
}
export default function CoursePractice({ course, mode }: { course: Course; mode: string }) {
  const attempts = useCourse(s => s.attempts[course.id]);
  const record = useCourse(s => s.record);
  const [index, setIndex] = useState(0), [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<boolean | null>(null), [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [listening, setListening] = useState(false), [score, setScore] = useState(0), [finished, setFinished] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const cards = mode === 'examen' ? course.cards.slice(0, 10) : course.cards;
  const card = cards[index];
  useEffect(() => () => { window.speechSynthesis?.cancel(); recognition.current?.abort(); }, []);
  const speak = () => {
    if (!('speechSynthesis' in window)) { setError('Este navegador no ofrece lectura en voz alta.'); return; }
    speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(card.source); speech.lang = 'en-US'; speech.rate = .85;
    speech.onerror = () => setError('No se pudo reproducir el audio. Comprueba las voces del navegador.');
    speechSynthesis.speak(speech);
  };
  const check = (value = answer) => {
    if (feedback !== null || !value.trim()) return;
    const expected = mode === 'escuchar' || mode === 'pronunciacion' ? card.source : card.back;
    const correct = normalizeAnswer(value) === normalizeAnswer(expected);
    try { record({ cardId: card.id, correct, answer: value, mode }); setFeedback(correct); if (correct) setScore(s => s + 1); }
    catch { setError('No se pudo guardar tu respuesta en este navegador.'); }
  };
  const startRecognition = () => {
    const ctor = (window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition;
    if (!ctor) { setError('Reconocimiento de voz no disponible. Puedes escuchar la frase y practicar en voz alta.'); return; }
    const rec = new ctor(); recognition.current = rec; rec.lang = 'en-US'; rec.continuous = false; rec.interimResults = false;
    rec.onresult = e => { const text = e.results[0][0].transcript; setAnswer(text); check(text); };
    rec.onerror = e => { setListening(false); setError(`No se pudo reconocer la voz (${e.error}). Revisa el permiso del micrófono.`); };
    rec.onend = () => setListening(false);
    try { setError(''); rec.start(); setListening(true); } catch { setError('No se pudo activar el micrófono.'); setListening(false); }
  };
  if (mode === 'progreso' || mode === 'errores') {
    const list = attempts || [], correct = list.filter(a => a.correct).length;
    const last = new Map(list.map(a => [a.cardId, a]));
    const writingErrors = [...last.values()].filter(a => a.mode === 'writing-structure' && !a.correct);
    const failed = course.cards.filter(c => last.get(c.id)?.correct === false);
    return <section className="panel space-y-4"><h1 className="text-2xl font-bold">{mode === 'progreso' ? 'Mi progreso' : 'Mis errores'}</h1>
      {mode === 'progreso' && <p>{list.length} respuestas · {correct} aciertos · {list.length - correct} errores · {list.length ? Math.round(correct / list.length * 100) : 0}% de aciertos</p>}
      <p>{failed.length || writingErrors.length ? 'Repasa estas frases del documento:' : 'No hay errores pendientes registrados.'}</p>
      {writingErrors.map(a => <article key={a.cardId} className="border-t pt-3"><p>{a.prompt}</p><p>Tu respuesta: {a.answer}</p><p>{a.explanation}</p><p>Ejemplo válido: {a.expected}</p></article>)}
      {failed.map(c => <article key={c.id} className="border-t pt-3"><p>{c.front}</p><p className="text-sm text-red-700">Tu respuesta: {last.get(c.id)?.answer}</p><p className="text-green-800">Respuesta: {['escuchar', 'pronunciacion'].includes(last.get(c.id)?.mode || '') ? c.source : c.back}</p><p>{c.source}</p><small>{c.hint}</small></article>)}
    </section>;
  }
  if (!card) return <p>No hay frases utilizables. Revisa el texto importado.</p>;
  if (finished) return <section className="panel"><h1 className="text-xl font-bold">Examen terminado</h1><p className="my-4">{score} de {cards.length} respuestas correctas.</p><button className="action" onClick={() => { setIndex(0); setScore(0); setFinished(false); setFeedback(null); setAnswer(''); }}>Repetir examen</button></section>;
  return <section className="panel space-y-5">
    <h1 className="text-2xl font-bold">{({ escuchar: 'Escuchar y escribir', pronunciacion: 'Practicar pronunciación', examen: 'Examen del PDF', escribir: 'Completar frases' } as Record<string,string>)[mode] || 'Practicar'}</h1>
    <p className="text-sm">{index + 1} de {cards.length} · {card.hint}</p>
    {mode === 'pronunciacion' && <p className="text-sm">El reconocimiento compara las palabras transcritas, no califica tu acento. Tu navegador puede enviar audio a su proveedor de reconocimiento al activar el micrófono.</p>}
    {mode !== 'escuchar' && <p className="text-2xl leading-relaxed">{mode === 'pronunciacion' ? card.source : card.front}</p>}
    {(mode === 'escuchar' || mode === 'pronunciacion') && <button className="action" onClick={speak}>Escuchar frase</button>}
    {mode === 'escribir' && <div className="space-y-2"><p>Reproduce la palabra del documento, no una respuesta libre.</p><button className="text-blue-700 underline" onClick={() => setShowHint(!showHint)}>Ver pista y contexto</button>{showHint && <p>Empieza por «{card.back[0]}» y tiene {card.back.length} caracteres. Frase del documento: {card.source}</p>}</div>}
    {mode === 'pronunciacion' ? <button className="action ml-2" disabled={listening || feedback !== null} onClick={startRecognition}>{listening ? 'Escuchando…' : 'Activar micrófono'}</button> : <form className="space-y-3" onSubmit={e => { e.preventDefault(); check(); }}>
      <label className="block">{mode === 'escuchar' ? 'Escribe la frase que escuchas' : 'Escribe la palabra que falta'}<input autoComplete="off" className="block border rounded-lg p-3 w-full mt-2" value={answer} disabled={feedback !== null} onChange={e => setAnswer(e.target.value)} /></label>
      <button className="action" disabled={!answer.trim() || feedback !== null}>Comprobar</button>
    </form>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {feedback !== null && <div role="status" className="space-y-3"><h2 className="font-bold">{feedback ? 'Correcto' : 'Necesita práctica'}</h2>{mode === 'pronunciacion' && <p>Se reconoció: {answer}</p>}<p>Texto de referencia: {card.source}</p><p>Palabra de la tarjeta: <strong>{card.back}</strong></p><p className="text-sm">La respuesta se comprueba con el texto de la página {card.page}.</p><button className="action" onClick={() => { window.speechSynthesis?.cancel(); if (mode === 'examen' && index === cards.length - 1) setFinished(true); else setIndex((index + 1) % cards.length); setFeedback(null); setAnswer(''); setError(''); setShowHint(false); }}>Continuar</button></div>}
  </section>;
}
