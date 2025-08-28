type ThreeSBase = {
  pn: string;
  three_s: string;
  batch: string;
  date_: Date;
  time_: Date;
};

export type ThreeSCreate = ThreeSBase;
export type ThreeSUpdate = ThreeSBase & {
  id: number;
};

export type ThreeS = ThreeSBase & {
  id: number;
};
