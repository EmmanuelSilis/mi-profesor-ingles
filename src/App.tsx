import BasicLibrary from './components/BasicLibrary';
import CombineLessons from './components/CombineLessons';
import GuidedWriting from './components/GuidedWriting';
import { useState } from 'react';
import AppShell from './components/AppShell';
import PdfImport from './components/PdfImport';
import Flashcards from './components/Flashcards';
import CoursePractice from './components/CoursePractice';
import { useActiveCourse, useCourse } from './lib/courseStore';

export default function App() {
  const [tab, setTab] = useState('basicos');
  const course = useActiveCourse();
  const courses = useCourse(s => s.courses);
  const select = useCourse(s => s.selectCourse);
  return <AppShell activeTab={tab} onTabChange={setTab}>
    <div className="max-w-3xl mx-auto space-y-6">
      {courses.length > 0 && <label className="block text-sm">Curso activo
        <select className="ml-3 bg-white border rounded-lg p-2 max-w-full" value={course?.id || ''} onChange={e => select(e.target.value)}>
          {courses.map(c => <option key={c.id} value={c.id}>{c.fileName}</option>)}
        </select>
      </label>}
      <div className="flex gap-2 flex-wrap">{[['basicos','Lecciones básicas'], ['estudiar','Importar / contenido'], ['examen','Examen'], ['errores','Mis errores'], ['progreso','Mi progreso']].map(([id,label]) => <button key={id} className="rounded-lg border px-3 py-2 bg-white" aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}</div>
      {tab === 'basicos' ? <BasicLibrary onPractice={() => setTab('escribir')} /> : tab === 'estudiar' ? <><CombineLessons /><PdfImport />{course && <section className="bg-white p-5 rounded-xl space-y-3"><h2 className="text-xl font-bold">{course.fileName}</h2><p>{course.cards.length} tarjetas · {course.pages.length} páginas</p>{course.units.map((u,i) => <details key={i}><summary className="cursor-pointer">{u.title} · página {u.page}</summary><p className="mt-2">{u.topics.join(' · ')}</p><p className="text-sm mt-2">Vocabulario detectado: {u.vocabulary.join(', ') || 'Sin vocabulario identificable.'}</p>{u.grammar.length > 0 && <p>{u.grammar.join(' · ')}</p>}</details>)}</section>}</> : !course ? <p className="bg-white p-6 rounded-xl">Elige una lección básica o importa un documento para comenzar.</p> : tab === 'escribir' ? <GuidedWriting key={course.id} course={course} /> : tab === 'flashcards' ? <Flashcards key={course.id} cards={course.cards} /> : <CoursePractice key={`${course.id}-${tab}`} mode={tab} course={course} />}
    </div>
  </AppShell>;
}
