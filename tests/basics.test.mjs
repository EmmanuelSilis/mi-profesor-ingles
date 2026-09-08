import test from 'node:test';
import assert from 'node:assert/strict';
import { BASIC_LESSONS, basicCourse } from '../src/lib/basics.ts';
import { writingExercises, gradeWriting } from '../src/lib/writing.ts';
import { combineCourses } from '../src/lib/combine.ts';
test('all eight built-in lessons work without imported documents',()=>{
 assert.equal(BASIC_LESSONS.length,8);
 const ids=new Set();let total=0;
 for(const lesson of BASIC_LESSONS){const c=basicCourse(lesson);assert.equal(c.pages.length,1);assert(c.builtin);assert.equal(c.cards.length,6);assert(lesson.notes.length>=3);
  const exercises=writingExercises(c);assert.equal(exercises.length,6);
  for(const e of exercises){assert(!ids.has(e.id));ids.add(e.id);total++;assert.equal(e.kind,'basic');for(const a of e.alternatives)assert(gradeWriting(e,a).correct,a);assert(!gradeWriting(e,'respuesta inválida').correct);}
 }assert.equal(total,48);
});
test('common mistakes are rejected with the relevant explanation',()=>{
 const be=writingExercises(basicCourse(BASIC_LESSONS.find(l=>l.id==='to-be')));
 assert.equal(gradeWriting(be[0],'is').correct,false);assert.match(gradeWriting(be[0],'is').explanation,/I se usa am/);
 const demo=writingExercises(basicCourse(BASIC_LESSONS.find(l=>l.id==='demonstratives')));
 assert.equal(gradeWriting(demo[1],'This').correct,false);
 const who=writingExercises(basicCourse(BASIC_LESSONS.find(l=>l.id==='questions')));
 assert.equal(gradeWriting(who[1],'What').correct,false);
});
test('built-in questions survive a combined course and remain tied to cards',()=>{
 const a=basicCourse(BASIC_LESSONS[0]),b=basicCourse(BASIC_LESSONS[4]);
 const c=combineCourses([a,b],[{courseId:a.id,pages:[1]},{courseId:b.id,pages:[1]}],'Basic mix');
 assert.equal(c.basicQuestions.length,12);assert.equal(c.cards.length,12);
 assert(c.basicQuestions.every(q=>c.cards.some(card=>card.id===q.id)));
 assert.equal(writingExercises(c).filter(e=>e.kind==='basic').length,12);
 const decoded=JSON.parse(JSON.stringify(c));assert.equal(decoded.basicQuestions[0].answers[0],'am');
});
test('reopening a built-in lesson preserves progress and avoids duplicate courses',async()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
 const {useCourse}=await import('../src/lib/courseStore.ts');
 const course=basicCourse(BASIC_LESSONS[0]);useCourse.getState().saveCourse(course);
 useCourse.getState().record({cardId:course.cards[0].id,correct:true,answer:'am',mode:'writing-structure'});
 useCourse.getState().saveCourse(basicCourse(BASIC_LESSONS[0]));
 assert.equal(useCourse.getState().courses.filter(c=>c.id===course.id).length,1);
 assert.equal(useCourse.getState().attempts[course.id].length,1);
 const saved=JSON.parse(memory.get('english-pdf-courses-v1'));assert.equal(saved.state.attempts[course.id].length,1);
});
