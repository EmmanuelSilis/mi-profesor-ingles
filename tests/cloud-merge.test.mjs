import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeAttempts } from '../src/lib/cloudMerge.ts';
test('cross-device progress merges idempotently and keeps distinct responses',()=>{
 const a={cardId:'1',correct:false,answer:'is',at:'2026-09-08T10:00:00Z',mode:'daily'};
 const b={...a,correct:true,answer:'am',at:'2026-09-08T11:00:00Z'};
 const result=mergeAttempts({lesson:[a]},{lesson:[a,b]});
 assert.deepEqual(result.lesson,[a,b]);assert.deepEqual(mergeAttempts(result,result),result);
 assert.deepEqual(mergeAttempts({other:[b]},result),{other:[b],lesson:[a,b]});
});
