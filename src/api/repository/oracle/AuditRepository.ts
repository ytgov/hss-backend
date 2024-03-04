import { AuditDTO, AuditTimelineDTO } from './../../models';
import { DB_CONFIG_GENERAL, SCHEMA_GENERAL } from '../../config';
import { BaseRepository } from '../BaseRepository';
import knex, { Knex } from "knex";
import { PermissionDTO } from 'models';

export class AuditRepository extends BaseRepository<AuditDTO> {

    async getAudit(event_type: number): Promise<AuditDTO[]> {

        const mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

        try {

        let general = Object();

        general = await mainDb(`${SCHEMA_GENERAL}.AUDIT_V`)
            .where("EVENT_TYPE", "=", event_type);
                
        return this.loadResults(general);

        } finally {
            await mainDb.destroy();
        }

    }

    async getAuditTimeline(permissions: Array<PermissionDTO>): Promise<AuditTimelineDTO[]> {

        const mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

        try {

        let general = Object();
        
        general = await mainDb(`${SCHEMA_GENERAL}.AUDIT_TIMELINE_V`)
        .whereIn("PERMISSIONS", permissions.map((x) => x.permission_name));

        return this.loadResults(general);

        } finally {
            await mainDb.destroy();
        }

    }

}
