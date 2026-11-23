import { approvedTotal, allDecided, visitStage, statusCounts, undecided, findingTotal } from './selectors';
import { FINDINGS } from '../data/findings';
import type { Decision, Decisions } from '../data/types';

type D = Decision | undefined;
const make = (brake: D, tire: D): Decisions => {
  const d: Decisions = {};
  if (brake) d['brake-pads'] = brake;
  if (tire) d['tire-tread'] = tire;
  return d;
};

// Mirrors the Figma "Decision summary" frames: U = undecided, A = approved, D = declined.
const CASES: [string, D, D, number, 'review' | 'repair' | 'pickup'][] = [
  ['UU', undefined, undefined, 0, 'review'],
  ['UA', undefined, 'approved', 23500, 'review'],
  ['UD', undefined, 'declined', 0, 'review'],
  ['AU', 'approved', undefined, 26000, 'review'],
  ['AA', 'approved', 'approved', 49500, 'repair'],
  ['AD', 'approved', 'declined', 26000, 'repair'],
  ['DU', 'declined', undefined, 0, 'review'],
  ['DA', 'declined', 'approved', 23500, 'repair'],
  ['DD', 'declined', 'declined', 0, 'pickup'],
];

test.each(CASES)('%s → total %i, stage %s', (_name, brake, tire, total, stage) => {
  const d = make(brake, tire);
  expect(approvedTotal(d)).toBe(total);
  expect(visitStage(d)).toBe(stage);
  expect(allDecided(d)).toBe(brake !== undefined && tire !== undefined);
});

test('finding totals, counts and undecided', () => {
  expect(FINDINGS.map(findingTotal)).toEqual([26000, 23500]);
  expect(statusCounts()).toEqual({ attention: 1, soon: 1 });
  expect(undecided(make('approved', undefined)).map((f) => f.id)).toEqual(['tire-tread']);
});
