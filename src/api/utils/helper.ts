import knex from "knex";
import { DB_CONFIG_GENERAL, SCHEMA_GENERAL } from "../config";
let db = knex(DB_CONFIG_GENERAL);

export async function getOracleClient(knexClient: any | undefined, configOptions: any): Promise<any> {
    // If we lost the connection, reset the client and get a new connection.
    // The best way to validate if the connection is OK is to test a small query.

    if (knexClient) {
        try {
            await knexClient.raw('select sysdate from dual');
        } catch (error: any) {
            // Check for specific error codes indicating lost connection
            if (error.errorNum === 3114 || error.errorNum === 3135) {
                // Set knexClient to undefined to trigger reconnection
                knexClient = undefined;
            } else {
                // Re-throw other errors
                console.error('The connection was closed due to an error:', error);
                knexClient = undefined;
            }
	}
    }

    // If knexClient is undefined, create a new client
    if (!knexClient) {
        knexClient = knex(configOptions);
    }

    return knexClient;
}

export const getJsonDataList = (fieldData: any): Array<any> => {
    const json = JSON.parse(fieldData);
    const list = json ?? [];
    return list;
};

export async function insertLog(dataLog: any): Promise<boolean> {
    let logSaved = Object();
    db = await getOracleClient(db, DB_CONFIG_GENERAL);

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

export async function insertLogIdReturn(dataLog: any): Promise<number | boolean | string> {
    try {
        db = await getOracleClient(db, DB_CONFIG_GENERAL);
        const logInsertedId = await db(`${SCHEMA_GENERAL}.ACTION_LOGS`)
            .insert(dataLog)
            .into(`${SCHEMA_GENERAL}.ACTION_LOGS`)
            .returning('ID');

        return logInsertedId[0].id;
    } catch (error) {
        console.error(error);
        return false;
    }
};