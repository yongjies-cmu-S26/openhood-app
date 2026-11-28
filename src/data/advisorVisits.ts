import { FINDINGS } from './findings';
import { sumLines } from './money';
import type { FindingStatus } from './types';
import { VISIT } from './visit';

export const VISIT_STATUSES = ['needs-update', 'waiting', 'repair', 'pickup'] as const;
export type VisitStatus = (typeof VISIT_STATUSES)[number];
export type UpdateChannel = 'SMS' | 'Email';

export const STATUS_LABELS: Record<VisitStatus, string> = {
  'needs-update': 'Needs update',
  waiting: 'Waiting for approval',
  repair: 'Approved – in repair',
  pickup: 'Ready for pickup',
};

interface AdvisorFinding {
  title: string;
  status: FindingStatus;
  cost: number;
  note?: string;
}

export interface AdvisorVisit {
  id: string;
  customer: string;
  vehicle: string;
  bay: string;
  channel: UpdateChannel;
  initialStatus: VisitStatus;
  waitingMinutes: number;
  findings: AdvisorFinding[];
}

export const ADVISOR_VISITS: AdvisorVisit[] = [
  {
    id: VISIT.ro, customer: VISIT.customerName, vehicle: VISIT.vehicle, bay: VISIT.bay,
    channel: 'SMS', initialStatus: 'needs-update', waitingMinutes: 42,
    findings: FINDINGS.map((finding) => ({
      title: finding.title, status: finding.status, cost: sumLines(finding.costLines), note: finding.summary,
    })),
  },
  {
    id: 'RO-1051', customer: 'Marcus Chen', vehicle: '2020 Toyota RAV4', bay: 'Bay 04',
    channel: 'Email', initialStatus: 'needs-update', waitingMinutes: 28,
    findings: [
      { title: 'Battery replacement', status: 'attention', cost: 19500, note: 'The battery tested below its rated capacity.' },
      { title: 'Cabin air filter', status: 'soon', cost: 4500, note: 'The cabin filter is dirty and airflow is reduced.' },
    ],
  },
  {
    id: 'RO-1050', customer: 'David Kim', vehicle: '2021 Mazda CX-5', bay: 'Bay 03',
    channel: 'SMS', initialStatus: 'waiting', waitingMinutes: 35,
    findings: [{ title: 'Rear brake pads', status: 'attention', cost: 24500 }],
  },
  {
    id: 'RO-1046', customer: 'Elena Rodriguez', vehicle: '2019 Subaru Outback', bay: 'Bay 01',
    channel: 'SMS', initialStatus: 'waiting', waitingMinutes: 72,
    findings: [{ title: 'Front control arm', status: 'attention', cost: 48000 }],
  },
  {
    id: 'RO-1053', customer: 'Sarah Miller', vehicle: '2017 Volkswagen Golf', bay: 'Bay 06',
    channel: 'SMS', initialStatus: 'waiting', waitingMinutes: 18,
    findings: [{ title: 'Coolant hose leak', status: 'attention', cost: 18500 }],
  },
  {
    id: 'RO-1043', customer: 'James Wilson', vehicle: '2022 Ford Escape', bay: 'Bay 05',
    channel: 'SMS', initialStatus: 'repair', waitingMinutes: 54,
    findings: [
      { title: 'Front brake pads', status: 'attention', cost: 28500 },
      { title: 'Brake fluid service', status: 'soon', cost: 12000 },
    ],
  },
  {
    id: 'RO-1045', customer: 'Aisha Patel', vehicle: '2020 Hyundai Tucson', bay: 'Bay 07',
    channel: 'SMS', initialStatus: 'repair', waitingMinutes: 31,
    findings: [
      { title: 'Drive belt replacement', status: 'attention', cost: 17500 },
      { title: 'Engine air filter', status: 'soon', cost: 4000 },
    ],
  },
  {
    id: 'RO-1041', customer: 'Noah Thompson', vehicle: '2016 Toyota Camry', bay: 'Bay 08',
    channel: 'SMS', initialStatus: 'pickup', waitingMinutes: 16,
    findings: [{ title: 'Battery replacement', status: 'attention', cost: 19000 }],
  },
];

export function getAdvisorVisit(id: string | undefined) {
  return ADVISOR_VISITS.find((visit) => visit.id === id);
}

export function inspectionUpdateLinks(id: string) {
  if (id === VISIT.ro) return { inspection: '/inspect', estimate: '/review' };
  return { inspection: '/update/' + id, estimate: '/update/' + id + '?view=estimate' };
}
