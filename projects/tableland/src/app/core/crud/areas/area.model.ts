import { Machine } from "../machines/machine.model";

type AreaBase = {
  name: string;
};

export type AreaCreate = AreaBase;
export type AreaUpdate = AreaBase & {
  id: number;
};

export type Area = AreaBase & {
  id: number;

  machines: Machine[]
};
