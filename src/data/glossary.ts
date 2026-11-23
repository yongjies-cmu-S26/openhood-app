import type { GlossaryEntry } from './types';

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: 'brake-pad',
    title: 'Brake pad',
    body: 'Brake pads are the friction blocks that squeeze the brake disc when you press the pedal. They wear down a little every time you stop, so they are replaced regularly.',
    why: 'Thin pads take longer to stop the car and can damage the brake disc.',
  },
  {
    id: 'brake-disc',
    title: 'Brake disc (rotor)',
    body: 'The brake disc, also called the rotor, is the metal plate that spins with the wheel. The pads press on it to slow the car.',
    why: 'If pads wear through, metal grinds on the disc and it may need replacing too.',
  },
  {
    id: 'tire-tread',
    title: 'Tire tread',
    body: 'Tread is the patterned rubber that touches the road. The grooves push water away so the tire keeps its grip.',
    why: 'Shallow tread grips less on wet roads and takes longer to stop.',
  },
];

export function getTerm(id: string | undefined): GlossaryEntry | undefined {
  return GLOSSARY.find((t) => t.id === id);
}
