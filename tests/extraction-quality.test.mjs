import test from 'node:test';
import assert from 'node:assert/strict';
import {needsOcr,chooseExtraction,preferSecondOcr} from '../src/lib/extractionQuality.ts';
test('a readable header does not hide the scanned body of a worksheet',()=>{
 const header='Lesson nine. Answer the following questions.';
 assert(needsOcr(header,true,false));
 assert(!needsOcr(header,false,false));
 assert(needsOcr(header,false,true));
});
test('native text is preserved when recognition loses content',()=>{
 const native='She was born in Mexico. He was born in Canada.';
 assert.equal(chooseExtraction(native,'Unreadable',40,false),'text');
 assert.equal(chooseExtraction(native,native.repeat(3),85,false),'ocr');
 assert.equal(chooseExtraction(native,'Forced scan',40,true),'ocr');
});
test('second OCR must recover more words without a large confidence loss',()=>{
 const first={text:'He is from Canada.',confidence:78};
 assert(preferSecondOcr(first,{text:'He is from Canada. She was born in Mexico.',confidence:80}));
 assert(!preferSecondOcr(first,{text:'He is from Canada. She was born in Mexico.',confidence:40}));
 assert(!preferSecondOcr(first,{text:'He is from Canada.',confidence:90}));
});
