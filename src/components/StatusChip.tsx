import type { Decision, FindingStatus, Tone } from '../data/types';

const TONE_CLASS: Record<Tone, string> = {
  attention: 'oh-status--red',
  soon: 'oh-status--amber',
  ok: 'oh-status--ok',
  info: 'oh-status--info',
};

export const STATUS_LABEL: Record<FindingStatus, string> = {
  attention: 'Needs attention',
  soon: 'Plan soon',
};

export function StatusChip({ tone, label }: { tone: Tone; label: string }) {
  return <span className={`oh-status ${TONE_CLASS[tone]}`}>{label}</span>;
}

export function FindingStatusChip({ status }: { status: FindingStatus }) {
  return <StatusChip tone={status} label={STATUS_LABEL[status]} />;
}

export function DecisionChip({ decision }: { decision: Decision }) {
  return decision === 'approved' ? <StatusChip tone="ok" label="Approved" /> : <StatusChip tone="info" label="Declined" />;
}
