import type { Course, SourcePage } from './course';
export interface Selection { courseId: string; pages: number[] }
export function combineCourses(courses: Course[], selections: Selection[], title: string): Course {
 const id=crypto.randomUUID(); const pages:SourcePage[]=[], cards:Course['cards']=[], units:Course['units']=[];
 for(const choice of selections){
  const course=courses.find(c=>c.id===choice.courseId);if(!course)continue;
  const selected=new Set(choice.pages);
  pages.push(...course.pages.filter(p=>selected.has(p.page)).map(p=>({...p,sourceName:p.sourceName || course.fileName})));
  cards.push(...course.cards.filter(c=>selected.has(c.page)).map(c=>({...c,id:`${id}-${cards.length}-${c.id}`})));
  units.push(...course.units.filter(u=>selected.has(u.page)).map(u=>({...u,title:`${course.fileName} · ${u.title}`})));
 }
 if(!pages.length)throw new Error('Selecciona al menos una página.');
 return {id,fileName:title.trim()||'Repaso combinado',pages,cards,units,selections,createdAt:new Date().toISOString()};
}
