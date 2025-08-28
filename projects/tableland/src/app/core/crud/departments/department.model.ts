type DepartmentBase = {
  name: string;
};

export type DepartmentCreate = DepartmentBase;
export type DepartmentUpdate = DepartmentBase & {
  id: number;
};

export type Department = DepartmentBase & {
  id: number;
};
