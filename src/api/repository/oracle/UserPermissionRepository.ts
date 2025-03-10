import { DB_CONFIG_GENERAL, SCHEMA_GENERAL } from '../../config';
import { BaseRepository } from '../BaseRepository';
import knex, { Knex } from "knex";
import { UserPermissionDTO, UserDTO, PermissionDTO } from '../../models';
import { helper } from './../../utils';

export class UserPermissionRepository extends BaseRepository<UserPermissionDTO> {

    mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

    async getPermissions(user_email: string): Promise<Array<PermissionDTO>> {
        let user_permissions_qry = Object();
        let mainDb =  await helper.getOracleClient(this.mainDb, DB_CONFIG_GENERAL);
        user_permissions_qry = await mainDb(`${SCHEMA_GENERAL}.USER_PERMISSIONS_V`)
            .whereRaw('LOWER("USER_EMAIL") = LOWER(?)', [user_email])
            .select(
                this.mainDb.ref("PERMISSION_ID").as("ID"),
                "PERMISSION_NAME"
            );
        
        const user_permissions = this.loadResults(user_permissions_qry) as PermissionDTO[];

        return user_permissions;
    }

    async getUserById(user_id: number): Promise<UserPermissionDTO> {
        let user_data_qry = Object();
        let mainDb =  await helper.getOracleClient(this.mainDb, DB_CONFIG_GENERAL);
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
    }

    async getUserByEmail(user_email: string): Promise<UserPermissionDTO> {
        let user_data_qry = Object();
        let mainDb =  await helper.getOracleClient(this.mainDb, DB_CONFIG_GENERAL);
        user_data_qry = await mainDb(`${SCHEMA_GENERAL}.USER_DATA`)
            .whereRaw('LOWER("USER_EMAIL") = LOWER(?)', [user_email])
            .select([
                "ID",
                "USER_NAME",
                "USER_EMAIL"
            ]);

	if (user_data_qry.length === 0) {  
	   console.log('No records were found..');
            return {
                id:  0,
                user: null,
                permissions: null
             } as UserPermissionDTO;
        }
        const user_data = (this.loadResults(user_data_qry)[0] ?? {}) as UserDTO;        
        const user_permissions = await this.getPermissions(user_data.user_email);        
                
        return {
            id:  0,
            user: user_data,
            permissions: user_permissions
        } as UserPermissionDTO;
    }

}
