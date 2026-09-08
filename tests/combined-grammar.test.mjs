import test from 'node:test';
import assert from 'node:assert/strict';
import { combineCourses } from '../src/lib/combine.ts';
import { grammarExercises, gradeGrammar } from '../src/lib/grammar.ts';
const base={id:'nine',fileName:'Lesson 9',pages:[{page:1,text:'Where was he born? He was born in Mexico. Where is he from?',method:'text'},{page:2,text:'Other content.',method:'text'}],cards:[{id:'card',page:1,source:'He was born in Mexico.',hint:'Lesson 9 · página 1'}],units:[{page:1,title:'Origin'}],createdAt:''};
test('combines selected pages without mutating originals and retains provenance',()=>{
 const ten={...base,id:'ten',fileName:'Lesson 10',pages:[{page:1,text:'She is the mother.',method:'text'}],cards:[{id:'ten-card',page:1,source:'She is the mother.',hint:'Lesson 10 · página 1'}]};
 const c=combineCourses([base,ten],[{courseId:'nine',pages:[1]},{courseId:'ten',pages:[1]}],'Mixed');
 assert.equal(c.pages.length,2);assert.equal(c.pages[0].sourceName,'Lesson 9');assert.equal(c.cards.length,2);assert.equal(new Set(c.cards.map(x=>x.id)).size,2);assert.equal(base.pages.length,2);
 assert.equal(JSON.parse(JSON.stringify(c)).selections.length,2);
 assert.throws(()=>combineCourses([base],[{courseId:'nine',pages:[]}],''));
});
test('grammar appears only when relevant selected material contains the structure',()=>{
 assert.equal(grammarExercises({...base,pages:[base.pages[1]]}).length,0);
 assert.equal(grammarExercises(base).length,11);
 assert.notEqual(grammarExercises(base,0)[0].prompt,grammarExercises(base,1)[0].prompt);
 assert.match(grammarExercises(base)[0].context,/Ejemplo nuevo y ficticio/);
});
test('teaches teacher singular, coordinated subjects plural, and question order',()=>{
 const es=grammarExercises(base);const teacher=es.find(e=>e.id.includes('teacher'));
 assert.equal(gradeGrammar(teacher,'Where was').correct,true);assert.equal(gradeGrammar(teacher,'Where were').correct,false);
 assert.equal(gradeGrammar(es[1],'Where were Emma and Leo born?').correct,true);
 assert.equal(gradeGrammar(es[1],'Where was Emma and Leo born?').correct,false);
});
test('allows different places but rejects wrong pronoun, tense and extra clauses',()=>{
 const es=grammarExercises(base);const he=es.find(e=>e.grammarPrefix==='he was born in');
 assert.equal(gradeGrammar(he,'He was born in Buenos Aires.').correct,true);
 for(const answer of ['She was born in Peru.','He were born in Peru.','He is from Peru.','He was born in','He was born in Peru and is singer'])assert.equal(gradeGrammar(he,answer).correct,false,answer);
 const you=es.find(e=>e.grammarPrefix==='i was born in');assert.equal(gradeGrammar(you,'I was born in Chile').correct,true);
 const origin=es.find(e=>e.grammarPrefix==='she is from');assert.equal(gradeGrammar(origin,"She's from the USA.").correct,true);
});
