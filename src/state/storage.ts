import { ADVISOR_VISITS, inspectionUpdateLinks, VISIT_STATUSES } from '../data/advisorVisits';
import { initialState, type State } from './reducer';
import { CAMERAS, type DecisionRecord, type LiveSession, type Workflow } from './workflow';

export const STORAGE_KEY = 'openhood.v1';
const IDS = ['brake-pads', 'tire-tread'];
const DECISIONS = ['approved', 'declined'];

export function safeStorage(): Storage | null {
  try {
    const s = window.localStorage;
    s.setItem('__oh_probe', '1');
    s.removeItem('__oh_probe');
    return s;
  } catch {
    return null;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}

function isTimestamp(value: unknown): value is number {
  return isSafeInteger(value) && Math.abs(value) <= 8_640_000_000_000_000;
}

function isDecisions(value: unknown): value is State['decisions'] {
  return isObject(value) && Object.entries(value).every(([id, decision]) => IDS.includes(id) && DECISIONS.includes(decision as string));
}

function isDecisionRecord(value: unknown): value is DecisionRecord {
  return isObject(value) && isDecisions(value.decisions) && Object.keys(value.decisions).length === IDS.length
    && isSafeInteger(value.approvedAmount) && value.approvedAmount >= 0 && isTimestamp(value.confirmedAt);
}

function isWorkflow(value: unknown): value is Workflow {
  if (!isObject(value) || !isObject(value.visits)) return false;
  const visits = value.visits;
  return ADVISOR_VISITS.every((visit) => {
    const progress = visits[visit.id];
    if (!isObject(progress) || !VISIT_STATUSES.some((status) => status === progress.status) || !isTimestamp(progress.enteredAt)) return false;
    const update = progress.update;
    if (update === undefined) return true;
    const links = inspectionUpdateLinks(visit.id);
    return isObject(update) && update.channel === visit.channel && isTimestamp(update.sentAt)
      && isObject(update.links) && update.links.inspection === links.inspection && update.links.estimate === links.estimate;
  }) && (value.confirmation === null || isDecisionRecord(value.confirmation))
    && Array.isArray(value.notifications) && value.notifications.every((entry) =>
      isObject(entry) && isSafeInteger(entry.id) && isDecisionRecord(entry.record) && typeof entry.unread === 'boolean');
}

function isLiveSession(value: unknown): value is LiveSession {
  return isObject(value) && CAMERAS.some((camera) => camera === value.camera)
    && Array.isArray(value.outages) && value.outages.every((entry) =>
      isObject(entry) && typeof entry.bay === 'string' && CAMERAS.some((camera) => camera === entry.camera) && isTimestamp(entry.at));
}

export function loadState(storage: Storage | null = safeStorage(), fallback = initialState): State {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed) || !isDecisions(parsed.decisions)
      || !Array.isArray(parsed.messages) || !parsed.messages.every((message) => isObject(message) && typeof message.text === 'string')
      || !Array.isArray(parsed.seen) || !parsed.seen.every((id) => IDS.includes(id as string))) return fallback;

    return {
      decisions: parsed.decisions,
      messages: parsed.messages,
      seen: parsed.seen,
      workflow: isWorkflow(parsed.workflow) ? parsed.workflow : initialState.workflow,
      live: isLiveSession(parsed.live) ? parsed.live : initialState.live,
    };
  } catch {
    return fallback;
  }
}

export function saveState(state: State, storage: Storage | null = safeStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
