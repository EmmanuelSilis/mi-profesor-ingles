import { useState } from 'react';
import { progressiveHints } from '../lib/daily';
import type { WritingExercise } from '../lib/writing';
export default function ProgressiveHints({ exercise }: { exercise: WritingExercise }) {
  const [level, setLevel] = useState(0);
  const hints = progressiveHints(exercise);
  return <div className="space-y-2">
    {hints.slice(0,level).map((hint,i) => <p key={i} className="bg-blue-50 rounded-lg p-3">{hint}</p>)}
    {level < hints.length && <button type="button" className="underline text-blue-700" onClick={() => setLevel(level+1)}>{level === 0 ? 'Necesito una pista' : level === 1 ? 'Ver la regla' : 'Ver ejemplo resuelto'}</button>}
  </div>;
}
