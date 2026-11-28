import type { Finding } from './types';

export const FINDINGS: Finding[] = [
  {
    id: 'brake-pads',
    number: 1,
    title: 'Front brake pads',
    status: 'attention',
    location: 'Front left wheel',
    markers: {
      'front-left': { x: 88, y: 150, far: false },
      'rear-right': { x: 252, y: 98, far: true },
    },
    hotspot: {
      position: '0.62m 0.25m 0.66m',
      normal: '1m 0m 0m',
      preset: 'front-left',
    },
    summary: 'The pads are worn thin. Your shop recommends replacing the front pair to restore braking.',
    whatIsWrong: 'Front brake pads are worn thin from normal use.',
    impact: 'Replacing worn pads helps restore predictable braking and stopping response.',
    recommendation: 'Replace both front pads.',
    measurement: '3 mm measured · minimum 4 mm',
    helpTerm: 'brake-pad',
    costLines: [
      { label: 'Parts', amount: 14000 },
      { label: 'Labor · 1.0 hr', amount: 10000 },
      { label: 'Tax', amount: 2000 },
    ],
    timing: [
      { key: 'now', label: 'Now', risk: 'Replacing pads now protects the brake disc (rotor) from further wear.', costText: 'Now · $260', tone: 'ok' },
      { key: '3m', label: '3 months', risk: 'Pads keep wearing and braking response drops.', costText: 'Est. $260–$330', tone: 'soon' },
      { key: '6m', label: '6 months', risk: 'Metal can reach the rotor, and the rotor may need replacing.', costText: 'Est. $310–$520', tone: 'attention' },
    ],
  },
  {
    id: 'tire-tread',
    number: 2,
    title: 'Rear tire tread',
    status: 'soon',
    location: 'Rear right wheel',
    markers: {
      'front-left': { x: 252, y: 98, far: true },
      'rear-right': { x: 88, y: 150, far: false },
    },
    hotspot: {
      position: '-0.62m 0.25m -0.66m',
      normal: '-1m 0m 0m',
      preset: 'rear-right',
    },
    summary: 'The rear right tire tread is getting shallow. Plan a replacement before the rainy season.',
    whatIsWrong: 'Tread on the rear right tire is worn close to the limit.',
    impact: 'Shallow tread takes longer to stop and grips less on wet roads.',
    recommendation: 'Replace the rear right tire within 3 months.',
    measurement: '3/32 in measured · minimum 2/32 in',
    helpTerm: 'tire-tread',
    costLines: [
      { label: 'Parts · 1 tire', amount: 16000 },
      { label: 'Labor · 0.6 hr', amount: 6000 },
      { label: 'Tax', amount: 1500 },
    ],
    timing: [
      { key: 'now', label: 'Now', risk: 'Lowest risk. Full grip in wet weather.', costText: 'Now · $235', tone: 'ok' },
      { key: '3m', label: '3 months', risk: 'Grip in rain drops as the tread wears.', costText: 'Est. $235', tone: 'soon' },
      { key: '6m', label: '6 months', risk: 'Tread reaches the legal limit. Replace before winter.', costText: 'Est. $235–$260', tone: 'attention' },
    ],
  },
];

export function getFinding(id: string | undefined): Finding | undefined {
  return FINDINGS.find((f) => f.id === id);
}
