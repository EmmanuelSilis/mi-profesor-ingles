import BodyLesson from './components/BodyLesson';
import MyLessons, { CloudAccount } from './components/MyLessons';
import { startCloud, useCloud } from './lib/cloud';
import DailyClass from './components/DailyClass';
import BasicLibrary from './components/BasicLibrary';
import CombineLessons from './components/CombineLessons';
import GuidedWriting from './components/GuidedWriting';
import { useState, useEffect } from 'react';
import AppShell, { MainNavigation, PracticeNavigation } from './components/AppShell';
import PdfImport from './components/PdfImport';
import Flashcards from './components/Flashcards';
import CoursePractice from './components/CoursePractice';
import { useActiveCourse, useCourse } from './lib/courseStore';

export default function App() {
  useEffect(startCloud, []);
  const cloud=useCloud();
  const [tab, setTab] = useState('hoy');
  const course = useActiveCourse();
  const courses = useCourse(s => s.courses);
  const select = useCourse(s => s.selectCourse);
  if(!cloud.ready)return <p className="p-6">Preparando tu biblioteca…</p>;
  return <AppShell activeTab={tab} onTabChange={setTab}>
    <div key={cloud.userId || 'guest'} className="max-w-5xl mx-auto space-y-6"><MainNavigation activeTab={tab} onTabChange={setTab} />
      {tab !== 'cuerpo' && courses.length > 0 && <label className="course-picker">Curso activo
        <select className="course-select" value={course?.id || ''} onChange={e => select(e.target.value)}>
          {courses.map(c => <option key={c.id} value={c.id}>{c.fileName}</option>)}
        </select>
      </label>}
      <PracticeNavigation activeTab={tab} onTabChange={setTab} />
      {tab === 'cuerpo' ? <BodyLesson /> : tab === 'lecciones' ? <MyLessons onStudy={() => setTab('escribir')} onImport={() => setTab('estudiar')} /> : tab === 'hoy' ? <DailyClass /> : tab === 'basicos' ? <BasicLibrary onPractice={() => setTab('escribir')} /> : tab === 'estudiar' ? <><CombineLessons /><PdfImport />{course && <section className="bg-white p-5 rounded-xl space-y-3"><h2 className="text-xl font-bold">{course.fileName}</h2><p>{course.cards.length} tarjetas · {course.pages.length} páginas</p>{course.units.map((u,i) => <details key={i}><summary className="cursor-pointer">{u.title} · página {u.page}</summary><p className="mt-2">{u.topics.join(' · ')}</p><p className="text-sm mt-2">Vocabulario detectado: {u.vocabulary.join(', ') || 'Sin vocabulario identificable.'}</p>{u.grammar.length > 0 && <p>{u.grammar.join(' · ')}</p>}</details>)}</section>}</> : !course ? <p className="bg-white p-6 rounded-xl">Elige una lección básica o importa un documento para comenzar.</p> : tab === 'escribir' ? <GuidedWriting key={course.id} course={course} /> : tab === 'flashcards' ? <Flashcards key={course.id} cards={course.cards} /> : <CoursePractice key={`${course.id}-${tab}`} mode={tab} course={course} />}
      <CloudAccount />
    </div>
  </AppShell>;
}
