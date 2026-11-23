export const SUGGESTED = ['Why both pads?', 'Can it wait?', 'What does it cost?'] as const;

export interface Reply {
  text: string;
  /** 0 means a text reply; above 0 means a voice note of that length */
  durationSec: number;
}

const REPLIES: Record<string, Reply> = {
  'Why both pads?': { text: 'Pads are replaced in pairs so both front wheels brake evenly. Replacing one side can make the car pull.', durationSec: 18 },
  'Can it wait?': { text: 'I wouldn’t wait long. At 3 mm the pads are below the 4 mm minimum, and waiting risks damaging the rotor.', durationSec: 21 },
  'What does it cost?': { text: 'Front pads are $260 total: $140 parts, $100 labor and $20 tax. You pay at pickup.', durationSec: 15 },
};

export const GENERIC_REPLY: Reply = {
  text: 'Thanks, I’ll answer as soon as I’m off the lift. Usually within 15 minutes.',
  durationSec: 0,
};

export function replyFor(question: string): Reply {
  return REPLIES[question] ?? GENERIC_REPLY;
}
