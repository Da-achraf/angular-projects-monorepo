type MachineBase = {
  name: string;
};

export type MachineCreate = MachineBase & {
  area_id?: number;
};
export type MachineUpdate = MachineCreate & {
  id: number;
};

export type Machine = MachineBase & {
  id: number;
};
