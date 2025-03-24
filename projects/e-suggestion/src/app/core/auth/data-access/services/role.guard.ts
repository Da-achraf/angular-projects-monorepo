// import { inject } from '@angular/core';
// import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

// /**
//  * A guard to enforce role-based access control (RBAC) for routes.
//  * This guard ensures that only users with specific roles can access certain routes.
//  * If the user's role does not match the expected roles, they will be redirected to the home page
//  * and shown a warning message.
//  *
//  * @param {ActivatedRouteSnapshot} route - The activated route snapshot containing the route data.
//  * @returns {boolean}
//  * - `true`: If the user's role matches one of the expected roles or if `RoleEnum.ALL` is included in the expected roles.
//  * - `false`: If the user's role does not match the expected roles, blocking access and redirecting to the home page.
//  */
// export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
//   // Retrieve the expected roles from the route data
//   const expectedRoles: string[] = route.data['expectedRoles'];

//   // Get the user's role from the token using the AuthService
//   const userRole = inject(AuthService).getRoleFromToken();

//   // Check if the user's role is valid and matches one of the expected roles
//   if (
//     !userRole || // If the user role is not defined
//     (!expectedRoles.includes(userRole) && !expectedRoles.includes(RoleEnum.ALL)) // If the user role is not in the expected roles and 'ALL' is not included
//   ) {
//     // Redirect the user to the home page
//     inject(Router).navigate(['/home']);

//     // Show a warning message to the user using the ToasterService
//     inject(ToasterService).showWarning(
//       "You're not allowed to visit that page."
//     );

//     // Block access to the route
//     return false;
//   }

//   // Allow access to the route if the user's role is valid
//   return true;
// };
