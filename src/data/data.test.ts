import { sumLines, formatMoney, formatWhole } from './money';
import { FINDINGS, getFinding } from './findings';
import { getTerm, GLOSSARY } from './glossary';
import { replyFor, SUGGESTED, GENERIC_REPLY } from './techReplies';

test('money helpers', () => {
  expect(sumLines([{ label: 'a', amount: 14000 }, { label: 'b', amount: 12000 }])).toBe(26000);
  expect(formatMoney(26000)).toBe('$260.00');
  expect(formatMoney(123456)).toBe('$1,234.56');
  expect(formatWhole(26000)).toBe('$260');
  expect(formatWhole(26050)).toBe('$260.50');
});

test('findings match the spec totals', () => {
  expect(FINDINGS.map((f) => f.id)).toEqual(['brake-pads', 'tire-tread']);
  expect(sumLines(getFinding('brake-pads')!.costLines)).toBe(26000);
  expect(sumLines(getFinding('tire-tread')!.costLines)).toBe(23500);
  expect(getFinding('nope')).toBeUndefined();
  for (const f of FINDINGS) {
    expect(f.timing.map((t) => t.key)).toEqual(['now', '3m', '6m']);
    expect(getTerm(f.helpTerm)).toBeDefined();
  }
});

test('glossary and replies', () => {
  expect(GLOSSARY).toHaveLength(3);
  expect(getTerm('nope')).toBeUndefined();
  for (const q of SUGGESTED) expect(replyFor(q).durationSec).toBeGreaterThan(0);
  expect(replyFor('anything else')).toBe(GENERIC_REPLY);
});
