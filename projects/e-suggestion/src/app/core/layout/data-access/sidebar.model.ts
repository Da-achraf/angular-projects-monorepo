import { RoleEnum, RoleEnumType } from '../../auth/data-access/auth.model';

export interface SidebarItem {
  label: string;
  icon: string;
  link: string;
  isMenu: boolean;
  children?: SidebarItem[];
  allowedRoles?: RoleEnumType[];
  menuVisible?: boolean;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'home',
    icon: 'fa-house',
    link: '/app/home',
    isMenu: false,
    allowedRoles: [RoleEnum.ALL],
  },
  {
    label: 'ideas',
    icon: 'fa-list-check',
    link: '/app/ideas/list',
    isMenu: false,
    allowedRoles: [RoleEnum.ALL],
  },
  {
    label: 'assigned-ideas',
    icon: 'fa-bookmark',
    link: '/app/ideas/assigned',
    isMenu: false,
    allowedRoles: [RoleEnum.SUBMITTER],
  },
  {
    label: 'users',
    icon: 'fa-users',
    link: '/app/users',
    isMenu: false,
    allowedRoles: [RoleEnum.SYSTEM_ADMIN, RoleEnum.TEOA],
  },
  {
    label: 'configuration',
    icon: 'fa-gears',
    link: '#',
    isMenu: true,
    allowedRoles: [RoleEnum.SYSTEM_ADMIN, RoleEnum.TEOA],
    children: [
      {
        label: 'business-units',
        icon: 'fa-briefcase',
        link: '/app/config/bus',
        isMenu: false,
      },
      {
        label: 'plant',
        icon: 'fa-building',
        link: '/app/config/plants',
        isMenu: false,
      },
    ],
  },
  {
    label: 'Notifications',
    icon: 'fa-bell',
    link: '/app/notifications',
    isMenu: false,
    allowedRoles: [RoleEnum.ALL],
  },
];
