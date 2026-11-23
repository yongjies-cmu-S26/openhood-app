import { FINDINGS } from '../data/findings';
import { sumLines } from '../data/money';
import type { Decisions, Finding } from '../data/types';

export type Stage = 'review' | 'repair' | 'pickup';

export function findingTotal(finding: Finding): number {
  return sumLines(finding.costLines);
}

export function approvedTotal(decisions: Decisions): number {
  return FINDINGS.filter((f) => decisions[f.id] === 'approved').reduce((sum, f) => sum + findingTotal(f), 0);
}

export function allDecided(decisions: Decisions): boolean {
  return FINDINGS.every((f) => decisions[f.id] !== undefined);
}

export function undecided(decisions: Decisions): Finding[] {
  return FINDINGS.filter((f) => decisions[f.id] === undefined);
}

export function visitStage(decisions: Decisions): Stage {
  if (!allDecided(decisions)) return 'review';
  return FINDINGS.some((f) => decisions[f.id] === 'approved') ? 'repair' : 'pickup';
}

export function statusCounts(): { attention: number; soon: number } {
  return {
    attention: FINDINGS.filter((f) => f.status === 'attention').length,
    soon: FINDINGS.filter((f) => f.status === 'soon').length,
  };
}
