type CategoryBase = {
  name: string;
};

export type CategoryCreate = CategoryBase;
export type CategoryUpdate = CategoryBase & {
  id: number;
};

export type Category = CategoryBase & {
  id: number;
};
