import { RoleEnum, User } from '../../../core/auth/data-access/auth.model';

// export const loadIdeaInitialQueryParams = (loggedInUser: User) => {
//   // Admins roles => all ideas
//   const userRoles = loggedInUser.roles.map((r) => r.name);

//   if (
//     userRoles.includes(RoleEnum.SYSTEM_ADMIN) ||
//     userRoles.includes(RoleEnum.TEOA)
//   )
//     return {};
//   // Comittee => his plant's ideas
//   else if (userRoles.includes(RoleEnum.COMMITTEE))
//     return {
//       submitter__plant_id__eq: loggedInUser.plant?.id,
//     };

//   // Sumbitter => only his ideas
//   else
//     return {
//       submitter_id__eq: loggedInUser.id,
//     };
// };

export const loadIdeaInitialQueryParams = (loggedInUser: User) => {
  const userRoles = loggedInUser.roles.map(r => r.name);
  const queryParams: Record<string, any> = {}; // Declare empty object

  if (userRoles.includes(RoleEnum.SYSTEM_ADMIN)) {
    // Admins get all ideas - keep empty object
  }

  if (
    userRoles.includes(RoleEnum.TEOA) ||
    userRoles.includes(RoleEnum.COMMITTEE)
  ) {
    // Teoa and Committee - get their plants ideas
    queryParams['submitter__plant_id__eq'] = loggedInUser.plant?.id;
  }

  if (userRoles.length === 1 && userRoles.includes(RoleEnum.SUBMITTER)) {
    // Submitter - get only his ideas
    queryParams['submitter_id__eq'] = loggedInUser.id;
  }

  // Sort descendently by default
  queryParams['sort__created_at'] = 'desc';

  return queryParams;
};
