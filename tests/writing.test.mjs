import test from 'node:test';
import assert from 'node:assert/strict';
import { writingExercises, gradeWriting } from '../src/lib/writing.ts';
const course={id:'c',fileName:'lesson.pdf',pages:[],units:[],createdAt:'',cards:[{id:'1',source:'He is the father.',hint:'lesson.pdf · página 1'},{id:'2',source:"He is Ann's husband.",hint:'lesson.pdf · página 1'}]};
const exercises=writingExercises(course), female=exercises.find(e=>e.kind==='identity'&&e.pronoun==='she'), male=exercises.find(e=>e.kind==='identity'&&e.pronoun==='he');
test('accepts variable names and contractions without checking celebrity facts',()=>{
 for (const answer of ['She is Adele.', "She's Taylor Swift.", 'Diana López is an American singer.', 'Lady Gaga is an American female singer.']) assert.equal(gradeWriting(female,answer).correct,true,answer);
 assert.equal(gradeWriting(male,'He is Carlos Santana.').correct,true);
});
test('wrong gender and agreement receive specific feedback',()=>{
 assert.match(gradeWriting(male,'She is Bruno Mars.').explanation,/Usa he, no she/);
 assert.match(gradeWriting(female,'He is Adele.').explanation,/Usa she, no he/);
 assert.match(gradeWriting(female,'She are Adele.').explanation,/es is/);
 assert.equal(gradeWriting(female,'Alex is an American male singer.').correct,false);
});
test('rejects missing verb, bare names, extra clauses and wrong articles',()=>{
 for(const answer of ['Adele','She Adele','She is Adele are singer','Taylor is a American singer','They are Adele','She is an American singer','']) assert.equal(gradeWriting(female,answer).correct,false,answer);
});
test('PDF family translation keeps meaning, accepts possessive alternatives',()=>{
 const possessive=exercises.find(e=>e.source.includes('Ann'));
 assert.equal(gradeWriting(possessive,"He's Ann's husband.").correct,true);
 assert.equal(gradeWriting(possessive,'He is the husband of Ann.').correct,true);
 for(const answer of ["She is Ann's husband.","He is Ann husband.","He is Mary's husband.","He is Ann's brother."]) assert.equal(gradeWriting(possessive,answer).correct,false,answer);
 assert.match(possessive.context,/lesson.pdf/);
});
test('supplemental examples are marked separately and old courses need no migration',()=>{
 assert.match(female.context,/Práctica adicional/);
 assert.equal(writingExercises({...course,cards:[]}).length,2);
 assert.equal(gradeWriting(exercises[0],'He is the mother.').correct,false);
});
