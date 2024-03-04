import { DB_CONFIG_GENERAL, SCHEMA_GENERAL } from '../../config';
import { BaseRepository } from '../BaseRepository';
import knex, { Knex } from "knex";
import { UserPermissionDTO, UserDTO, PermissionDTO } from '../../models';

export class UserPermissionRepository extends BaseRepository<UserPermissionDTO> {

    async getPermissions(user_email: string): Promise<Array<PermissionDTO>> {

        const mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

        try {

        let user_permissions_qry = Object();

        user_permissions_qry = await mainDb(`${SCHEMA_GENERAL}.USER_PERMISSIONS_V`)
            .where("USER_EMAIL", "=", user_email)
            .select(
                mainDb.ref("PERMISSION_ID").as("ID"),
                "PERMISSION_NAME"
            );
        
        const user_permissions = this.loadResults(user_permissions_qry) as PermissionDTO[];

        return user_permissions;

        } finally {
            await mainDb.destroy();
        }
    }

    async getUserById(user_id: number): Promise<UserPermissionDTO> {

        const mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

        try {

        let user_data_qry = Object();

        user_data_qry = await mainDb(`${SCHEMA_GENERAL}.USER_DATA`)
            .where("ID", "=", user_id)
            .select([
                "ID",
                "USER_NAME",
                "USER_EMAIL"
            ]);
        
        const user_data = (this.loadResults(user_data_qry)[0] ?? {}) as UserDTO;
        
        const user_permissions = await this.getPermissions(user_data.user_email);        
                
        return {
            id: 0,
            user: user_data,
            permissions: user_permissions
        } as UserPermissionDTO;

        } finally {
            await mainDb.destroy();
        }
    }

    async getUserByEmail(user_email: string): Promise<UserPermissionDTO> {

        const mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

        try {

        let user_data_qry = Object();

        user_data_qry = await mainDb(`${SCHEMA_GENERAL}.USER_DATA`)
            .where("USER_EMAIL", "=", user_email)
            .select([
                "ID",
                "USER_NAME",
                "USER_EMAIL"
            ]);

        const user_data = (this.loadResults(user_data_qry)[0] ?? {}) as UserDTO;        
        const user_permissions = await this.getPermissions(user_data.user_email);        
                
        return {
            id: 0,
            user: user_data,
            permissions: user_permissions
        } as UserPermissionDTO;

        } finally {
            await mainDb.destroy();
        }
    }

}
