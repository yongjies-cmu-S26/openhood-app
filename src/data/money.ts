import type { CostLine } from './types';

export function sumLines(lines: CostLine[]): number {
  return lines.reduce((sum, line) => sum + line.amount, 0);
}

export function formatMoney(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatWhole(cents: number): string {
  return cents % 100 === 0 ? '$' + (cents / 100).toLocaleString('en-US') : formatMoney(cents);
}
