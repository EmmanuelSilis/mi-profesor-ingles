import { BASIC_LESSONS, basicCourse } from './basics.ts';
import { writingExercises, type WritingExercise } from './writing.ts';
import type { Course } from './course';
import type { Attempt } from './courseStore';

export interface DailyItem { course: Course; exercise: WritingExercise; review: boolean }
export function dailyPlan(courses: Course[], attempts: Record<string, Attempt[]>, now = Date.now()): DailyItem[] {
  const available = [...courses, ...BASIC_LESSONS.map(basicCourse).filter(c => !courses.some(saved => saved.id === c.id))];
  const candidates = available.flatMap(course => writingExercises(course).map(exercise => {
    const history = (attempts[course.id] || []).filter(a => a.cardId === exercise.id);
    const last = history.at(-1);
    let streak = 0;
    for (let i = history.length - 1; i >= 0 && history[i].correct; i--) streak++;
    const interval = [1, 3, 7, 14][Math.min(Math.max(streak - 1, 0), 3)] * 86400000;
    const due = !!last && (!last.correct || now - Date.parse(last.at) >= interval);
    return { course, exercise, review: !!last, priority: due ? 0 : !last ? 1 : 2, lastAt: last ? Date.parse(last.at) : 0 };
  }));
  return candidates.filter(c => c.priority < 2).sort((a,b) => a.priority - b.priority || a.lastAt - b.lastAt).slice(0, 10);
}
export function progressiveHints(e: WritingExercise): string[] {
  const first = /born|from|\bwas\b|\bwere\b/i.test(e.prompt)
    ? 'Identifica el sujeto: ¿una persona o varias? Después distingue origen en presente de nacimiento en pasado.'
    : /___/.test(e.prompt) ? 'Lee toda la frase. Identifica el sujeto y qué tipo de palabra falta antes de responder.'
    : 'Identifica qué pide la consigna: traducir, negar, preguntar o responder. Observa el sujeto y el orden de las palabras.';
  return [first, e.hint, `Ejemplo resuelto: ${e.example}`];
}
