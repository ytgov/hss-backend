require('dotenv').config();
const knex = require('knex');

let path;
switch (process.env.NODE_ENV) {
	case "test":
		path = `.env.test`;
    break;
	case "production":
		path = `.env`;
    break;
	default:
		path = `.env.development`;
}

require('dotenv').config({ path: path });

const DB_USER = process.env.DB_USER || '';
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST || '';
const DB_PORT = process.env.DB_PORT || '';
const DB_NAME = process.env.DB_NAME || '';
const DB_SERVICE = process.env.DB_SERVICE || '';
const SCHEMA_CONSTELLATION = process.env.SCHEMA_CONSTELLATION || '';
const SCHEMA_GENERAL = process.env.SCHEMA_GENERAL || '';

const DB_USER_EDMS = process.env.DB_USER_EDMS || '';
const DB_PASS_EDMS = process.env.DB_PASS_EDMS || '';
const DB_HOST_EDMS = process.env.DB_HOST_EDMS || '';
const DB_PORT_EDMS = process.env.DB_PORT_EDMS || '';

const CONSTELLATION_IDS = process.env.CONSTELLATION_IDS || '';

const DB_NAME_CONSTELLATION_EDMS = process.env.DB_NAME_CONSTELLATION_EDMS || '';

const emdsConstellationConfig = {
	client: 'mysql',
	connection: {
		host: DB_HOST_EDMS,
		port: DB_PORT_EDMS,
		user: DB_USER_EDMS,
		password: DB_PASS_EDMS,
		database: DB_NAME_CONSTELLATION_EDMS,
		requestTimeout: 10000,
		timezone: 'UTC'
	}
};

const DB_CONFIG_CONSTELLATION = {
	client: 'oracledb',
	connection: {
		host: `${DB_HOST}:${DB_PORT}`,
		user: DB_USER,
		password: DB_PASS,
		database: DB_NAME,
		requestTimeout: 100,
		instanceName: DB_SERVICE,
		connectString: `(DESCRIPTION=
			(ADDRESS_LIST=
			(ADDRESS=(PROTOCOL=TCP)
			(HOST=${DB_HOST})(PORT=${DB_PORT}) ) )
			(CONNECT_DATA=(SERVICE_NAME=${DB_SERVICE}) ) )`
	}
};

async function main() {
	try {

		console.log('Verifying CONSTELLATION IDS...');

		if(typeof CONSTELLATION_IDS === "string" && CONSTELLATION_IDS.trim().length > 0){
			const dbHss = knex(DB_CONFIG_CONSTELLATION);
			const dbEdms = knex(emdsConstellationConfig);

			console.log('Processing CONSTELLATION data migration...');

			const submissionsID = CONSTELLATION_IDS.split(/\s*,\s*/);
			if (submissionsID && submissionsID.length > 0) {

			var constellationService = await dbEdms("constellation_health").select().whereIn('id', submissionsID);

			var edmsLanguages = await dbEdms("constellation_health_language").select().then((rows) => {
				let arrayResult = Object();

				for (let row of rows) {
					arrayResult[row['id']] = row['value'];
				}

				return arrayResult;
			});

			var edmsDemographics = await dbEdms("constellation_health_demographics").select().then((rows) => {
				let arrayResult = Object();

				for (let row of rows) {
					arrayResult[row['id']] = row['value'];
				}

				return arrayResult;
			});

			var edmsHistory = await dbEdms(`constellation_health_diagnosis_history`).select().then((rows) => {
				let arrayResult = Object();

				for (let row of rows) {
					arrayResult[row['id']] = row['value'];
				}

				return arrayResult;
			});

			var constellationStatus = await dbHss(`${SCHEMA_CONSTELLATION}.CONSTELLATION_STATUS`).select().then((rows) => {
				let arrayResult = Object();

				for (let row of rows) {
					arrayResult[row['DESCRIPTION']] = row['ID'];
				}

				return arrayResult;
			});

			var constellationLanguages = await dbHss(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE`).select().then((rows) => {
				let arrayResult = Object();

				for (let row of rows) {
					arrayResult[row['VALUE']] = row['ID'];
				}

				return arrayResult;
			});

			var constellationDemographics = await dbHss(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS`).select().then((rows) => {
				let arrayResult = Object();

				for (let row of rows) {
					arrayResult[row['VALUE']] = row['ID'];
				}

				return arrayResult;
			});

			var constellationDiagnosis = await dbHss(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DIAGNOSIS_HISTORY`).select().then((rows) => {
				let arrayResult = Object();

				for (let row of rows) {
					arrayResult[row['VALUE']] = row['ID'];
				}

				return arrayResult;
			});

			let arraySubmissions = Array();
			let arraySubmissionsAux = Array();
			let constellationId = Object();
			let idSubmissions = [];

			constellationService.forEach(function (value) {

				let dataSubmission = Object();
				let dataSubmissionAux = Object();

				idSubmissions.push(value.id);

				switch (value.status) {
					case "open":
						dataSubmission.STATUS = constellationStatus['New/Unread'];
						break;
					case "accepted":
						dataSubmission.STATUS = constellationStatus.Entered;
						break;
					case "denied":
						dataSubmission.STATUS = constellationStatus.Declined;
						break;
					case "closed":
						dataSubmission.STATUS = constellationStatus.Closed;
						break;
				}

				dataSubmission.FIRST_NAME = value.first_name;
				dataSubmission.LAST_NAME = value.last_name;
				dataSubmission.IS_THIS_YOUR_LEGAL_NAME_ = value.is_this_your_legal_name_;

				dataSubmissionAux.ID_OLD = value.id;
				dataSubmissionAux.FIRST_NAME = value.first_name;
				dataSubmissionAux.LAST_NAME = value.last_name;

				let legal_name = "";

				if (value.your_legal_name !== undefined && value.your_legal_name !== null && value.your_legal_name !== '') {
					legal_name = value.your_legal_name;
				}else{
					legal_name = value.first_name+" "+value.last_name;
				}

				dataSubmission.YOUR_LEGAL_NAME = legal_name;
				dataSubmission.PRONOUNS = value.pronouns;

				if(value.date_of_birth !== null || value.date_of_birth !== ''){
					value.date_of_birth = value.date_of_birth.toISOString();
					let result = value.date_of_birth.split('T')[0];
					result = result.replace(/\.000Z$/, '');
					dataSubmission.DATE_OF_BIRTH  = dbHss.raw(`TO_DATE( ? ,'YYYY-MM-DD') `, result);
				}else{
					dataSubmission.DATE_OF_BIRTH = null;
				}

				dataSubmission.HAVE_YHCIP = value.have_yhcip;
				dataSubmission.HEALTH_CARE_CARD = value.health_care_card;
				dataSubmission.PROVINCE = value.province;
				dataSubmission.YHCIP = value.yhcip;
				dataSubmission.POSTAL_CODE = value.postal_code;
				dataSubmission.PREFER_TO_BE_CONTACTED = value.prefer_to_be_contacted;
				dataSubmission.PHONE_NUMBER = value.phone_number;
				dataSubmission.EMAIL_ADDRESS = value.email_address;
				dataSubmission.LEAVE_PHONE_MESSAGE = value.leave_phone_message;
				dataSubmission.PREFERRED_LANGUAGE = null;

				if(value.language_prefer_to_receive_services !== null || value.language_prefer_to_receive_services !== ''){

					if(edmsLanguages[value.language_prefer_to_receive_services] in constellationLanguages) {
						dataSubmission.LANGUAGE_PREFER_TO_RECEIVE_SERVICES = constellationLanguages[edmsLanguages[value.language_prefer_to_receive_services]];
					}

					if(value.preferred_language !== undefined && value.preferred_language !== null && value.preferred_language !== ''){
						dataSubmission.PREFERRED_LANGUAGE = value.preferred_language;
					}
				}else{
					dataSubmission.LANGUAGE_PREFER_TO_RECEIVE_SERVICES = null;
				}

				dataSubmission.INTERPRETATION_SUPPORT = value.interpretation_support;
				dataSubmission.FAMILY_PHYSICIAN = value.family_physician;
				dataSubmission.CURRENT_FAMILY_PHYSICIAN = value.current_family_physician;
				dataSubmission.ACCESSING_HEALTH_CARE = value.accessing_health_care;

				if(value.diagnosis !== null && value.diagnosis !== ''){

					let parts = value.diagnosis.split(',');
					let result = [];
					let textParts = [];

					parts.forEach(part => {

						let trimmedPart = part.trim();

						if (!isNaN(trimmedPart) && trimmedPart !== '') {
							if (textParts.length > 0) {
								result.push(textParts.join(', '));
								textParts = [];
							}

							result.push(trimmedPart);
						} else {
							textParts.push(trimmedPart);
						}
					});

					if (textParts.length > 0) {
						result.push(textParts.join(', '));
					}

					let stringDiagnosis = "";
					var count = 1;
					var max = result.length;

					result.forEach(element => {
						let diagnosisItem = "";

						if(edmsHistory[element] in constellationDiagnosis) {
							diagnosisItem = constellationDiagnosis[edmsHistory[element]];
						}else{
							diagnosisItem = element
						}

						if(count == max){
							if(/^-?\d+(\.\d+)?$/.test(diagnosisItem)){
								stringDiagnosis += diagnosisItem;
							}else{
								stringDiagnosis += '"'+diagnosisItem+'"';
							}
						}else{
							if(/^-?\d+(\.\d+)?$/.test(diagnosisItem)){
								stringDiagnosis += diagnosisItem+",";
							}else{
								stringDiagnosis += '"'+diagnosisItem+'",';
							}
						}

						count++;
					});

					dataSubmission.DIAGNOSIS = stringDiagnosis ? dbHss.raw(`UTL_RAW.CAST_TO_RAW( ? )`, "["+stringDiagnosis+"]") : null;

				}else{
					dataSubmission.DIAGNOSIS = null;
				}

				if(value.demographics_groups !== null || value.demographics_groups !== ''){
					if(edmsDemographics[value.demographics_groups] in constellationDemographics) {
						dataSubmission.DEMOGRAPHICS_GROUPS = constellationDemographics[edmsDemographics[value.demographics_groups]];
					}else{
						dataSubmission.DEMOGRAPHICS_GROUPS = null;
					}
				}else{
					dataSubmission.DEMOGRAPHICS_GROUPS = null;
				}

				dataSubmission.INCLUDE_FAMILY_MEMBERS = value.include_family_members;
				let createdDate = new Date(value.created_at);
				value.created_at = createdDate.toISOString();
				dataSubmission.CREATED_AT = dbHss.raw(
					`TO_TIMESTAMP_TZ(?, 'YYYY-MM-DD\"T\"HH24:MI:SS.FF3\"Z\"')`,
					value.created_at
				);

				let updatedDate = new Date(value.updated_at);
				value.updated_at = updatedDate.toISOString();
				dataSubmission.UPDATED_AT = dbHss.raw(
					`TO_TIMESTAMP_TZ(?, 'YYYY-MM-DD\"T\"HH24:MI:SS.FF3\"Z\"')`,
					value.updated_at
				);

				arraySubmissions.push(dataSubmission);
				arraySubmissionsAux.push(dataSubmissionAux);
			});

			var constellationFamily = await dbEdms(`constellation_health_family_members`).select().whereIn(`constellation_health_id`, idSubmissions);

			for (const [key, valueSubmission] of arraySubmissions.entries()) {

				let constellationSaved = await dbHss(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`).insert(valueSubmission).into(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`).returning('ID');

				if(constellationSaved){
					constellationId = constellationSaved.find((obj) => {return obj.ID;});

					let logSaved = Object();
					let logFields = {
						ACTION_TYPE: 2,
						TITLE: "Insert submission",
						SCHEMA_NAME: SCHEMA_CONSTELLATION,
						TABLE_NAME: "CONSTELLATION_HEALTH",
						SUBMISSION_ID: constellationId.ID
					};

					logSaved = await dbHss(`${SCHEMA_GENERAL}.ACTION_LOGS`).insert(logFields).into(`${SCHEMA_GENERAL}.ACTION_LOGS`);

					if(!logSaved){
						console.log("Error while inserting Log - Constellation insert");
					}

					var dependentsInsert = Array();

					if(constellationFamily && constellationFamily.length > 0) {

						constellationFamily.forEach(function (valueDependent) {
							if(arraySubmissionsAux[key].ID_OLD == valueDependent.constellation_health_id) {

								let dataDependent = Object();

								dataDependent.CONSTELLATION_HEALTH_ID = constellationId.ID;
								dataDependent.FIRST_NAME_FAMILY_MEMBER = valueDependent.first_name_family_member;
								dataDependent.LAST_NAME_FAMILY_MEMBER = valueDependent.last_name_family_member;
								dataDependent.IS_THIS_YOUR_LEGAL_NAME_FAMILY_MEMBER = valueDependent.is_this_your_legal_name_family_member;

								let legal_name = "";

								if(valueDependent.your_legal_name_family_member !== undefined && valueDependent.your_legal_name_family_member !== null && valueDependent.your_legal_name_family_member !== '') {
									legal_name = valueDependent.your_legal_name_family_member;
								}else{
									legal_name = valueDependent.first_name_family_member+" "+valueDependent.last_name_family_member;
								}

								dataDependent.YOUR_LEGAL_NAME_FAMILY_MEMBER = legal_name;
								dataDependent.PRONOUNS_FAMILY_MEMBER = valueDependent.pronouns_family_member;

								if(valueDependent.date_of_birth_family_member == null || !valueDependent.date_of_birth_family_member || valueDependent.date_of_birth_family_member == '0000-00-00'){
									dataDependent.DATE_OF_BIRTH_FAMILY_MEMBER = null;
								}else if (valueDependent.date_of_birth_family_member instanceof Date){
									valueDependent.date_of_birth_family_member = valueDependent.date_of_birth_family_member.toISOString();
									let result = valueDependent.date_of_birth_family_member.split('T')[0];
									result = result.replace(/\.000Z$/, '');
									dataDependent.DATE_OF_BIRTH_FAMILY_MEMBER  = dbHss.raw("TO_DATE( ? ,'YYYY-MM-DD') ", result);
								}else if (typeof valueDependent.date_of_birth_family_member === 'string') {
									const dateParts = valueDependent.date_of_birth_family_member.split('-');
									// Validate that there are three parts in the date (year, month, day)
									if (dateParts.length === 3) {
										const year = parseInt(dateParts[0], 10);
										const month = parseInt(dateParts[1], 10) - 1;  // Subtract 1 because months in JavaScript are 0-indexed
										const day = parseInt(dateParts[2], 10);

										// Create a Date object with the date parts
										const dateObject = new Date(year, month, day);

										// Validate that the date is valid
										if (!isNaN(dateObject.getTime())) {
											// The date is valid, you can use it as needed
											valueDependent.date_of_birth_family_member = dateObject.toISOString();
											let result = valueDependent.date_of_birth_family_member.split('T')[0];
											result = result.replace(/\.000Z$/, '');
											dataDependent.DATE_OF_BIRTH_FAMILY_MEMBER  = dbHss.raw("TO_DATE( ? ,'YYYY-MM-DD') ", result);
										} else {
											dataDependent.DATE_OF_BIRTH_FAMILY_MEMBER = null;
										}
									} else {
										dataDependent.DATE_OF_BIRTH_FAMILY_MEMBER = null;
									}
								}

								dataDependent.HAVE_YHCIP_FAMILY_MEMBER = valueDependent.have_yhcip_family_member;
								dataDependent.HEALTH_CARE_CARD_FAMILY_MEMBER = valueDependent.health_care_card_family_member;
								dataDependent.PROVINCE_FAMILY_MEMBER = valueDependent.province_family_member;
								dataDependent.YHCIP_FAMILY_MEMBER = valueDependent.yhcip_family_member;
								dataDependent.RELATIONSHIP_FAMILY_MEMBER = valueDependent.relationship_family_member;
								dataDependent.POSTAL_CODE_FAMILY_MEMBER = valueDependent.postal_code_family_member;
								dataDependent.PREFER_TO_BE_CONTACTED_FAMILY_MEMBER = valueDependent.prefer_to_be_contacted_family_member;
								dataDependent.PHONE_NUMBER_FAMILY_MEMBER = valueDependent.phone_number_family_member;
								dataDependent.EMAIL_ADDRESS_FAMILY_MEMBER = valueDependent.email_address_family_member;
								dataDependent.LEAVE_PHONE_MESSAGE_FAMILY_MEMBER = valueDependent.leave_phone_message_family_member;
								dataDependent.PREFERRED_LANGUAGE_FAMILY_MEMBER = null;

								if(valueDependent.language_prefer_to_receive_services_family_member !== null || valueDependent.language_prefer_to_receive_services_family_member !== ''){

									if(edmsLanguages[valueDependent.language_prefer_to_receive_services_family_member] in constellationLanguages) {
										dataDependent.LANGUAGE_PREFER_TO_RECEIVE_SERVICES_FAMILY_MEMBER = constellationLanguages[edmsLanguages[valueDependent.language_prefer_to_receive_services_family_member]];
									}

									if(valueDependent.preferred_language_family_member !== undefined && valueDependent.preferred_language_family_member !== null && valueDependent.preferred_language_family_member !== ''){
										dataDependent.PREFERRED_LANGUAGE_FAMILY_MEMBER = valueDependent.preferred_language_family_member;
									}
								}else{
									dataDependent.LANGUAGE_PREFER_TO_RECEIVE_SERVICES_FAMILY_MEMBER = null;
								}

								dataDependent.INTERPRETATION_SUPPORT_FAMILY_MEMBER = valueDependent.interpretation_support_family_member;
								dataDependent.FAMILY_PHYSICIAN_FAMILY_MEMBER = valueDependent.family_physician_family_member;
								dataDependent.CURRENT_FAMILY_PHYSICIAN_FAMILY_MEMBER = valueDependent.current_family_physician_family_member;
								dataDependent.ACCESSING_HEALTH_CARE_FAMILY_MEMBER = valueDependent.accessing_health_care_family_member;

								if(valueDependent.diagnosis_family_member !== null && valueDependent.diagnosis_family_member !== ''){
									let parts = valueDependent.diagnosis_family_member.split(',');
									let result = [];
									let textParts = [];

									parts.forEach(part => {

										let trimmedPart = part.trim();

										if (!isNaN(trimmedPart) && trimmedPart !== '') {
											if (textParts.length > 0) {
												result.push(textParts.join(', '));
												textParts = [];
											}

											result.push(trimmedPart);
										} else {
											textParts.push(trimmedPart);
										}
									});

									if (textParts.length > 0) {
										result.push(textParts.join(', '));
									}

									let stringDiagnosis = "";
									var count = 1;
									var max = result.length;

									result.forEach(element => {
										let diagnosisItem = "";

										if(edmsHistory[element] in constellationDiagnosis) {
											diagnosisItem = constellationDiagnosis[edmsHistory[element]];
										}else{
											diagnosisItem = element
										}

										if(count == max){
											if(/^-?\d+(\.\d+)?$/.test(diagnosisItem)){
												stringDiagnosis += diagnosisItem;
											}else{
												stringDiagnosis += '"'+diagnosisItem+'"';
											}
										}else{
											if(/^-?\d+(\.\d+)?$/.test(diagnosisItem)){
												stringDiagnosis += diagnosisItem+",";
											}else{
												stringDiagnosis += '"'+diagnosisItem+'",';
											}
										}

										count++;
									});

									dataDependent.DIAGNOSIS_FAMILY_MEMBER = stringDiagnosis ? dbHss.raw(`UTL_RAW.CAST_TO_RAW( ? )`, "["+stringDiagnosis+"]") : null;

								}else{
									dataDependent.DIAGNOSIS_FAMILY_MEMBER = null;
								}

								if(valueDependent.demographics_groups_family_member !== null || valueDependent.demographics_groups_family_member !== ''){
									if(edmsDemographics[valueDependent.demographics_groups_family_member] in constellationDemographics) {
										dataDependent.DEMOGRAPHICS_GROUPS_FAMILY_MEMBER = constellationDemographics[edmsDemographics[valueDependent.demographics_groups_family_member]];
									}else{
										dataDependent.DEMOGRAPHICS_GROUPS_FAMILY_MEMBER = null;
									}
								}else{
									dataDependent.DEMOGRAPHICS_GROUPS_FAMILY_MEMBER = null;
								}

								dataDependent.INCLUDE_FAMILY_MEMBERS_FAMILY_MEMBER = valueDependent.include_family_members_family_member;

								let createdDate = new Date(valueDependent.created_at);
								valueDependent.created_at = createdDate.toISOString();
								dataDependent.CREATED_AT = dbHss.raw(
									`TO_TIMESTAMP_TZ(?, 'YYYY-MM-DD\"T\"HH24:MI:SS.FF3\"Z\"')`,
									valueDependent.created_at
								);

								let updatedDate = new Date(valueDependent.updated_at);
								valueDependent.updated_at = updatedDate.toISOString();
								dataDependent.UPDATED_AT= dbHss.raw(
									`TO_TIMESTAMP_TZ(?, 'YYYY-MM-DD\"T\"HH24:MI:SS.FF3\"Z\"')`,
									valueDependent.updated_at
								);

								dependentsInsert.push(dataDependent);

							}
						});

						if (dependentsInsert.length > 0) {
							for (const fileData of dependentsInsert) {

								let dependentsSaved = await dbHss(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS`).insert(fileData).into(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS`);

								if(!dependentsSaved){
									console.log("Error while inserting Constellation Family Members CONSTELLATION_HEALTH_ID:"+constellationId.ID);
								}
							}
						}
					}

					console.log('CONSTELLATION Submission migration successful! ID:'+constellationId.ID);
				}else{
					console.log('Error while inserting Constellation Service ID:'+constellationId.ID);
				}

			}

			console.log('CONSTELLATION Migration process finished');

			}else{
				console.log("There are no ids to migrate");
			}

		}else{
			console.log("There are no ids to migrate");
		}

		process.exit(0);
	} catch (error) {
		console.error('Error:', error);
	}

}

main();
