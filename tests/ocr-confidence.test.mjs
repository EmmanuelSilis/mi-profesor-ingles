import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeCourse } from '../src/lib/course.ts';
test('uncertain OCR lines are not turned into study answers',()=>{
 const c=analyzeCourse([{page:1,method:'ocr',text:'New York is a very famovs city.\nShe is the mother.',uncertainLines:['New York is a very famovs city.']}],'scan.pdf');
 assert.equal(c.cards.length,1); assert.equal(c.cards[0].back,'mother');
});
