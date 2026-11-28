import { ADVISOR_VISITS, getAdvisorVisit, inspectionUpdateLinks, type UpdateChannel, type VisitStatus } from '../data/advisorVisits';
import { FINDINGS } from '../data/findings';
import type { Decisions } from '../data/types';
import { VISIT } from '../data/visit';
import { allDecided, approvedTotal } from './selectors';

export interface SentUpdate {
  sentAt: number;
  channel: UpdateChannel;
  links: ReturnType<typeof inspectionUpdateLinks>;
}

export interface VisitProgress {
  status: VisitStatus;
  enteredAt: number;
  update?: SentUpdate;
}

export interface DecisionRecord {
  decisions: Decisions;
  approvedAmount: number;
  confirmedAt: number;
}

export interface AdvisorNotification {
  id: number;
  record: DecisionRecord;
  unread: boolean;
}

export interface Workflow {
  visits: Record<string, VisitProgress>;
  confirmation: DecisionRecord | null;
  notifications: AdvisorNotification[];
}

export const CAMERAS = ['overview', 'front-wheel'] as const;
export type Camera = (typeof CAMERAS)[number];
export const CAMERA_LABELS: Record<Camera, string> = {
  overview: 'Camera 1 · Bay overview',
  'front-wheel': 'Camera 2 · Front-wheel camera',
};

export interface CameraOutage {
  bay: string;
  camera: Camera;
  at: number;
}

export interface LiveSession {
  camera: Camera;
  outages: CameraOutage[];
}

export function createWorkflow(now: number): Workflow {
  return {
    visits: Object.fromEntries(ADVISOR_VISITS.map((visit) => [
      visit.id,
      { status: visit.initialStatus, enteredAt: now - visit.waitingMinutes * 60_000 },
    ])),
    confirmation: null,
    notifications: [],
  };
}

export function sendInspectionUpdate(workflow: Workflow, id: string, sentAt: number): Workflow {
  const visit = getAdvisorVisit(id);
  const progress = workflow.visits[id];
  if (!visit || progress?.status !== 'needs-update') return workflow;

  return {
    ...workflow,
    visits: {
      ...workflow.visits,
      [id]: {
        status: 'waiting',
        enteredAt: sentAt,
        update: { sentAt, channel: visit.channel, links: inspectionUpdateLinks(id) },
      },
    },
  };
}

export function matchesConfirmation(record: DecisionRecord | null, decisions: Decisions) {
  return record !== null && FINDINGS.every(({ id }) => record.decisions[id] === decisions[id]);
}

export function currentConfirmation(workflow: Workflow): DecisionRecord | null {
  // A newly sent update needs its own confirmation, even if the choices stay the same.
  return workflow.visits[VISIT.ro].status === 'waiting' ? null : workflow.confirmation;
}

export function confirmDecisions(workflow: Workflow, decisions: Decisions, confirmedAt: number): Workflow {
  if (!allDecided(decisions) || matchesConfirmation(currentConfirmation(workflow), decisions)) return workflow;

  const approvedAmount = approvedTotal(decisions);
  const record = { decisions: { ...decisions }, approvedAmount, confirmedAt };
  const progress = workflow.visits[VISIT.ro];

  return {
    visits: {
      ...workflow.visits,
      [VISIT.ro]: {
        ...progress,
        status: approvedAmount > 0 ? 'repair' : 'needs-update',
        enteredAt: confirmedAt,
      },
    },
    confirmation: record,
    notifications: [{ id: workflow.notifications.length + 1, record, unread: true }, ...workflow.notifications],
  };
}
