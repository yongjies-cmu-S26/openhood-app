export type FindingId = 'brake-pads' | 'tire-tread';
export type FindingStatus = 'attention' | 'soon';
export type View = 'front-left' | 'rear-right';
export type Tone = 'attention' | 'soon' | 'ok' | 'info';
export type HelpTermId = 'brake-pad' | 'brake-disc' | 'tire-tread';
export type Decision = 'approved' | 'declined';
export type Decisions = Partial<Record<FindingId, Decision>>;
export type TimingKey = 'now' | '3m' | '6m';

export interface CostLine {
  label: string;
  /** cents */
  amount: number;
}

export interface TimingOption {
  key: TimingKey;
  label: string;
  risk: string;
  costText: string;
  tone: 'ok' | 'soon' | 'attention';
}

export interface Marker {
  /** position in the 320 x 200 car drawing */
  x: number;
  y: number;
  /** true when the part is on the far side of the car in this view */
  far: boolean;
}

export interface Finding {
  id: FindingId;
  number: 1 | 2;
  title: string;
  status: FindingStatus;
  location: string;
  markers: Record<View, Marker>;
  summary: string;
  whatIsWrong: string;
  impact: string;
  recommendation: string;
  measurement: string;
  helpTerm: HelpTermId;
  costLines: CostLine[];
  timing: TimingOption[];
}

export interface GlossaryEntry {
  id: HelpTermId;
  title: string;
  body: string;
  why: string;
}

export interface Message {
  id: string;
  from: 'customer' | 'technician';
  kind: 'text' | 'voice';
  text: string;
  at: string;
  durationSec?: number;
  /** data: URL of a real recording (customer voice questions) */
  audioUrl?: string;
}
