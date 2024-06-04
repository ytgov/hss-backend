import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import { SubmissionStatusRepository } from "../repository/oracle/SubmissionStatusRepository";
import knex from "knex";
import { DB_CONFIG_DENTAL, SCHEMA_DENTAL, SCHEMA_GENERAL } from "../config";
import { groupBy, helper } from "../utils";
import { checkPermissions } from "../middleware/permissions";
var RateLimit = require('express-rate-limit');
var _ = require('lodash');
let db = knex(DB_CONFIG_DENTAL);

const submissionStatusRepo = new SubmissionStatusRepository();
const path = require('path');

export const dentalRouter = express.Router();
dentalRouter.use(RateLimit({
    windowMs: 1*60*1000, // 1 minute
    max: 5000
}));

/**
 * Obtain data to show in the index view
 *
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
dentalRouter.get("/submissions/:action_id/:action_value", [
    param("action_id").notEmpty(), 
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];

        const result = await submissionStatusRepo.getModuleSubmissions(SCHEMA_DENTAL, actionId, actionVal, permissions);
        const groupedId = groupBy(result, i => i.id);
        const labels = groupBy(result, i => i.date_code);

        res.send(
            {
                data: groupedId,
                labels: labels
            });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show in the index view
 *
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
dentalRouter.get("/submissions/status/:action_id/:action_value", [
    param("action_id").notEmpty(),
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getModuleSubmissionsStatus(SCHEMA_DENTAL, actionId, actionVal, permissions);

        res.send({data: result});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show in the index view
 *
 * @return json
 */
dentalRouter.post("/", async (req: Request, res: Response) => {
    try {

        const page = parseInt(req.body.params.page as string) || 1;
        const pageSize = parseInt(req.body.params.pageSize as string) || 10;
        const offset = (page - 1) * pageSize;
        const sortBy = req.body.params.sortBy;
        const sortOrder = req.body.params.sortOrder;
        const initialFetch = req.body.params.initialFetch;

        var dateFrom = req.body.params.dateFrom;
        var dateTo = req.body.params.dateTo;
        var dateYear = req.body.params.dateYear;
        let status_request = req.body.params.status;
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);
        let query = db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_SUBMISSIONS`)

        const countAllQuery = query.clone().clearSelect().clearOrder().count('* as count').first();

        if(dateYear) {
            query.where(db.raw("EXTRACT(YEAR FROM TO_DATE(CREATED_AT, 'YYYY-MM-DD HH24:MI:SS')) = ?",
                [dateYear]));
        }

        if(dateFrom && dateTo) {
            query.where(db.raw("TO_CHAR(TO_DATE(CREATED_AT, 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD') >=  ? "+
                                "AND TO_CHAR(TO_DATE(CREATED_AT, 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD') <= ?",
                [dateFrom, dateTo]));
        }

        if (status_request) {
            query.whereIn("STATUS", status_request);
        }

        const countQuery = query.clone();

        if (sortBy) {
            query = query.orderBy(sortBy.toUpperCase(), sortOrder);
        } else {
            query = query.orderBy('ID', 'ASC');
        }

        if(pageSize !== -1 && initialFetch == 0){
            query = query.offset(offset).limit(pageSize);
        }else if(initialFetch == 1){
            query = query.offset(offset).limit(100);
        }

        const dentalService = await query;

        const countResult = await countQuery.count('* as count').first();
        const countResultAll = await countAllQuery;

        const countSubmissions = countResult ? countResult.count : 0;
        const countAll = countResultAll ? countResultAll.count : 0;

        var dentalStatus = await getAllStatus();
        res.send({data: dentalService, dataStatus: dentalStatus, total: countSubmissions, all: countAll});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Change the status request"
 *
 * @param {dentalService_id} id of request
 * @return json
 */

dentalRouter.patch("/changeStatus", async (req: Request, res: Response) => {
    try {
        var dentalService_id = req.body.params.requests;
        var status_id = req.body.params.requestStatus;
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);
        var updateStatus = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE`).update({STATUS: status_id}).whereIn("ID", dentalService_id);
        var statusData = await db(`${SCHEMA_DENTAL}.DENTAL_STATUS`).where('ID', status_id).first();
        var logFields = Array();

        if(updateStatus) {
            let type = "success";
            let message = "Status changed successfully.";

            if(dentalService_id instanceof Array){
                _.forEach(dentalService_id, function(value: any) {
                    logFields.push({
                        ACTION_TYPE: 4,
                        TITLE: "Submission updated to status "+statusData.description,
                        SCHEMA_NAME: SCHEMA_DENTAL,
                        TABLE_NAME: "DENTAL_SERVICE",
                        SUBMISSION_ID: value,
                        USER_ID: req.user?.db_user.user.id
                    });
                });

                let loggedAction = await helper.insertLog(logFields);

                if(!loggedAction){
                    res.send( {
                        status: 400,
                        message: 'The action could not be logged'
                    });
                }
            }

            res.json({ status:200, message: message, type: type });
        }

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Validate if request is non existant or with closed status
 *
 * @param {dentalService_id} id of request
 * @return json
 */
dentalRouter.get("/validateRecord/:dentalService_id",[param("dentalService_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        var dentalService_id = Number(req.params.dentalService_id);
        var dentalService = Object();
        var flagExists = true;
        var message = "";
        var type = "error";
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

        dentalService = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE`)
            .join(`${SCHEMA_DENTAL}.DENTAL_STATUS`, 'DENTAL_SERVICE.STATUS', '=', 'DENTAL_STATUS.ID')
            .where('DENTAL_SERVICE.ID', dentalService_id)
            .select(`${SCHEMA_DENTAL}.DENTAL_SERVICE.*`,
                    'DENTAL_STATUS.DESCRIPTION AS STATUS_DESCRIPTION')
            .then((data:any) => {
                return data[0];
            });

        if(!dentalService || dentalService.status_description == "closed"){
            flagExists= false;
            message= "The submission you are consulting is closed or non existant, please choose a valid submission.";
        }

        res.json({ status: 200, flagDental: flagExists, message: message, type: type});
    } catch(e) {
        console.log(e);
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show in details view
 *
 * @param {dentalService_id} id of request
 * @return json
 */
dentalRouter.get("/show/:dentalService_id", checkPermissions("dental_view"), [param("dentalService_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        var dentalService_id = Number(req.params.dentalService_id);
        var dentalService = Object();
        var dentalServiceDependents = Object();
        var dentalFiles = Object();
        var dentalInternalFields = Object();
        var dentalComments = Object();
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

        dentalService = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_SUBMISSIONS_DETAILS`)
            .where('ID', dentalService_id)
            .first();

        dentalServiceDependents = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`)
                                        .select('ID',
                                                'DENTAL_SERVICE_ID',
                                                'C_FIRSTNAME',
                                                'C_LASTNAME',
                                                'C_HEALTHCARE',
                                                'C_APPLY',
                                                db.raw(`TO_CHAR(C_DOB, 'yyyy-mm-dd')  AS C_DOB`)
                                        )
                                        .where('DENTAL_SERVICE_DEPENDENTS.DENTAL_SERVICE_ID', dentalService_id);

        dentalFiles = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_FILES`).where("DENTAL_SERVICE_ID", dentalService_id)
            .select('ID',
                    'DENTAL_SERVICE_ID',
                    'DESCRIPTION',
                    'FILE_NAME',
                    'FILE_TYPE',
                    'FILE_SIZE'
            ).then((data:any) => {
                return data[0];
            });

        dentalInternalFields = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_INTERNAL_FIELDS`)
                                .select('ID',
                                        'DENTAL_SERVICE_ID',
                                        'PROGRAM_YEAR',
                                        db.raw(`CASE
                                                WHEN INCOME_AMOUNT = TRUNC(INCOME_AMOUNT)
                                                THEN TO_CHAR(INCOME_AMOUNT, 'FM9999999')
                                                ELSE TO_CHAR(INCOME_AMOUNT, 'FM9999999.99')
                                                END AS INCOME_AMOUNT`),
                                        db.raw("TO_CHAR(DATE_ENROLLMENT, 'YYYY-MM-DD') AS DATE_ENROLLMENT"),
                                        'POLICY_NUMBER',
                                        db.raw("TO_CHAR(CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT")
                                )
                                .where('DENTAL_SERVICE_ID', dentalService_id).then((data:any) => {
                                    return data[0];
                                });

        dentalComments = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_COMMENTS`)
                        .join(`${SCHEMA_GENERAL}.USER_DATA`, 'DENTAL_SERVICE_COMMENTS.USER_ID', '=', 'USER_DATA.ID')
                        .select('DENTAL_SERVICE_COMMENTS.ID',
                                'DENTAL_SERVICE_COMMENTS.DENTAL_SERVICE_ID',
                                'DENTAL_SERVICE_COMMENTS.COMMENT_DESCRIPTION',
                                'USER_DATA.USER_NAME',
                                db.raw("TO_CHAR(DENTAL_SERVICE_COMMENTS.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT")
                        )
                        .where("DENTAL_SERVICE_ID", dentalService_id);

        dentalService.flagFile = true;

        if(!_.isEmpty(dentalFiles)){
            dentalFiles.file_fullName = dentalFiles.file_name+"."+dentalFiles.file_type;
        }else{
            dentalService.flagFile = false;
        }

        dentalService.flagDemographic = true;
        if(!_.isEmpty(dentalService.ask_demographic)){
            let askDemographic = dentalService.ask_demographic.split(",");

            if(askDemographic[0].toLowerCase() == "no"){
                dentalService.flagDemographic = false;
            }
        }

        dentalService.flagDependents = false;

        if(!_.isEmpty(dentalServiceDependents) && !dentalService.have_children.includes("No, I don't have children")){
            dentalService.flagDependents = true;

            _.forEach(dentalServiceDependents, function(valueDependents: any, key: any) {

                if(valueDependents["c_dob"] == 0) {
                    valueDependents["c_dob"] =  "N/A";
                }

                if(valueDependents["c_apply"] == "0"){
                    valueDependents["c_apply"] = "Yes, they are applying";
                }else if(valueDependents["c_apply"] == "1"){
                    valueDependents["c_apply"] = "No, they alredy have coverage";
                }
            });
        }

        if(!_.isEmpty(dentalService.identify_groups)){
            dentalService.identify_groups = getBlobField(dentalService.identify_groups);
        }

        if(!_.isEmpty(dentalService.reason_for_dentist)){
            dentalService.reason_for_dentist = getBlobField(dentalService.reason_for_dentist);
        }

        if(!_.isEmpty(dentalService.pay_for_visit)){
            dentalService.pay_for_visit = getBlobField(dentalService.pay_for_visit);
        }

        if(!_.isEmpty(dentalService.barriers)){
            dentalService.barriers = getBlobField(dentalService.barriers);
        }

        if(!_.isEmpty(dentalService.problems)){
            dentalService.problems = getBlobField(dentalService.problems);
        }

        if(!_.isEmpty(dentalService.services_needed)){
            dentalService.services_needed = getBlobField(dentalService.services_needed);
        }

        var dentalCityTown = await getCatalogSelect('DENTAL_SERVICE_CITY_TOWN');

        var dentalGroupsCommunities = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_GROUPS_COMMUNITIES`).select();

        var dentalGenders = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_GENDERS`)
                            .select("ID AS key",
                                    "NAME AS text",
                                    "NAME AS value"
                            );

        var dentalEducationLevels = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_EDUCATION_LEVELS`)
                            .select("ID AS key",
                                    "DESCRIPTION AS text",
                                    "DESCRIPTION AS value"
                            );

        var dentalOften = await getCatalogSelect('DENTAL_SERVICE_OFTEN');

        var dentalStates = await getCatalogSelect('DENTAL_SERVICE_STATES');

        var dentalTimePeriods = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_TIME_PERIODS`)
                            .select("ID AS key",
                                    "DESCRIPTION AS text",
                                    "DESCRIPTION AS value"
                            );

        var dentalReasons = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_REASONS_DENTIST`).select();

        var dentalPaymentMethods = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_PAYMENT_METHODS`).select();

        var dentalBarriers = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_BARRIERS`).select();

        var dentalProblems = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_PROBLEMS`).select();

        var dentalNeedServices = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_NEED_SERVICES`).select();

        var statusDental =  await db(`${SCHEMA_DENTAL}.DENTAL_STATUS`).where("DESCRIPTION", "Closed").select().first();

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        let todayDate = mm+'_'+dd+'_'+yyyy;
        let fileName = 'dental_service_request_details_'+todayDate+".pdf";

        const internalFieldsYears = [];
        const startYear = new Date().getFullYear();
        const currentYear = 2023;
        const targetYear = startYear + 10;

        internalFieldsYears.push({
            text: currentYear,
            value: currentYear.toString(),
            dateFrom: currentYear,
            dateTo: currentYear
        });

        for (let year = currentYear; year <= targetYear; year += 1) {
            const dateFrom = year;
            const dateTo = year + 1;
            const value = `${dateFrom}-${dateTo}`;

            internalFieldsYears.push({
                text: value,
                value: value,
                dateFrom: dateFrom,
                dateTo: dateTo
            });
        }

        var dentalStatus = await getAllStatus();

        res.json({ status: 200,
            dataStatus: dentalStatus,
            dataDentalService: dentalService,
            dataDentalDependents: dentalServiceDependents,
            dentalStatusClosed: statusDental.id,
            fileName:fileName,
            dentalFiles:dentalFiles,
            dataDentalInternalFields: dentalInternalFields || {},
            dataDentalComments: dentalComments,
            internalFieldsYears: internalFieldsYears,
            dataDentalCityTown: dentalCityTown,
            dataDentalGroups: dentalGroupsCommunities,
            dataDentalGenders: dentalGenders,
            dataEducationLevels: dentalEducationLevels,
            dataDentalOften: dentalOften,
            dataDentalStates: dentalStates,
            dataTimePeriods: dentalTimePeriods,
            dataDentalReasons: dentalReasons,
            dataPaymentMethods: dentalPaymentMethods,
            dataDentalBarriers: dentalBarriers,
            dataDentalProblems: dentalProblems,
            dataDentalNeedServices: dentalNeedServices
        });
    } catch(e) {
        console.log(e);  // debug if needed

        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show in export file
 *
 * @param {status} status of request
 * @return json
 */
dentalRouter.post("/export/", async (req: Request, res: Response) => {
    try {
        var requests = req.body.params.requests;
        let status_request = req.body.params.status;
        var dateFrom = req.body.params.dateFrom;
        var dateTo = req.body.params.dateTo;
        var dateYear = req.body.params.dateYear
        const idSubmission: number[] = [];
        var dentalInternalFields = Object();
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);
        let userId = req.user?.db_user.user.id || null;

        let query  = db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_SUBMISSIONS_DETAILS`)
                    .where('DENTAL_SERVICE_SUBMISSIONS_DETAILS.STATUS', '<>', 4);

        if(requests.length > 0){
            query.whereIn("ID", requests);
        }

        if(dateYear) {
            query.where(db.raw("EXTRACT(YEAR FROM TO_DATE(DENTAL_SERVICE_SUBMISSIONS_DETAILS.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS')) = ?",
                [dateYear]));
        }

        if(dateFrom && dateTo) {
            query.where(db.raw("TO_CHAR(TO_DATE(CREATED_AT, 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD') >=  ? "+
                                "AND TO_CHAR(TO_DATE(CREATED_AT, 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD') <= ?",
                [dateFrom, dateTo]));
        }

        if (status_request) {
            query.whereIn("DENTAL_SERVICE_SUBMISSIONS_DETAILS.STATUS", status_request);
        }

        query.orderBy('ID', 'ASC');
        const dentalService = await query;

        const submissionsId: number[] = dentalService.map(item => item.id);

        dentalInternalFields = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_INTERNAL_FIELDS`)
        .select('DENTAL_SERVICE_ID',
                'PROGRAM_YEAR',
                db.raw(`CASE
                        WHEN INCOME_AMOUNT = TRUNC(INCOME_AMOUNT)
                        THEN TO_CHAR(INCOME_AMOUNT, 'FM9999999')
                        ELSE TO_CHAR(INCOME_AMOUNT, 'FM9999999.99')
                        END AS INCOME_AMOUNT`),
                db.raw("TO_CHAR(DATE_ENROLLMENT, 'YYYY-MM-DD') AS DATE_ENROLLMENT"),
                'POLICY_NUMBER',
                db.raw("TO_CHAR(CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT")
        )
        .whereIn('DENTAL_SERVICE_ID', submissionsId);

        dentalService.forEach(function (value: any) {
            idSubmission.push(value.id);

            if(value.date_of_birth === null) {
                value.date_of_birth =  "N/A";
            }

            if(!_.isEmpty(value.identify_groups)){
                value.identify_groups = getBlobField(value.identify_groups);
            }

            if(!_.isEmpty(value.reason_for_dentist)){
                value.reason_for_dentist = getBlobField(value.reason_for_dentist);
            }

            if(!_.isEmpty(value.pay_for_visit)){
                value.pay_for_visit = getBlobField(value.pay_for_visit);
            }

            if(!_.isEmpty(value.barriers)){
                value.barriers = getBlobField(value.barriers);
            }

            if(!_.isEmpty(value.problems)){
                value.problems = getBlobField(value.problems);
            }

            if(!_.isEmpty(value.services_needed)){
                value.services_needed = getBlobField(value.services_needed);
            }

            if(!_.isEmpty(value.file_name)){
                value.file_fullName = value.file_name+"."+value.file_type;
            }else{
                value.file_fullName = "";
            }

            let internalField = dentalInternalFields.find((obj: any) => obj.dental_service_id === value.id);

            if(internalField) {
                value.program_year = internalField.program_year;
                value.income_amount = internalField.income_amount;
                value.date_enrollment = internalField.date_enrollment;
                value.policy_number = internalField.policy_number;
                value.created_at_if = internalField.created_at;
            }else{
                value.program_year = "";
                value.income_amount = "";
                value.date_enrollment = "";
                value.policy_number = "";
                value.created_at_if = "";
            }

            delete value.id;
            delete value.status;
            delete value.are_you_eligible_for_the_pharmacare_and_extended_health_care_ben;
            delete value.file_id;
            delete value.file_name;
            delete value.file_type;
            delete value.file_size;

        });

        let queryDependents = db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`)
                            .leftJoin(`${SCHEMA_DENTAL}.DENTAL_SERVICE`, 'DENTAL_SERVICE_DEPENDENTS.DENTAL_SERVICE_ID', 'DENTAL_SERVICE.ID')
                            .select(db.raw("(DENTAL_SERVICE.FIRST_NAME ||' '|| DENTAL_SERVICE.LAST_NAME) AS APPLICANT_NAME" ),
                                    'DENTAL_SERVICE_DEPENDENTS.C_FIRSTNAME',
                                    'DENTAL_SERVICE_DEPENDENTS.C_LASTNAME',
                                    'DENTAL_SERVICE_DEPENDENTS.C_DOB',
                                    'DENTAL_SERVICE_DEPENDENTS.C_HEALTHCARE',
                                    'DENTAL_SERVICE_DEPENDENTS.C_APPLY');

        if (!_.isEmpty(idSubmission)) {
            queryDependents.whereIn('DENTAL_SERVICE_DEPENDENTS.DENTAL_SERVICE_ID', idSubmission);
        }

        queryDependents.orderBy('DENTAL_SERVICE_DEPENDENTS.DENTAL_SERVICE_ID', 'ASC');
        const dentalServiceDependents = await queryDependents;

        _.forEach(dentalServiceDependents, function(valueDependents: any, key: any) {

            if(valueDependents["c_dob"] == 0) {
                valueDependents["c_dob"] =  "N/A";
            }

            if(valueDependents["c_apply"] == "0"){
                valueDependents["c_apply"] = "Yes, they are applying";
            }else if(valueDependents["c_apply"] == "1"){
                valueDependents["c_apply"] = "No, they alredy have coverage";
            }
        });

        var bufferQuery = Object();
        let stringQuery = query.toString();

        // Verify the length of the serialized JSON
        const maxLengthInBytes = 1 * (1024 * 1024); // 1MB to  bytes

        if (Buffer.byteLength(stringQuery, 'utf8') > maxLengthInBytes) {
            console.log('The object exceeds 1MB. It will be truncated.');
            stringQuery = stringQuery.substring(0, maxLengthInBytes);
        }

        if(!_.isEmpty(query)) {
            bufferQuery = Buffer.from(stringQuery);
        }else{
            bufferQuery = null;
        }

        var logFields = {
            ACTION_TYPE: 5,
            TITLE: "Export submission",
            SCHEMA_NAME: SCHEMA_DENTAL,
            TABLE_NAME: "DENTAL_SERVICE",
            SUBMISSION_ID: null,
            ACTION_DATA: bufferQuery,
            USER_ID: userId
        };

        let loggedAction = await helper.insertLog(logFields);

        if(!loggedAction){
            console.log("Dental Export could not be logged");
        }

        res.json({ status: 200, dataDental: dentalService, dataDependents: dentalServiceDependents,
                    dataInternalFields: dentalInternalFields});
    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});


/**
 * Obtain data of duplicated warnings
 *
 * @return json
 */
dentalRouter.post("/duplicates", async (req: Request, res: Response) => {
    try {
        var dentalOriginal = Object();
        var dentalDuplicate = Object();
        var dentalService = Array();
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

        dentalOriginal = await db(`${SCHEMA_DENTAL}.DENTAL_DUPLICATED_REQUESTS`)
            .join(`${SCHEMA_DENTAL}.DENTAL_SERVICE`, 'DENTAL_DUPLICATED_REQUESTS.ORIGINAL_ID', '=', 'DENTAL_SERVICE.ID')
            .join(`${SCHEMA_DENTAL}.DENTAL_STATUS`, 'DENTAL_SERVICE.STATUS', '=', 'DENTAL_STATUS.ID')
            .leftJoin(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`, 'DENTAL_SERVICE.ID', '=', 'DENTAL_SERVICE_DEPENDENTS.DENTAL_SERVICE_ID')
            .select('DENTAL_SERVICE.ID AS DENTAL_SERVICE_ID',
                    'DENTAL_SERVICE.FIRST_NAME',
                    'DENTAL_SERVICE.LAST_NAME',
                    'DENTAL_SERVICE.STATUS',
                    'DENTAL_DUPLICATED_REQUESTS.ORIGINAL_ID',
                    'DENTAL_DUPLICATED_REQUESTS.DUPLICATED_ID',
                    'DENTAL_STATUS.DESCRIPTION AS STATUS_DESCRIPTION',
                    db.raw("TO_CHAR(DENTAL_SERVICE.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT,"+
                        "TO_CHAR(DENTAL_SERVICE.DATE_OF_BIRTH, 'YYYY-MM-DD') as DATE_OF_BIRTH,"+
                        "CASE WHEN COUNT(DENTAL_SERVICE_DEPENDENTS.ID) > 0 THEN 'YES' ELSE 'NO' END AS DEPENDENT")
            )
            .groupBy('DENTAL_SERVICE.ID',
                    'DENTAL_SERVICE.FIRST_NAME',
                    'DENTAL_SERVICE.LAST_NAME',
                    'DENTAL_SERVICE.STATUS',
                    'DENTAL_DUPLICATED_REQUESTS.ORIGINAL_ID',
                    'DENTAL_DUPLICATED_REQUESTS.DUPLICATED_ID',
                    'DENTAL_STATUS.DESCRIPTION',
                    db.raw("TO_CHAR(DENTAL_SERVICE.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS'),"+
                            "TO_CHAR(DENTAL_SERVICE.DATE_OF_BIRTH, 'YYYY-MM-DD')")
            ).then((rows: any) => {
                let arrayResult = Object();

                for (let row of rows) {
                    arrayResult[row['original_id']] = row;
                }

                return arrayResult;
            });

        dentalDuplicate = await db(`${SCHEMA_DENTAL}.DENTAL_DUPLICATED_REQUESTS`)
        .join(`${SCHEMA_DENTAL}.DENTAL_SERVICE`, 'DENTAL_DUPLICATED_REQUESTS.DUPLICATED_ID', '=', 'DENTAL_SERVICE.ID')
        .join(`${SCHEMA_DENTAL}.DENTAL_STATUS`, 'DENTAL_SERVICE.STATUS', '=', 'DENTAL_STATUS.ID')
        .leftJoin(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`, 'DENTAL_SERVICE.ID', '=', 'DENTAL_SERVICE_DEPENDENTS.DENTAL_SERVICE_ID')

        .select('DENTAL_DUPLICATED_REQUESTS.ID',
                'DENTAL_SERVICE.ID AS DENTAL_SERVICE_ID',
                'DENTAL_SERVICE.FIRST_NAME',
                'DENTAL_SERVICE.LAST_NAME',
                'DENTAL_SERVICE.STATUS',
                'DENTAL_DUPLICATED_REQUESTS.ORIGINAL_ID',
                'DENTAL_DUPLICATED_REQUESTS.DUPLICATED_ID',
                'DENTAL_STATUS.DESCRIPTION AS STATUS_DESCRIPTION',
                db.raw("TO_CHAR(DENTAL_SERVICE.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT,"+
                    "TO_CHAR(DENTAL_SERVICE.DATE_OF_BIRTH, 'YYYY-MM-DD') as DATE_OF_BIRTH,"+
                    "CASE WHEN COUNT(DENTAL_SERVICE_DEPENDENTS.ID) > 0 THEN 'YES' ELSE 'NO' END AS DEPENDENT")
        )
        .groupBy('DENTAL_DUPLICATED_REQUESTS.ID',
                'DENTAL_SERVICE.ID',
                'DENTAL_SERVICE.FIRST_NAME',
                'DENTAL_SERVICE.LAST_NAME',
                'DENTAL_SERVICE.STATUS',
                'DENTAL_DUPLICATED_REQUESTS.ORIGINAL_ID',
                'DENTAL_DUPLICATED_REQUESTS.DUPLICATED_ID',
                'DENTAL_STATUS.DESCRIPTION',
                db.raw("TO_CHAR(DENTAL_SERVICE.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS'),"+
                        "TO_CHAR(DENTAL_SERVICE.DATE_OF_BIRTH, 'YYYY-MM-DD')")
        );

        let index = 0;

        dentalDuplicate.forEach(function (value: any) {
            if(value.status !== 4 && dentalOriginal[value.original_id].status !== 4){
                let url = "dentalWarnings/details/"+value.id;

                delete value.id;

                dentalService.push({
                    dental_service_id: null,
                    original_id: null,
                    duplicated_id: null,
                    first_name: 'Duplicated #'+(index+1),
                    last_name: null,
                    dependent: null,
                    date_of_birth: null,
                    status_description: null,
                    created_at: 'ACTIONS:',
                    showUrl: url
                });

                dentalService.push(dentalOriginal[value.original_id]);
                dentalService.push(value);
                index = index + 1;
            }
        });

        res.send({data: dentalService});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }

});

/**
 * Obtain data to show in details view
 *
 * @param id of request
 * @return json
 */
dentalRouter.get("/duplicates/details/:duplicate_id",[param("duplicate_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        let duplicate_id = Number(req.params.duplicate_id);
        var dentalOriginal = Object();
        var dentalDuplicate = Object();
        var dentalEntries = Object();
        var dependentsOriginal = Object();
        var dependentsDuplicated = Object();
        var dentalFiles = Object();
        var dentalFilesDuplicated = Object();
        var flagDependents = false;
        var flagDemographic = true;
        var flagFile = false;
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

        var duplicateEntry = await db(`${SCHEMA_DENTAL}.DENTAL_DUPLICATED_REQUESTS`)
            .where("ID", duplicate_id).then((rows: any) => {
                let arrayResult = Object();

                for (let row of rows) {
                    arrayResult.original = row['original_id'];
                    arrayResult.duplicated = row['duplicated_id'];
                }

                return arrayResult;
            });

        dentalEntries = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_SUBMISSIONS_DETAILS`)
                    .whereIn("ID", [duplicateEntry.original, duplicateEntry.duplicated])
                    .whereNot('STATUS', '4');

        dependentsOriginal = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`)
                    .select('DENTAL_SERVICE_DEPENDENTS.ID',
                            'DENTAL_SERVICE_DEPENDENTS.DENTAL_SERVICE_ID',
                            'DENTAL_SERVICE_DEPENDENTS.C_FIRSTNAME',
                            'DENTAL_SERVICE_DEPENDENTS.C_LASTNAME',
                            db.raw("TO_CHAR(DENTAL_SERVICE_DEPENDENTS.C_DOB, 'YYYY-MM-DD') AS C_DOB"),
                            'DENTAL_SERVICE_DEPENDENTS.C_HEALTHCARE',
                            'DENTAL_SERVICE_DEPENDENTS.C_APPLY'
                    )
                    .where('DENTAL_SERVICE_DEPENDENTS.DENTAL_SERVICE_ID', duplicateEntry.original);

        dependentsDuplicated = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`)
                    .select('DENTAL_SERVICE_DEPENDENTS.ID',
                        'DENTAL_SERVICE_DEPENDENTS.DENTAL_SERVICE_ID',
                        'DENTAL_SERVICE_DEPENDENTS.C_FIRSTNAME',
                        'DENTAL_SERVICE_DEPENDENTS.C_LASTNAME',
                        db.raw("TO_CHAR(DENTAL_SERVICE_DEPENDENTS.C_DOB, 'YYYY-MM-DD') AS C_DOB"),
                        'DENTAL_SERVICE_DEPENDENTS.C_HEALTHCARE',
                        'DENTAL_SERVICE_DEPENDENTS.C_APPLY'
                    )
                    .where('DENTAL_SERVICE_DEPENDENTS.DENTAL_SERVICE_ID', duplicateEntry.duplicated);

        dentalFiles = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_FILES`)
            .where("DENTAL_SERVICE_ID", duplicateEntry.original).select().then((data:any) => {
                return data.length > 0 ? data[0] : null;
            });

        if(!_.isEmpty(dentalFiles)){
            flagFile = true;
            dentalFiles.file_fullName = dentalFiles.file_name+"."+dentalFiles.file_type;
        }

        dentalFilesDuplicated = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_FILES`)
            .where("DENTAL_SERVICE_ID", duplicateEntry.duplicated).select().then((data:any) => {
                return data.length > 0 ? data[0] : null;
            });

        if(!_.isEmpty(dentalFilesDuplicated)){
            flagFile = true;
            dentalFilesDuplicated.file_fullName = dentalFilesDuplicated.file_name+"."+dentalFilesDuplicated.file_type;
        }

        dentalEntries.forEach(function (value: any) {

            if(!_.isEmpty(value.ask_demographic)){
                let askDemographic = value.ask_demographic.split(",");

                if(askDemographic[0].toLowerCase() !== "no"){
                    flagDemographic = false;
                }
            }

            if(!_.isEmpty(value.identify_groups)){
                value.identify_groups = getBlobField(value.identify_groups);
            }

            if(!_.isEmpty(value.reason_for_dentist)){
                value.reason_for_dentist = getBlobField(value.reason_for_dentist);
            }

            if(!_.isEmpty(value.pay_for_visit)){
                value.pay_for_visit = getBlobField(value.pay_for_visit);
            }

            if(!_.isEmpty(value.barriers)){
                value.barriers = getBlobField(value.barriers);
            }

            if(!_.isEmpty(value.problems)){
                value.problems = getBlobField(value.problems);
            }

            if(!_.isEmpty(value.services_needed)){
                value.services_needed = getBlobField(value.services_needed);
            }

            if(value.id == duplicateEntry.original){
                dentalOriginal = value;
            }else if(value.id == duplicateEntry.duplicated){
                dentalDuplicate = value;
            }

        });

        if(!_.isEmpty(dependentsOriginal) || !_.isEmpty(dependentsDuplicated)){
            flagDependents = true;

            _.forEach(dependentsOriginal, function(valueOriginal: any, key: any) {

                if(valueOriginal["c_dob"] == 0) {
                    valueOriginal["c_dob"] =  "N/A";
                }

                if(valueOriginal["c_apply"] == "0"){
                    valueOriginal["c_apply"] = "Yes, they are applying";
                }else if(valueOriginal["c_apply"] == "1"){
                    valueOriginal["c_apply"] = "No, they alredy have coverage";
                }
            });

            _.forEach(dependentsDuplicated, function(valueDuplicated: any, key: any) {

                if(valueDuplicated["c_dob"] == 0) {
                    valueDuplicated["c_dob"] =  "N/A";
                }

                if(valueDuplicated["c_apply"] == "0"){
                    valueDuplicated["c_apply"] = "Yes, they are applying";
                }else if(valueDuplicated["c_apply"] == "1"){
                    valueDuplicated["c_apply"] = "No, they alredy have coverage";
                }
            });
        }

        res.json({ dataDentalService: dentalOriginal, dataDentalDuplicate: dentalDuplicate, dentalFiles: dentalFiles,
                dentalFilesDuplicated: dentalFilesDuplicated, dataDependentsOriginal: dependentsOriginal,
                dataDependentsDuplicated: dependentsDuplicated, flagDependents: flagDependents, flagFile:flagFile, flagDemographic: flagDemographic
        });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Validate if warning is non existant
 *
 * @param {duplicate_id} id of warning
 * @return json
 */
dentalRouter.get("/duplicates/validateWarning/:duplicate_id",[param("duplicate_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        var duplicate_id = Number(req.params.duplicate_id);
        var warning = Object();
        var flagExists = true;
        var message = "";
        var type = "error";
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

        warning = await db(`${SCHEMA_DENTAL}.DENTAL_DUPLICATED_REQUESTS`)
            .where('ID', duplicate_id)
            .select()
            .then((data:any) => {
                return data[0];
            });

        if(!warning){
            flagExists = false;
            message = "The request you are consulting is non existant, please choose a valid request.";
        }
        res.json({ status: 200, flagWarning: flagExists, message: message, type: type});


    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Reject duplicate warning
 *
 * @param {warning}
 * @param {request}
 * @return json
 */
dentalRouter.patch("/duplicates/primary", async (req: Request, res: Response) => {
    try {
        var warning = Number(req.body.params.warning);
        var request = Number(req.body.params.request);
        var type = req.body.params.type;
        var updateRequest = Object();
        var rejectWarning = Object();
        var logTitle = "";
        var updatedFields = Object();
        var fieldList = Object();
        var primarySubmission = Number();
        var logFields = Array();
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

        if(!request){
            rejectWarning = await db(`${SCHEMA_DENTAL}.DENTAL_DUPLICATED_REQUESTS`).where("ID", warning).del();
            logTitle = "Duplicated Warning Rejected";
        }else{
            var warningRequest = await db(`${SCHEMA_DENTAL}.DENTAL_DUPLICATED_REQUESTS`).where("ID", warning).first();

            if(type == 'O'){
                updateRequest = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE`).update({STATUS: "4"}).where("ID", warningRequest.duplicated_id);
                primarySubmission = warningRequest.duplicated_id;
            }else if(type == 'D'){
                updateRequest = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE`).update({STATUS: "4"}).where("ID", warningRequest.original_id);
                primarySubmission = warningRequest.original_id;
            }

            logFields.push({
                ACTION_TYPE: 4,
                TITLE: "Submission updated to status Closed",
                SCHEMA_NAME: SCHEMA_DENTAL,
                TABLE_NAME: "DENTAL_SERVICE",
                SUBMISSION_ID: primarySubmission,
                USER_ID: req.user?.db_user.user.id
            });

            if(updateRequest){
                rejectWarning = await db(`${SCHEMA_DENTAL}.DENTAL_DUPLICATED_REQUESTS`).where("ID", warning).del();
                logTitle = "Duplicated Warning Resolved";
                updatedFields.ORIGINAL_ID = warningRequest.original_id;
                updatedFields.DUPLICATED_ID = warningRequest.duplicated_id;
            }
        }

        if(!_.isEmpty(updatedFields)) {
            fieldList =  db.raw("utl_raw.cast_to_raw(?) ", JSON.stringify(updatedFields));
        }else{
            fieldList = null;
        }

        logFields.push({
                ACTION_TYPE: 7,
                TITLE: logTitle,
                SCHEMA_NAME: SCHEMA_DENTAL,
                TABLE_NAME: "DENTAL_DUPLICATED_REQUESTS",
                SUBMISSION_ID: warning,
                USER_ID: req.user?.db_user.user.id,
                ACTION_DATA: fieldList
        });

        let loggedAction = await helper.insertLog(logFields);

        if(!loggedAction){
            res.send( {
                status: 400,
                message: 'The action could not be logged'
            });
        }

        if(rejectWarning) {
            let type = "success";
            let message = "Warning updated successfully.";
            res.json({ status:200, message: message, type: type });
        }

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Download request file
 *
 * @param {dentalFile_id} id of request
 * @return json
 */
dentalRouter.get("/downloadFile/:dentalFile_id",[param("dentalFile_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        var pathFile = "";
        var fs = require("fs");
        var buffer;
        var dentalFile_id = Number(req.params.dentalFile_id);
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

        var dentalFiles = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_FILES`).where("ID", dentalFile_id).select().first();

        if(dentalFiles.is_base64){
            buffer = Buffer.from(dentalFiles.file_data.toString(), 'base64');
        }else{
            buffer = dentalFiles.file_data;
        }

        let safeName = (Math.random() + 1).toString(36).substring(7)+'_'+dentalFiles.file_name;
        let pathPublicFront = path.join(__dirname, "../../");
        pathFile = pathPublicFront+"dist/web/"+safeName+"."+dentalFiles.file_type;

        fs.writeFileSync(pathFile, buffer);

        if(dentalFiles) {
            res.json({ fileName: safeName+"."+dentalFiles.file_type, fileType: dentalFiles.file_type, filePath: pathFile});
        }

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Deletes downloaded file
 *
 * @param {file} name of file
 */
dentalRouter.post("/deleteFile", async (req: Request, res: Response) => {
    try {

        var sanitize = require("sanitize-filename");
        var fs = require("fs");
        var file = sanitize(req.body.params.file);
        let pathPublicFront = path.join(__dirname, "../../");
        var filePath = pathPublicFront+"dist/web/"+file;

        if(fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});


/**
 * Store Dental data
 *
 * @return json
 */
dentalRouter.post("/store", async (req: Request, res: Response) => {
    try {
        let data = Object();
        const dentalService = Object();
        let dentalServiceSaved = Object();
        var fileData = Object();
        let responseSent = false;

        data = req.body;

        let stringOriginalSubmission = JSON.stringify(data);

        // Verify the length of the serialized JSON
        const maxLengthInBytes = 1 * (1024 * 1024); // 1MB to  bytes

        if (Buffer.byteLength(stringOriginalSubmission, 'utf8') > maxLengthInBytes) {
            console.log('The object exceeds 1MB. It will be truncated.');
            stringOriginalSubmission = stringOriginalSubmission.substring(0, maxLengthInBytes);
        }

        let bufferOriginalSubmission = Buffer.from(stringOriginalSubmission);

        let logOriginalSubmission = {
            ACTION_TYPE: 2,
            TITLE: "Original submission request",
            SCHEMA_NAME: SCHEMA_DENTAL,
            TABLE_NAME: "DENTAL_SERVICE",
            ACTION_DATA: bufferOriginalSubmission
        };
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

        const logSaved = await helper.insertLogIdReturn(logOriginalSubmission);
        if(!logSaved){
            console.log('The action could not be logged: '+logOriginalSubmission.TABLE_NAME+' '+logOriginalSubmission.TITLE);
        }

        dentalService.FIRST_NAME = data.first_name;
        dentalService.MIDDLE_NAME = data.middle_name;
        dentalService.LAST_NAME = data.last_name;

        if(!_.isEmpty(data.date_of_birth)){
            data.date_of_birth = new Date(data.date_of_birth);
            let result: string =   data.date_of_birth.toISOString().split('T')[0];
            dentalService.DATE_OF_BIRTH  = db.raw("TO_DATE( ? ,'YYYY-MM-DD') ", result);
        }else{
            dentalService.DATE_OF_BIRTH = null;
        }

        dentalService.HEALTH_CARD_NUMBER = data.health_card_number;
        dentalService.MAILING_ADDRESS = data.mailing_address;
        dentalService.CITY_OR_TOWN = data.city_or_town;
        dentalService.POSTAL_CODE = data.postal_code;
        dentalService.PHONE = data.phone;
        dentalService.EMAIL = data.email;
        dentalService.OTHER_COVERAGE = data.other_coverage;
        dentalService.ARE_YOU_ELIGIBLE_FOR_THE_PHARMACARE_AND_EXTENDED_HEALTH_CARE_BEN = data.are_you_eligible_for_the_pharmacare_and_extended_health_care_ben;
        dentalService.EMAIL_INSTEAD = data.email_instead;
        dentalService.HAVE_CHILDREN = data.have_children;
        dentalService.ASK_DEMOGRAPHIC = data.ask_demographic;

        if(_.isEmpty(data.identify_groups) && !_.isArray(data.identify_groups)) {
            dentalService.IDENTIFY_GROUPS = null;
        }else{
            dentalService.IDENTIFY_GROUPS =  db.raw("utl_raw.cast_to_raw(?) ", JSON.stringify(data.identify_groups));
        }

        dentalService.GENDER = data.gender;
        dentalService.EDUCATION = data.education;
        dentalService.OFTEN_BRUSH = data.often_brush;
        dentalService.STATE_TEETH = data.state_teeth;
        dentalService.OFTEN_FLOSS = data.often_floss;
        dentalService.STATE_GUMS = data.state_gums;
        dentalService.LAST_SAW_DENTIST = data.last_saw_dentist;

        if(_.isEmpty(data.reason_for_dentist) && !_.isArray(data.reason_for_dentist)) {
            dentalService.REASON_FOR_DENTIST = null;
        }else{
            dentalService.REASON_FOR_DENTIST =  db.raw("utl_raw.cast_to_raw(?) ", JSON.stringify(data.reason_for_dentist));
        }

        dentalService.BUY_SUPPLIES = data.buy_supplies;
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

        if(_.isEmpty(data.pay_for_visit) && !_.isArray(data.pay_for_visit)) {
            dentalService.PAY_FOR_VISIT = null;
        }else{
            dentalService.PAY_FOR_VISIT =  db.raw("utl_raw.cast_to_raw(?) ", JSON.stringify(data.pay_for_visit));
        }

        if(_.isEmpty(data.barriers) && !_.isArray(data.barriers)) {
            dentalService.BARRIERS = null;
        }else{
            dentalService.BARRIERS =  db.raw("utl_raw.cast_to_raw(?) ", JSON.stringify(data.barriers));
        }

        if(_.isEmpty(data.problems) && !_.isArray(data.problems)) {
            dentalService.PROBLEMS = null;
        }else{
            dentalService.PROBLEMS =  db.raw("utl_raw.cast_to_raw(?) ", JSON.stringify(data.problems));
        }

        if(_.isEmpty(data.services_needed) && !_.isArray(data.services_needed)) {
            dentalService.SERVICES_NEEDED = null;
        }else{
            dentalService.SERVICES_NEEDED =  db.raw("utl_raw.cast_to_raw(?) ", JSON.stringify(data.services_needed));
        }

        if(!_.isEmpty(data._attach_proof)){

            fileData = saveFile('_attach_proof', data);

            if(parseFloat(fileData["file_size"]) > 10){
                fileData = null;
            }

        }
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);
        dentalServiceSaved = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE`).insert(dentalService).into(`${SCHEMA_DENTAL}.DENTAL_SERVICE`).returning('ID');

        if(!dentalServiceSaved){
            if (!responseSent) {
                res.json({ status:400, message: 'Request could not be processed' });
            }else{
                console.log( 'Request could not be processed');
            }
            responseSent = true;
        }

        let dentalId = dentalServiceSaved.find((obj: any) => {return obj.id;});

        if(dentalServiceSaved){
            var updateSubmission = await db(`${SCHEMA_GENERAL}.ACTION_LOGS`).update('SUBMISSION_ID', dentalId.id).where("ID", logSaved);

            if(!updateSubmission){
                console.log('The action could not be logged: Update '+logOriginalSubmission.TABLE_NAME+' '+logOriginalSubmission.TITLE);
            }
        }

        if(!_.isEmpty(data.dependent_list)){
            let arrayDependents = await getDependents(dentalId.id, data.dependent_list);
            let dependentsSaved = false;

            if(!_.isEmpty(arrayDependents)){
                for (const dependent of await arrayDependents) {
                    await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`).insert(dependent).into(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`)
                    .then(() => {
                        dependentsSaved = true;
                    })
                    .catch((e) => {
                        dependentsSaved = false;
                        console.log(e);
                        res.send( {
                            status: 400,
                            message: 'Request could not be processed'
                        });
                    });
                }
            }
        }

        if(!_.isEmpty(fileData)){
            var dentalFiles = Object();
            db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);
            dentalFiles.DENTAL_SERVICE_ID = dentalId.id;
            dentalFiles.DESCRIPTION = fileData.description;
            dentalFiles.FILE_NAME = fileData.file_name;
            dentalFiles.FILE_TYPE = fileData.file_type;
            dentalFiles.FILE_SIZE = fileData.file_size;
            
            const blobData = Buffer.from( fileData.file_data, 'base64');
       
            // Execute the stored procedure using Knex
            const filesSaved = await db.raw(`
                BEGIN
                DENTAL.INSERT_FILES(?,?,?,?,?,?);
                END;
            `, [parseInt(dentalId.id), fileData.description.toString(),fileData.file_name.toString(),fileData.file_type.toString() , fileData.file_size.toString(),blobData]
            ).catch(error => {
                console.error("Error when trying to insert a document:", error);
            });
    
            if(!filesSaved){
                if (!responseSent) {
                    res.json({ status:400, message: 'Request could not be processed: DENTAL SERVICE store attachment failed' });
                }else{
                    console.log( `ID: ${dentalId.id.toString()}: Request could not be processed: DENTAL SERVICE store attachment failed`);
                }
                responseSent = true;
            }

        }

        let logFields = {
            ACTION_TYPE: 2,
            TITLE: "Insert submission",
            SCHEMA_NAME: SCHEMA_DENTAL,
            TABLE_NAME: "DENTAL_SERVICE",
            SUBMISSION_ID: dentalId.id
        };

        let loggedAction = await helper.insertLog(logFields);

        if(!loggedAction){
            console.log('The action could not be logged: '+logFields.TABLE_NAME+' '+logFields.TITLE);
        }
        if (!responseSent) {
            res.json({ status:200, message: 'Request saved' });
        }

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 404,
            message: 'Request could not be processed ' + e
        });
    }

});

/**
 * Save Internal fields information
 *
 * @param {data}
 */
dentalRouter.post("/storeInternalFields", async (req: Request, res: Response) => {
    try {
        let data = req.body.params;
        let internalFieldsSaved = Object();
        let dateEnrollment = Object();
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

        if(!_.isEmpty(data.dateEnrollment)){
            data.dateEnrollment = new Date(data.dateEnrollment);
            let result: string =   data.dateEnrollment.toISOString().split('T')[0];
            dateEnrollment  = db.raw("TO_DATE( ? ,'YYYY-MM-DD') ", result);
        }else{
            dateEnrollment = null;
        }

        if(data.id == 0){

            const internalFields = Object();

            internalFields.DENTAL_SERVICE_ID = data.idSubmission;
            internalFields.PROGRAM_YEAR = data.programYear;
            internalFields.INCOME_AMOUNT = data.income;
            internalFields.DATE_ENROLLMENT = dateEnrollment;
            internalFields.POLICY_NUMBER = data.policy;

            internalFieldsSaved = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_INTERNAL_FIELDS`).insert(internalFields).into(`${SCHEMA_DENTAL}.DENTAL_SERVICE_INTERNAL_FIELDS`);

        }else{
            internalFieldsSaved = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_INTERNAL_FIELDS`)
            .update({PROGRAM_YEAR: data.programYear,
                    INCOME_AMOUNT: data.income,
                    DATE_ENROLLMENT: dateEnrollment,
                    POLICY_NUMBER: data.policy})
            .whereIn("ID", data.id);
        }

        if(!internalFieldsSaved){
            res.json({ status:400, message: 'Request could not be processed' });
        }else{
            res.json({ status:200, message: 'Internal Field saved' });
        }

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Save comments
 *
 * @param {data}
 */
dentalRouter.post("/storeComments", async (req: Request, res: Response) => {
    try {

        let data = req.body.params;
        const comments = Object();
        let commentsSaved = Object();

        comments.DENTAL_SERVICE_ID = data.id;
        comments.USER_ID = data.user;
        comments.COMMENT_DESCRIPTION = data.comment;
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

        commentsSaved = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_COMMENTS`).insert(comments).into(`${SCHEMA_DENTAL}.DENTAL_SERVICE_COMMENTS`);

        if(!commentsSaved){
            res.json({ status:400, message: 'Request could not be processed' });
        }

        res.json({ status:200, message: 'Comment saved' });
    } catch(e) {
        console.log(e);  // debug if needed 
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Update Submission
 *
 * @param {idSubmission} id of submission
 * @param {data} submission fields
 * @return json
 */

dentalRouter.patch("/update", async (req: Request, res: Response) => {
    try {

        var idSubmission = req.body.params.idSubmission;
        var data = req.body.params.data;
        var dataFile = req.body.params.dataFile;
        var dentalFiles = Object();
        var currentDependents = Object();
        var newDependents = req.body.params.dataDependents.newDependents;
        var updatedDependents = req.body.params.dataDependents.updatedDependents;
        var deletedDependents = req.body.params.dataDependents.deletedDependents;
        var have_children = req.body.params.dataDependents.haveChildren;
        var updatedFields = req.body.params.dataUpdatedFields;
        var fieldList = Object();
        let responseSent = false;
        db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

        if(!_.isEmpty(data.DATE_OF_BIRTH)){
            let dob = new Date(data.DATE_OF_BIRTH);
            let result: string =   dob.toISOString().split('T')[0];
            data.DATE_OF_BIRTH  = db.raw("TO_DATE( ? ,'YYYY-MM-DD') ", result);
        }else{
            data.DATE_OF_BIRTH = null;
        }

        if(_.isNull(dataFile.FILE_ID) && !_.isNull(dataFile.FILE_NAME) && !dataFile.PROOF_INCOME){

            dentalFiles.DENTAL_SERVICE_ID = idSubmission;
            dentalFiles.DESCRIPTION = dataFile.DESCRIPTION;
            dentalFiles.FILE_NAME = dataFile.FILE_NAME;
            dentalFiles.FILE_TYPE = dataFile.FILE_TYPE;
            dentalFiles.FILE_SIZE = dataFile.FILE_SIZE ? dataFile.FILE_SIZE.toString() : dataFile.FILE_SIZE;

            const blobData = Buffer.from(dataFile.FILE_DATA , 'base64');

            // Execute the stored procedure using Knex
            const filesSaved = await db.raw(`
                BEGIN
                DENTAL.INSERT_FILES(?,?,?,?,?,?);
                END;
            `, [parseInt(idSubmission), dataFile.DESCRIPTION, dataFile.FILE_NAME, dataFile.FILE_TYPE,  dataFile.FILE_SIZE, blobData]
            ).catch(error => {
                console.error("Error when trying to insert a document:", error);
            });

            if(!filesSaved){
                if (!responseSent) {
                    res.json({ status:400, message: 'Request could not be processed' });
                }else{
                    console.log( 'Request could not be processed');
                }
                responseSent = true;

                
            }

        }else if(!_.isNull(dataFile.FILE_ID) && dataFile.PROOF_INCOME){

            var deleteFile = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_FILES`).where("ID", dataFile.FILE_ID).del();
            if(!deleteFile){
                if (!responseSent) {
                    res.json({ status:400, message: 'Request could not be processed' });
                }else{
                    console.log( 'Error when delete file');
                }
                responseSent = true;
            }

        }else if(!_.isNull(dataFile.FILE_ID) && !_.isNull(dataFile.FILE_DATA) && !dataFile.PROOF_INCOME){

            dentalFiles.DENTAL_SERVICE_ID = idSubmission;
            dentalFiles.DESCRIPTION = dataFile.DESCRIPTION;
            dentalFiles.FILE_NAME = dataFile.FILE_NAME;
            dentalFiles.FILE_TYPE = dataFile.FILE_TYPE;
            dentalFiles.FILE_SIZE = dataFile.FILE_SIZE ?  dataFile.FILE_SIZE.toString() : dataFile.FILE_SIZE ;
            dentalFiles.FILE_DATA = dataFile.FILE_DATA;
            
            const blobData = Buffer.from(dentalFiles.FILE_DATA, 'base64');

            const updateFile = await db.raw(`
                BEGIN
                DENTAL.UPDATE_FILES(?,?,?,?,?,?);
                END;
            `, [parseInt(idSubmission), dentalFiles.DESCRIPTION, dentalFiles.FILE_NAME, dentalFiles.FILE_TYPE, dentalFiles.FILE_SIZE, blobData]
            ).catch(error => {
                console.error("Error when trying to insert a document:", error);
            });

            if(!updateFile){
                if (!responseSent) {
                    res.json({ status:400, message: 'Request could not be processed' });
                }else{
                    console.log( 'Error when update file');
                }
                responseSent = true;                
            }

        }

        currentDependents = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`)
                                        .select('ID',
                                                'DENTAL_SERVICE_ID',
                                                'C_FIRSTNAME',
                                                'C_LASTNAME',
                                                'C_HEALTHCARE',
                                                'C_APPLY',
                                                'C_DOB'
                                        )
                                        .where('DENTAL_SERVICE_DEPENDENTS.DENTAL_SERVICE_ID', idSubmission);

        if(currentDependents.length > 0 && have_children.key == 2){
            var deleteDependets = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`).where("DENTAL_SERVICE_ID", idSubmission).del();

            if(!deleteDependets){
                if (!responseSent) {
                    res.json({ status:400, message: 'Request could not be processed' });
                }else{
                    console.log( 'Error when delete dependents');
                }
                responseSent = true;         
            }
        }

        if(newDependents.length > 0){

            _.forEach(newDependents, function(value: any) {
                if(!_.isEmpty(value.C_DOB)){
                    let dob = new Date(value.C_DOB);
                    let result: string =   dob.toISOString().split('T')[0];
                    value.C_DOB  = db.raw("TO_DATE( ? ,'YYYY-MM-DD') ", result);
                }else{
                    value.C_DOB = null;
                }
            });

            let dependentCreation = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`)
                                    .insert(newDependents)
                                    .into(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`);

            if(!dependentCreation){
                if (!responseSent) {
                    res.json({ status:400, message: 'Request could not be processed' });
                }else{
                    console.log( 'Error when create dependents');
                }
                responseSent = true;                   
            }

        }

        if(updatedDependents.length > 0){

            for (const row of updatedDependents) {

                if(!_.isEmpty(row.C_DOB)){
                    let dob = new Date(row.C_DOB);
                    let result: string = dob.toISOString().split('T')[0];
                    row.C_DOB  = db.raw("TO_DATE( ? ,'YYYY-MM-DD') ", result);
                }else{
                    row.C_DOB = null;
                }

                var dependentUpdate = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`)
                                        .update(row)
                                        .where("ID", row.ID);

                if(!dependentUpdate){
                    if (!responseSent) {
                        res.json({ status:400, message: 'Request could not be processed' });
                    }else{
                        console.log( 'Error when update dependents');
                    }
                    responseSent = true;       
                }

            }
        }

        if(deletedDependents.length > 0){

            const idSubmission: number[] = [];

            _.forEach(deletedDependents, function(value: any) {
                idSubmission.push(value.ID);
            });

            var dependentDelete = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`).whereIn("ID", idSubmission).del();

            if(!dependentDelete){
                if (!responseSent) {
                    res.json({ status:400, message: 'Request could not be processed' });
                }else{
                    console.log( 'Error when delete dependents');
                }
                responseSent = true;       
            }
        }

        if(data.ASK_DEMOGRAPHIC.key == 1){
            if(_.isEmpty(data.IDENTIFY_GROUPS) && !_.isArray(data.IDENTIFY_GROUPS)) {
                data.IDENTIFY_GROUPS = null;
            }else{
                data.IDENTIFY_GROUPS =  db.raw("utl_raw.cast_to_raw(?) ", JSON.stringify(data.IDENTIFY_GROUPS));
            }

            if(_.isEmpty(data.REASON_FOR_DENTIST) && !_.isArray(data.REASON_FOR_DENTIST)) {
                data.REASON_FOR_DENTIST = null;
            }else{
                data.REASON_FOR_DENTIST =  db.raw("utl_raw.cast_to_raw(?) ", JSON.stringify(data.REASON_FOR_DENTIST));
            }

            if(_.isEmpty(data.PAY_FOR_VISIT) && !_.isArray(data.PAY_FOR_VISIT)) {
                data.PAY_FOR_VISIT = null;
            }else{
                data.PAY_FOR_VISIT =  db.raw("utl_raw.cast_to_raw(?) ", JSON.stringify(data.PAY_FOR_VISIT));
            }

            if(_.isEmpty(data.BARRIERS) && !_.isArray(data.BARRIERS)) {
                data.BARRIERS = null;
            }else{
                data.BARRIERS =  db.raw("utl_raw.cast_to_raw(?) ", JSON.stringify(data.BARRIERS));
            }

            if(_.isEmpty(data.PROBLEMS) && !_.isArray(data.PROBLEMS)) {
                data.PROBLEMS = null;
            }else{
                data.PROBLEMS =  db.raw("utl_raw.cast_to_raw(?) ", JSON.stringify(data.PROBLEMS));
            }

            if(_.isEmpty(data.SERVICES_NEEDED) && !_.isArray(data.SERVICES_NEEDED)) {
                data.SERVICES_NEEDED = null;
            }else{
                data.SERVICES_NEEDED =  db.raw("utl_raw.cast_to_raw(?) ", JSON.stringify(data.SERVICES_NEEDED));
            }
        }

        data.HAVE_CHILDREN = have_children.text;
        data.ASK_DEMOGRAPHIC = data.ASK_DEMOGRAPHIC.text;

        var updateSubmission = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE`).update(data).where("ID", idSubmission);

        if(updateSubmission) {
            let type = "success";
            let message = "Submission updated successfully.";

            if (!responseSent) {
                res.json({ status:200, message: message, type: type });
            }else{
                console.log( 'Success:Updated submission');
            }
            responseSent = true;  

           
        }

        if(!_.isEmpty(updatedFields)) {
            fieldList =  db.raw("utl_raw.cast_to_raw(?) ", JSON.stringify(updatedFields));
        }else{
            fieldList = null;
        }

        let logFields = {
            ACTION_TYPE: 3,
            TITLE: "Update submission",
            SCHEMA_NAME: SCHEMA_DENTAL,
            TABLE_NAME: "DENTAL_SERVICE",
            SUBMISSION_ID: idSubmission,
            USER_ID: req.user?.db_user.user.id,
            ACTION_DATA: fieldList
        };

        let loggedAction = await helper.insertLog(logFields);

        if(!loggedAction){
            res.send( {
                status: 400,
                message: 'The action could not be logged'
            });
        }

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed ' + e
        });
    }
});

/**
 * Obtains string of Blob field
 *
 * @param {idDentalService}
 * @return {result}
 */
async function getDependents(idDentalService: any, arrayDependets: any): Promise<any[]>{

    let dependents = Array();
    db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

    _.forEach(arrayDependets, function(value: any, key: any) {
        let dataDependent = Object();

        if (!_.isEmpty(arrayDependets[key]['c_firstname']) ||
            !_.isEmpty(arrayDependets[key]['c_lastname']) ||
            !_.isEmpty(arrayDependets[key]['c_dob']) ||
            !_.isEmpty(arrayDependets[key]['c_healthcare']) ||
            !_.isEmpty(arrayDependets[key]['c_apply'])) {

            dataDependent.DENTAL_SERVICE_ID = idDentalService;
            dataDependent.C_FIRSTNAME = arrayDependets[key]['c_firstname'];
            dataDependent.C_LASTNAME = arrayDependets[key]['c_lastname'];

            if(!_.isEmpty(arrayDependets[key]['c_dob'])){
                arrayDependets[key]['c_dob'] = new Date(arrayDependets[key]['c_dob']);
                let result: string =   arrayDependets[key]['c_dob'].toISOString().split('T')[0];
                dataDependent.C_DOB  = db.raw("TO_DATE( ? ,'YYYY-MM-DD') ", result);
            }else{
                dataDependent.C_DOB = null;
            }

            dataDependent.C_HEALTHCARE = arrayDependets[key]['c_healthcare'];
            dataDependent.C_APPLY = arrayDependets[key]['c_apply'];

            dependents.push(dataDependent);
        }
    });

    return dependents;
}

async function getAllStatus(): Promise<any[]>{
    var dentalServiceStatus = Array();
    db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

    dentalServiceStatus = await db(`${SCHEMA_DENTAL}.DENTAL_STATUS`).select()
    .whereNot('ID', 4).then((rows: any) => {

        let arrayResult = Array();

        for (let row of rows) {
            arrayResult.push({text: row['description'], value: row['id']});
        }

        return arrayResult;
    });
    return dentalServiceStatus;
}

async function getCatalogSelect(table: any): Promise<any[]>{
    var arrayData = Array();
    db = await helper.getOracleClient(db, DB_CONFIG_DENTAL);

    arrayData = await db(`${SCHEMA_DENTAL}.${table}`).select().then((rows: any) => {
        let arrayResult = Array();

        for (let row of rows) {
            arrayResult.push({text: row['description'], value: row['id']});
        }

        return arrayResult;
    });

    return arrayData;
}

/**
 * Obtain file characteristics
 *
 * @param {field_name}
 * @param {data}
 * @return {fileData} array with file data
 */
function saveFile(field_name: any, data: any){
    var path = "";
    var fs = require("fs");
    const allowedExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png"]

    if(data[field_name] !== 'undefined' && (data[field_name]) && data[field_name]['data'] !== 'undefined'){

        var fileData = Object();
        var buffer = Buffer.from(data[field_name]['data'], 'base64');
        let mime = data[field_name]['mime'];
        let name = data[field_name]['name'];
        let extension = mime.split("/");
        let fileName = name.split(".");
        let safeName = (Math.random() + 1).toString(36).substring(7)+'_'+name;
        path = __dirname+'/'+safeName;

        fs.writeFileSync(path, buffer);

        // Obtain file's general information
        var stats = fs.statSync(path);

        // Convert the file size to megabytes
        var fileSizeInMegabytes = stats.size / (1024*1024);

        fileData["description"] = field_name;
        fileData["file_name"] = fileName[0];

        if(!allowedExtensions.includes(extension[1])){
            fileData["file_type"] = fileName[1];
        }else{
            fileData["file_type"] = extension[1];
        }

        fileData["file_size"] = fileSizeInMegabytes;
        fileData["file_data"] = data[field_name]['data'];

        fs.unlinkSync(path);
    }

    return fileData;
}

/**
 * Obtains string of Blob field
 *
 * @param {arrayData}
 * @return {stringData} string
 */
function getBlobField(arrayData: any){
    let stringData = "";
    const fieldList = helper.getJsonDataList(arrayData);

    _.forEach(fieldList, function(valueData: any, key: any) {
        stringData += valueData+", ";
    });

    return stringData.slice(0, -2);
}