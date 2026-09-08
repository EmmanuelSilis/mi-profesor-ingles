import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanText, usableText, analyzeCourse, normalizeAnswer } from '../src/lib/course.ts';

test('damaged layers trigger OCR while readable English and Spanish survive', () => {
  assert.equal(usableText('Mr. Perez was born in Me-x�e,o. '.repeat(5)), false);
  assert.equal(usableText('This is Mr. Stephenson. His name is Robert. He is the father.'), true);
  assert.equal(usableText('Gramática: ¿Dónde está la lección? Aquí está el vocabulario.'), true);
  assert.equal(usableText(''), false);
});
test('cleanup preserves content and line boundaries', () => {
  assert.equal(cleanText('  Hello   world.\r\n\n71\n @ VOCABULARY\nfa-\nmily'), 'Hello world.\n\nVOCABULARY\nfamily');
});
test('cards retain document provenance and do not invent answers to open questions', () => {
  const course = analyzeCourse([{page: 2, method: 'ocr', text: 'Lesson ten\nTHE STEPHENSON FAMILY\nThis is Mr. Stephenson. This is Mrs. Stephenson.\nHe is the father.\nWho is the mother?\n1. Where is he from? ______\n~ garbled | bits\nShe is from Me�ico.'}], 'lesson.pdf');
  assert.equal(course.cards.length, 3);
  assert(course.units.some(u=>u.topics.includes('THE STEPHENSON FAMILY')));
  for (const card of course.cards) {
    assert.equal(card.page, 2);
    assert(course.pages[0].text.includes(card.source));
    assert(card.source.includes(card.back));
    assert.equal(card.front.replace('_____', card.back), card.source);
    assert(!card.source.includes('?'));
  }
  assert(course.cards.some(c=>c.source === 'This is Mr. Stephenson.'));
});
test('empty or instruction-only pages generate no cards', () => {
  const course=analyzeCourse([{page:1,method:'ocr',text:'ANSWER THE FOLLOWING QUESTIONS\n____\n7\n'}], 'empty.pdf');
  assert.equal(course.cards.length,0);
});
test('comparison tolerates case, spacing and punctuation, not different words',()=>{
  assert.equal(normalizeAnswer('  Robert! '),normalizeAnswer('robert'));
  assert.notEqual(normalizeAnswer('father'),normalizeAnswer('mother'));
});
