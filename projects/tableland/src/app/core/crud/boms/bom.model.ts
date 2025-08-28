// src/app/models/bom.model.ts (or wherever your models are stored)

type BOMBase = {
  pn: string;
  op: string;
  workstation: string;
  component: string;
};

export type BOMCreate = BOMBase;

export type BOMUpdate = BOMBase & {
  id: number;
};

export type BOM = BOMBase & {
  id: number;
};
