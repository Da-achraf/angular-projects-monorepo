import { Pipe, PipeTransform } from '@angular/core';
import {
    RoleDisplayNameType,
    RoleDisplayNames,
    RoleEnumType,
} from '../../data-access/auth.model';
import { Role } from '../../data-access/role.model';

@Pipe({
  name: 'userRoleDisplayName',
  standalone: true,
})
export class UserRoleDisplayNamePipe implements PipeTransform {
  transform(roles: Role[]): RoleDisplayNameType | string {
    if (roles.length === 0) return '----';

    return roles
      .map(r => r.name as RoleEnumType)
      .map(rn => RoleDisplayNames[rn])
      .join(' - ');
  }
}
