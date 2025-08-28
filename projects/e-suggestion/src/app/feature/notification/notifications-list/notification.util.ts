import { RoleEnum, User } from '../../../core/auth/data-access/auth.model';

export const loadNotificationInitialQueryParams = (loggedInUser: User) => {
  // Admins roles => all notifications
  const userRoles = loggedInUser.roles.map(r => r.name);

  if (
    userRoles.includes(RoleEnum.SYSTEM_ADMIN) ||
    userRoles.includes(RoleEnum.TEOA)
  )
    return {
      sort__created_at: 'desc',
    };
  // other users => only their comments
  else
    return {
      user_id__eq: loggedInUser.id,
      sort__created_at: 'desc',
    };
};
