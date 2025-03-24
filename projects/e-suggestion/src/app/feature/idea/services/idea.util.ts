import { RoleEnum, User } from '../../../core/auth/data-access/auth.model';

export const loadIdeaInitialQueryParams = (loggedInUser: User) => {
  // Admins roles => all ideas
  const userRoles = loggedInUser.roles.map((r) => r.name);
  
  if (
    userRoles.includes(RoleEnum.SYSTEM_ADMIN) ||
    userRoles.includes(RoleEnum.TEOA)
  )
    return {};
  // Comittee => his plant's ideas
  else if (userRoles.includes(RoleEnum.COMMITTEE))
    return {
      submitter__plant_id__eq: loggedInUser.plant?.id,
    };
    
  // Sumbitter => only his ideas
  else
    return {
      submitter_id__eq: loggedInUser.id,
    };
};
