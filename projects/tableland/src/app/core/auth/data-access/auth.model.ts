import { BU } from '../../crud/bus/bu.model';
import { Department } from '../../crud/departments/department.model';
import { Plant } from '../../crud/plants/plant.model';
import { Role } from './role.model';

type BaseUser = {
  first_name: string;
  last_name: string;
  te_id: string;
  email: string;
};

export type User = BaseUser & {
  id: number;
  account_status: boolean;
  full_name: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
  bu: BU | null;
  plant: Plant | null;
  department: Department | null;
};

export type UpdateUser = BaseUser & {
  id: number;
  account_status: boolean;
  role_id: number;
  bu_id: number | null;
  plant_id: number | null;
  department_id: number | null;
};

export type LoginUser = {
  username: string;
  password: string;
};

export type RegisterUser = BaseUser & {
  password: string;
  bu_id: number | null;
  plant_id: number | null;
  department_id: number | null;
  role_id: number | null;
};

export const RoleEnum = {
  SUBMITTER: 'submitter',
  COMMITTEE: 'committee',
  TEOA: 'teoa',
  SYSTEM_ADMIN: 'system-admin',
  ALL: '*',
} as const;

export type RoleEnumType = (typeof RoleEnum)[keyof typeof RoleEnum];

// Mapping of roles to their user-friendly display names
export const RoleDisplayNames = {
  [RoleEnum.SUBMITTER]: 'Idea Submitter',
  [RoleEnum.COMMITTEE]: 'Committee Member',
  [RoleEnum.TEOA]: 'TEOA',
  [RoleEnum.SYSTEM_ADMIN]: 'System Administrator',
  [RoleEnum.ALL]: 'All',
} as const;
// Type for role display names
export type RoleDisplayNameType =
  (typeof RoleDisplayNames)[keyof typeof RoleDisplayNames];

type UserState = User & { token: string };

export type AuthState = {
  initialized: boolean; // whether the auth state data is initialized or not
  loggedIn: boolean;
  user: UserState;
};

export const initialUserValue: UserState = {
  id: 0,
  first_name: '',
  last_name: '',
  full_name: '',
  te_id: '',
  email: '',
  roles: [{ id: 1, name: 'all' }],
  token: '',
  account_status: false,
  created_at: '',
  updated_at: '',
  bu: null,
  plant: null,
  department: null,
};

export const authInitialState: AuthState = {
  initialized: false,
  loggedIn: false,
  user: initialUserValue,
};
