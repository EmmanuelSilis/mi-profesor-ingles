import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyPlan, progressiveHints } from '../src/lib/daily.ts';
const now = Date.parse('2026-09-08T12:00:00Z');
test('daily class works without imports and provides progressive help', () => {
  const plan = dailyPlan([], {}, now);
  assert.equal(plan.length, 10);
  assert(plan.every(p => !p.review));
  const hints = progressiveHints(plan[0].exercise);
  assert.equal(hints.length, 3);
  assert(!hints[0].includes('am'));
  assert(hints[2].includes(plan[0].exercise.example));
});
test('errors have priority and a recent correct answer waits until due', () => {
  const plan = dailyPlan([], {}, now);
  const item = plan[5];
  const attempt = { cardId: item.exercise.id, correct: false, answer: 'oops', mode: 'daily', at: new Date(now).toISOString() };
  const history = { [item.course.id]: [attempt] };
  assert.equal(dailyPlan([], history, now)[0].exercise.id, item.exercise.id);
  history[item.course.id].push({ ...attempt, correct: true });
  assert(!dailyPlan([], history, now).some(p => p.exercise.id === item.exercise.id));
  assert.equal(dailyPlan([], history, now + 86400000)[0].exercise.id, item.exercise.id);
});
test('successive correct answers increase review interval to three days', () => {
  const item = dailyPlan([], {}, now)[0];
  const attempt = { cardId: item.exercise.id, correct: true, answer: 'am', mode: 'daily', at: new Date(now).toISOString() };
  const history = { [item.course.id]: [attempt, attempt] };
  assert(!dailyPlan([], history, now + 86400000).some(p => p.exercise.id === item.exercise.id));
  assert.equal(dailyPlan([], history, now + 3*86400000)[0].exercise.id, item.exercise.id);
});
