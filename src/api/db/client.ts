import knex from "knex";
import { 
    DB_CONFIG_CONSTELLATION,
    DB_CONFIG_DENTAL,
    DB_CONFIG_HIPMA,
    DB_CONFIG_MIDWIFERY,
} from "../config";

export const constellation_client = knex(DB_CONFIG_CONSTELLATION);
export const dental_client = knex(DB_CONFIG_DENTAL);
export const himpa_client = knex(DB_CONFIG_HIPMA);
export const midwifery_client = knex(DB_CONFIG_MIDWIFERY);