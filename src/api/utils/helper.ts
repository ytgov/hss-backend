import knex from "knex";
import { DB_CONFIG_DENTAL, SCHEMA_GENERAL } from "../config";

const db = knex(DB_CONFIG_DENTAL);

export const getJsonDataList = (fieldData: any): Array<any> => {
    const json = JSON.parse(fieldData);
    const list = json ?? [];
    return list;
};

export const insertLog = (dataLog: any): Array<any> => {
    let logSaved = Object();
    console.log(dataLog);

    logSaved = db(`${SCHEMA_GENERAL}.ACTION_LOGS`).insert(dataLog).into(`${SCHEMA_GENERAL}.ACTION_LOGS`)
    .then(() => {
        return true;
    })
    .catch((error) => {
        console.log(error);
        return false;
    });

    return logSaved;
};