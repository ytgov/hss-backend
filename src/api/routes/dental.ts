import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import { SubmissionStatusRepository } from "../repository/oracle/SubmissionStatusRepository";
import knex from "knex";
import { DB_CONFIG_DENTAL, SCHEMA_DENTAL } from "../config";
import { groupBy, helper } from "../utils";
import { checkPermissions } from "../middleware/permissions";
var RateLimit = require('express-rate-limit');
var _ = require('lodash');


const db = knex(DB_CONFIG_DENTAL)
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
 * @return json
 */
dentalRouter.post("/", async (req: Request, res: Response) => {

    try {
        var dateFrom = req.body.params.dateFrom //? new Date(req.body.params.dateFrom) : '';
        var dateTo = req.body.params.dateTo //? new Date(req.body.params.dateTo) : '';
        var dateYear = req.body.params.dateYear
        let status_request = req.body.params.status;

        let query = db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_SUBMISSIONS`)
            .orderBy('ID', 'ASC');

        if(dateYear) {
            query.where(db.raw("EXTRACT(YEAR FROM TO_DATE(CREATED_AT, 'YYYY-MM-DD HH24:MI:SS')) = ?",
                [dateYear]));
        }

        if(dateFrom && dateTo) {
            const dateFromFormat = new Date(dateFrom);
            const dateToFormat = new Date(dateTo);

            dateFromFormat.setHours(0, 0, 0);
            const dateTimeFrom = dateFromFormat.toISOString();

            dateToFormat.setHours(23, 59, 59);
            const dateTimeTo = dateToFormat.toISOString();

            query.where(db.raw("CREATED_AT >=  ? AND CREATED_AT <= ?",
                [dateTimeFrom, dateTimeTo]));
        }

        if (status_request) {
            query.whereIn("STATUS", status_request);
        }

        const dentalService = await query;

        var dentalStatus = await getAllStatus();
        res.send({data: dentalService, dataStatus: dentalStatus});

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
        console.log(dentalService_id);
        console.log(status_id);
        var updateStatus = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE`).update({STATUS: status_id}).whereIn("ID", dentalService_id);
        if(updateStatus) {
            let type = "success";
            let message = "Status changed successfully.";

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
        var flagExists= true;
        var message= "";
        var type= "error";

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
            message= "The request you are consulting is closed or non existant, please choose a valid request.";
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
dentalRouter.get("/show/:dentalService_id", checkPermissions("constellation_view"), [param("dentalService_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        var dentalService_id = Number(req.params.dentalService_id);
        var dentalService = Object();
        var dentalServiceDependents = Object();
        var dentalFiles = Object();

        dentalService = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_SUBMISSIONS_DETAILS`)
            .where('ID', dentalService_id)
            .first();

        dentalServiceDependents = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_DEPENDENTS`)
                                        .select('DENTAL_SERVICE_DEPENDENTS.*')
                                        .where('DENTAL_SERVICE_DEPENDENTS.DENTAL_SERVICE_ID', dentalService_id);

        dentalFiles = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_FILES`).where("DENTAL_SERVICE_ID", dentalService_id).select().then((data:any) => {
            return data[0];
        });

        dentalService.flagFile = true;

        if(!_.isEmpty(dentalFiles)){
            dentalFiles.file_fullName = dentalFiles.file_name+"."+dentalFiles.file_type;
        }else{
            dentalService.flagFile = false;
        }

        dentalService.flagDemographic = true;
        if(!_.isEmpty(dentalService.ask_demographic)){
            let askDemographic = dentalService.ask_demographic.split(",");

            if(askDemographic[0] == "No" || askDemographic[0] == "no" || askDemographic[0] == "NO"){
                dentalService.flagDemographic = false;
            }
        }

        dentalService.flagDependents = false;

        if(!_.isEmpty(dentalServiceDependents)){
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

        var statusDental =  await db(`${SCHEMA_DENTAL}.DENTAL_STATUS`).where("DESCRIPTION", "Closed").select().first();

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        let todayDate = mm+'_'+dd+'_'+yyyy;
        let fileName = 'dental_service_request_details_'+todayDate+".pdf";

        var dentalStatus = await getAllStatus();

        res.json({ status: 200, dataStatus: dentalStatus, dataDentalService: dentalService, dataDentalDependents: dentalServiceDependents,
                    dentalStatusClosed: statusDental.id, fileName:fileName, dentalFiles:dentalFiles});
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

        var dentalFile_id = Number(req.params.dentalFile_id);
        var dentalFiles = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE_FILES`).where("ID", dentalFile_id).select().first();
        var buffer = Buffer.from(dentalFiles.file_data.toString(), 'base64');
        let safeName = (Math.random() + 1).toString(36).substring(7)+'_'+dentalFiles.file_name;
        let pathPublicFront = path.join(__dirname, "../../");
        pathFile = pathPublicFront+"/web/public/"+safeName+"."+dentalFiles.file_type;

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
        var filePath = pathPublicFront+"web/public/"+file;
        console.log(filePath);
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
 * Store midwifery data
 *
 * @return json
 */
dentalRouter.post("/store", async (req: Request, res: Response) => {

    try {
        let data = Object();
        const dentalService = Object();
        let dentalServiceSaved = Object();
        var fileData = Object();

        data = req.body;

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
        }

        dentalServiceSaved = await db(`${SCHEMA_DENTAL}.DENTAL_SERVICE`).insert(dentalService).into(`${SCHEMA_DENTAL}.DENTAL_SERVICE`).returning('ID');

        if(!dentalServiceSaved){
            res.json({ status:400, message: 'Request could not be processed' });
        }

        let dentalId = dentalServiceSaved.find((obj: any) => {return obj.id;});

        if(!_.isEmpty(data.dependent_list)){
            let arrayDependents = getDependents(dentalId.id, data.dependent_list);

            let dependentsSaved = false;

            for (const dependent of arrayDependents) {
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

        if(!_.isEmpty(fileData)){
            var filesInsert = Array();
            var dentalFiles = Object();

            dentalFiles.DENTAL_SERVICE_ID = dentalId.id
            dentalFiles.DESCRIPTION = fileData.description;
            dentalFiles.FILE_NAME = fileData.file_name;
            dentalFiles.FILE_TYPE = fileData.file_type;
            dentalFiles.FILE_SIZE = fileData.file_size;

            let array_file = fileData.file_data.match(/.{1,4000}/g)
            let query = '';

            array_file.forEach((element: string) => {
                query = query + " DBMS_LOB.APPEND(v_long_text, to_blob(utl_raw.cast_to_raw('" +element+"'))); ";
            });

            filesInsert.push(dentalFiles);

            var filesSaved = await db.raw(`
                DECLARE
                    v_long_text BLOB;
                BEGIN
                    DBMS_LOB.CREATETEMPORARY(v_long_text,true);`
                    + query +
                `
                    INSERT INTO ${SCHEMA_DENTAL}.DENTAL_SERVICE_FILES (DENTAL_SERVICE_ID, DESCRIPTION, FILE_NAME, FILE_TYPE, FILE_SIZE, FILE_DATA) VALUES (?,?,?,?, ?,v_long_text);
                END;
                `, [dentalId.id,fileData.description,fileData.file_name,fileData.file_type,fileData.file_size]);

            if(!filesSaved){
                res.json({ status:400, message: 'Request could not be processed' });
            }

        }

        res.json({ status:200, message: 'Request saved' });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }

});

/**
 * Obtains string of Blob field
 *
 * @param {idDentalService}
 * @return {result}
 */
function getDependents(idDentalService: any, arrayDependets: any){
    let dependents = Array();

    _.forEach(arrayDependets, function(value: any, key: any) {
        let dataDependent = Object();

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
    });

    return dependents;
}

async function getAllStatus(){
    var dentalServiceStatus = Array();

    dentalServiceStatus = await db(`${SCHEMA_DENTAL}.DENTAL_STATUS`).select().then((rows: any) => {
        let arrayResult = Array();

        for (let row of rows) {
            arrayResult.push({text: row['description'], value: row['id']});
        }

        return arrayResult;
    });
    return dentalServiceStatus;
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