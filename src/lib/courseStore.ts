import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Course } from './course';

export interface Attempt { cardId: string; correct: boolean; answer: string; at: string; mode: string; prompt?: string; expected?: string; explanation?: string }
interface State {
  dirty: string[]; courses: Course[]; activeId: string | null; attempts: Record<string, Attempt[]>;
  saveCourse: (course: Course) => void; selectCourse: (id: string) => void;
  record: (attempt: Omit<Attempt, 'at'>) => void;
}
export const useCourse = create<State>()(persist((set, get) => ({
  dirty: [], courses: [], activeId: null, attempts: {},
  saveCourse: course => set(s => ({ dirty: [...new Set([...s.dirty, course.id])], courses: [...s.courses.filter(c => c.id !== course.id), course], activeId: course.id })),
  selectCourse: activeId => set({ activeId }),
  record: attempt => {
    const id = get().activeId;
    if (id) set(s => ({ attempts: { ...s.attempts, [id]: [...(s.attempts[id] || []), { ...attempt, at: new Date().toISOString() }].slice(-5000) } }));
  },
}), { name: 'english-pdf-courses-v1', storage: createJSONStorage(() => localStorage), version: 1 }));
export function useActiveCourse() { return useCourse(s => s.courses.find(c => c.id === s.activeId)); }
