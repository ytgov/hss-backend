import { UserDTO, RoleDTO } from '../../models';
import { DB_CONFIG_GENERAL, SCHEMA_GENERAL } from '../../config';
import { BaseRepository } from '../BaseRepository';
import knex, { Knex } from "knex";

interface UserRolesOptionsDTO extends RoleDTO {
    selected: boolean;
}

export class UserRepository extends BaseRepository<UserDTO> {

    mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

    async getRolesByUserEmail(user_email: string): Promise<UserRolesOptionsDTO[]> {
        let roles = Object();
        const allRoles: Array<UserRolesOptionsDTO> = [];

        roles = await this.mainDb(`${SCHEMA_GENERAL}.USER_DATA`)
            .join(`${SCHEMA_GENERAL}.USER_ROLES`, 'USER_DATA.ID', '=', 'USER_ROLES.USER_ID')
            .join(`${SCHEMA_GENERAL}.ROLES_DATA`, 'USER_ROLES.ROLE_ID', '=', 'ROLES_DATA.ID')
            .select('ROLES_DATA.ID',
                    'ROLES_DATA.ROLE_NAME',
                    'USER_DATA.USER_NAME',
                    'USER_DATA.USER_EMAIL'
            )
            .where('USER_DATA.USER_EMAIL', user_email);

        roles.forEach((x: any) => {
            allRoles.push({ 
                id: x.id,
                role_name: x.role_name,
                selected: x.user_name !== null
            } as UserRolesOptionsDTO);
        });

        return allRoles;
    }

}
