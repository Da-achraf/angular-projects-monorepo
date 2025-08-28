type BUBase = {
  name: string;
};

export type BUCreate = BUBase;
export type BUUpdate = BUBase & {
  id: number;
};

export type BU = BUBase & {
  id: number;
};
