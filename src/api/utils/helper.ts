import knex from "knex";
import { DB_CONFIG_GENERAL, SCHEMA_GENERAL } from "../config";


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