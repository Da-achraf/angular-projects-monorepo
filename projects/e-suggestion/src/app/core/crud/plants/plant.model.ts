type PlantBase = {
  name: string;
};

export type PlantCreate = PlantBase;
export type PlantUpdate = PlantBase & {
  id: number;
};

export type Plant = PlantBase & {
  id: number;
};
