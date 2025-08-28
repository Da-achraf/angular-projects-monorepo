import { Pipe, PipeTransform } from "@angular/core";
import { RoleDisplayNames, RoleDisplayNameType, RoleEnumType } from "../../data-access/auth.model";


@Pipe({
    name: 'rolename',
    standalone: true,
})
export class RoleNamePipe implements PipeTransform {

    transform(role: string | undefined): RoleDisplayNameType {
        return RoleDisplayNames[role as RoleEnumType]
    }
    
}