import type { Course } from './course';
import type { WritingExercise, Grade } from './writing';
export const birthRule='Pasado: I/he/she/it y un nombre singular usan was. You/we/they y sujetos plurales usan were. Nacimiento: was/were born in. Pregunta: Where + was/were + sujeto + born?';
export const originRule='Origen: I am from; he/she/it is from; you/we/they are from. Pregunta: Where + am/is/are + sujeto + from? From expresa origen; born in expresa lugar de nacimiento.';
export function grammarExercises(course:Course, variant=0):WritingExercise[]{
 const birth=course.pages.find(p=>/\b(?:was|were)\b[^\n?.]{0,60}\bborn\b|\bwhere\s+(?:was|were)\b/i.test(p.text));
 const origin=course.pages.find(p=>/\b(?:am|is|are)\s+(?:he\s+|she\s+|they\s+|you\s+)?from\b/i.test(p.text));
 const names=[['Sofia','Daniel','Emma and Leo'],['Clara','Oscar','Nora and Luis'],['Maya','Adrian','Olivia and Alex']][variant%3];
 const result:WritingExercise[]=[];
 const add=(topic:string,key:string,prompt:string,example:string,rule:string,accepted:string[],prefix?:string)=>{
  const p=topic==='Nacimiento: was / were'?birth:origin;
  result.push({id:`grammar-${course.id}-${key}-${variant%3}`,kind:'grammar',topic,pronoun:'he',prompt,hint:rule,example,alternatives:accepted,source:'',context:`Ejemplo nuevo y ficticio. Estructura detectada en ${p?.sourceName||course.fileName} · página ${p?.page}.`,grammarPrefix:prefix});
 };
 if(birth){const topic='Nacimiento: was / were';
  add(topic,'singular',`Escribe la pregunta en inglés: ¿Dónde nació ${names[0]}?`,`Where was ${names[0]} born?`,birthRule,[`Where was ${names[0]} born?`]);
  add(topic,'plural',`Escribe la pregunta: ¿Dónde nacieron ${names[2]}?`,`Where were ${names[2]} born?`,birthRule,[`Where were ${names[2]} born?`]);
  add(topic,'teacher','Completa con las dos palabras que faltan: _____ _____ the teacher born?','Where was',birthRule+' The teacher indica una sola persona, por eso was.',['Where was']);
  add(topic,'he',`Where was ${names[1]} born? Habla de un hombre. Responde con he y elige cualquier país o ciudad.`, 'He was born in Canada.',birthRule,[],'he was born in');
  add(topic,'they',`Where were ${names[2]} born? Responde con they y elige cualquier lugar.`, 'They were born in Peru.',birthRule,[],'they were born in');
  add(topic,'you','Where were you born? Responde sobre ti con I y elige un lugar.', 'I was born in Mexico.',birthRule+' La pregunta usa you were, pero al responder sobre ti cambias a I was.',[],'i was born in');
 }
 if(origin){const topic='Origen: is / are from';
  add(topic,'origin-question',`Escribe la pregunta: ¿De dónde es ${names[1]}?`, `Where is ${names[1]} from?`,originRule,[`Where is ${names[1]} from?`]);
  add(topic,'origin-plural',`Escribe la pregunta: ¿De dónde son ${names[2]}?`, `Where are ${names[2]} from?`,originRule,[`Where are ${names[2]} from?`]);
  add(topic,'origin-he','Where is he from? Responde con he y elige un país o ciudad.', 'He is from Chile.',originRule,[],'he is from');
  add(topic,'origin-she','Where is she from? Responde con she y elige un país o ciudad.', 'She is from Spain.',originRule,[],'she is from');
  add(topic,'origin-they','Where are they from? Responde con they y elige un país o ciudad.', 'They are from Colombia.',originRule,[],'they are from');
 }
 return result;
}
const norm=(value:string)=>value.normalize('NFKC').replace(/[‘’]/g,"'").toLowerCase().replace(/\b(he|she|it)'s\b/g,'$1 is').replace(/\b(they|you|we)'re\b/g,'$1 are').replace(/\bi'm\b/g,'i am').replace(/[.?!,]/g,'').replace(/\s+/g,' ').trim();
export function gradeGrammar(ex:WritingExercise,answer:string):Grade{
 const value=norm(answer);const fail=(reason:string)=>({correct:false,explanation:reason,example:ex.example});
 if(ex.alternatives.some(a=>norm(a)===value))return {correct:true,explanation:'Correcto: el orden de la pregunta y la concordancia coinciden con el sujeto.',example:ex.example};
 if(ex.grammarPrefix){const prefix=ex.grammarPrefix;
  if(value.startsWith(prefix+' ')){
   const location=value.slice(prefix.length+1);
   if(/^[\p{L}][\p{L}'-]*(?: [\p{L}][\p{L}'-]*){0,7}$/u.test(location)&&! /\b(?:was|were|is|are|am|born|from|in|he|she|they|i|and|because|not)\b/.test(location))return {correct:true,explanation:'La estructura es correcta. El lugar es libre y no se comprueba como dato biográfico.',example:ex.example};
   return fail('Después de la estructura escribe un país o ciudad. No se comprueban oraciones adicionales en este ejercicio.');
  }
  const subject=prefix.split(' ')[0];
  if(!value.startsWith(subject+' '))return fail(`La consigna pide responder con ${subject}. Empieza con «${prefix} …».`);
  return fail(`Revisa el verbo y las preposiciones: la estructura esperada es «${prefix} + lugar». ${ex.hint}`);
 }
 return fail(`Revisa was/were o is/are y el orden de las palabras. ${ex.hint} Conserva el sujeto indicado en la pregunta.`);
}
