import { AuditRepository } from './../repository/oracle/AuditRepository';
import { groupBy } from '../utils/groupBy';
import express, { Request, Response } from "express";
import { param } from "express-validator";
import { SubmissionStatusRepository } from "../repository/oracle/SubmissionStatusRepository";
var RateLimit = require('express-rate-limit');
const submissionStatusRepo = new SubmissionStatusRepository();
const auditRepo = new AuditRepository();

export const generalRouter = express.Router();
generalRouter.use(RateLimit({
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
generalRouter.get("/submissions/status/:action_id/:action_value", [
    param("action_id").notEmpty(), 
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getSubmissionsStatus(actionId, actionVal, permissions);
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
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
generalRouter.get("/submissions/:action_id/:action_value", [
    param("action_id").notEmpty(), 
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getSubmissions(actionId, actionVal, permissions);
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
 * @param { event_type } event type.
 * @return json
 */
generalRouter.get("/audit/data/:event_type", [
    param("event_type").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const event_type = parseInt(req.params.event_type);
        const result = await auditRepo.getAudit(event_type);
        res.send({ data: result });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show the audit timeline data.
 *
 * @return json
 */
generalRouter.get("/audit/timeline", async (req: Request, res: Response) => {

    try {
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await auditRepo.getAuditTimeline(permissions);
        res.send({ data: result });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain age from Dental Service data to show in the index view
 *
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
generalRouter.get("/submissions/age/:action_id/:action_value", [
    param("action_id").notEmpty(),
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getAgeSubmissions(actionId, actionVal, permissions);
        const labels = groupBy(result, i => i.age_range);
        res.send(
            {
                data: result,
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
 * Obtain gender from Dental Service data to show in the index view
 *
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
generalRouter.get("/submissions/gender/:action_id/:action_value", [
    param("action_id").notEmpty(),
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getGenderSubmissions(actionId, actionVal, permissions);
        const groupedId = groupBy(result, i => i.id);
        const labels = groupBy(result, i => i.gender_name);
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