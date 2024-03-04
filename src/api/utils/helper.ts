import knex from "knex";
import { DB_CONFIG_GENERAL, SCHEMA_GENERAL } from "../config";


export const getJsonDataList = (fieldData: any): Array<any> => {
    const json = JSON.parse(fieldData);
    const list = json ?? [];
    return list;
};

export const insertLog = (dataLog: any): Array<any> => {

    const db = knex(DB_CONFIG_GENERAL);

    let logSaved = Object();

    logSaved = db(`${SCHEMA_GENERAL}.ACTION_LOGS`).insert(dataLog).into(`${SCHEMA_GENERAL}.ACTION_LOGS`)
    .then(() => {
        return true;
    })
    .catch((error) => {
        console.log(error);
        return false;
    });

    db.destroy();

    return logSaved;
};

export const insertLogIdReturn = async (dataLog: any): Promise<number | boolean | string> => {

    const db = knex(DB_CONFIG_GENERAL);

    try {
        const logInsertedId = await db(`${SCHEMA_GENERAL}.ACTION_LOGS`)
            .insert(dataLog)
            .into(`${SCHEMA_GENERAL}.ACTION_LOGS`)
            .returning('ID');

        return logInsertedId[0].id;
    } catch (error) {
        console.error(error);
        return false;
    } finally {
        await db.destroy();
    }
};