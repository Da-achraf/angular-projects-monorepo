type RoleBase = {
  name: string;
};

export type RoleCreate = RoleBase;
export type RoleUpdate = RoleBase & {
  id: number;
};

export type Role = RoleBase & {
  id: number;
};
