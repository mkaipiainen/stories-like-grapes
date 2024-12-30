export const ACTIONS = {
  WATER: 'WATER',
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];
