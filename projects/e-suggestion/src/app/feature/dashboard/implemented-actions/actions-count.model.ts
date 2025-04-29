export type ActionsCount = {
  [key: string]: { implemented: number; unimplemented: number };
};

export const MockData: ActionsCount = {
  Production: { implemented: 30, unimplemented: 62 },
  Quality: { implemented: 25, unimplemented: 45 },
  Process: { implemented: 20, unimplemented: 38 },
  'Tools Shop': { implemented: 15, unimplemented: 27 },
  Maintenance: { implemented: 28, unimplemented: 53 },
  'Tool & Die': { implemented: 14, unimplemented: 29 },
  Warehouse: { implemented: 10, unimplemented: 19 },
  SC: { implemented: 18, unimplemented: 33 },
  Other: { implemented: 8, unimplemented: 15 },
};
