<template>
	<div class="dental-service details">
		<Notifications ref="notifier"></Notifications>
		<v-row class="mb-6" no-gutters>
			<v-col class="d-flex align-top">
				<span class="title-service">Edit Submission</span>
			</v-col>
		</v-row>
		<v-row no-gutters>
				<FormApplicantInformation
					ref="FormApplicantInformation"
					v-bind:dentalService="itemsDental"
					v-bind:panelModel="panelModel"
					v-bind:cityTown="itemsDentalCityTown"
					v-bind:editFields="updatedFields"
					@addField="addUpdatedFields"
				/>

				<FormAttachment
					ref="FormAttachment"
					v-bind:dentalService="itemsDental"
					v-bind:panelModel="panelModel"
					v-bind:editFields="updatedFields"
					@addField="addUpdatedFields"
				/>

				<FormDependents
					ref="FormDependents"
					v-bind:dentalService="itemsDental"
					v-bind:dentalDependents="itemsDentalDependents"
					v-bind:idSubmission="idSubmission"
					v-bind:panelModel="panelModel"
					v-bind:editFields="updatedFields"
					@addField="addUpdatedFields"
				/>

				<FormDemographic
					ref="FormDemographic"
					v-bind:dentalService="itemsDental"
					v-bind:groups="itemsDentalGroups"
					v-bind:genders="itemsDentalGenders"
					v-bind:educationLevels="itemsDentalEducationLevels"
					v-bind:often="itemsDentalOften"
					v-bind:timePeriods="itemsDentalTimePeriods"
					v-bind:states="itemsDentalStates"
					v-bind:reasons="itemsDentalReasons"
					v-bind:paymentMethods="itemsDentalPaymentMethods"
					v-bind:barriers="itemsDentalBarriers"
					v-bind:problems="itemsDentalProblems"
					v-bind:services="itemsDentalServices"
					v-bind:idSubmission="idSubmission"
					v-bind:panelModel="panelModel"
					v-bind:editFields="updatedFields"
					@addField="addUpdatedFields"
				/>

			<v-col lg="1"> </v-col>
		</v-row>
		<v-row no-gutters>
			<v-btn
				color="#F3A901"
				class="pull-right"
				:loading="loading"
				:disabled="disableUpdate"
				@click="getDataSubmission"
			>
				Update Submission
			</v-btn>
		</v-row>
	</div>
</template>

<script>
const axios = require("axios");
import store from "../../store";
import Notifications from "../Notifications.vue";
import FormApplicantInformation from './SubmissionForm/FormApplicantInformation.vue';
import FormAttachment from './SubmissionForm/FormAttachment.vue';
import FormDependents from './SubmissionForm/FormDependents.vue';
import FormDemographic from './SubmissionForm/FormDemographic.vue';
import { DENTAL_SHOW_URL, DENTAL_UPDATE_URL } from "../../urls.js";

export default {
	name: "DentalEditSubmission",
	data: () => ({
		loading: false,
		disableUpdate: true,
		itemsDental: [],
		itemsDentalFiles: [],
		itemsDentalDependents: [],
		itemsDentalCityTown: [],
		itemsDentalGroups: [],
		itemsDentalGenders: [],
		itemsDentalEducationLevels: [],
		itemsDentalOften: [],
		itemsDentalStates: [],
		itemsDentalTimePeriods: [],
		itemsDentalReasons: [],
		itemsDentalPaymentMethods: [],
		itemsDentalBarriers: [],
		itemsDentalProblems: [],
		itemsDentalServices: [],
		dialog: false,
		panelModel: [0, 1],
		showDownload: true,
		idSubmission: null,
		dbUser: null,
		dataApplicantInformation: {},
		dataAttachment: {},
		dataDependents: {},
		dataDemographic: {},
		dataSubmission: {},
		updatedFields: []

	}),
	components: {
		Notifications,
		FormApplicantInformation,
		FormAttachment,
		FormDependents,
		FormDemographic
	},
	beforeCreate: async function() {
        await store.dispatch("checkAuthentication");
        this.dbUser = store.getters.dbUser;
    },
	mounted() {
		this.idSubmission = this.$route.params.dentalService_id;
		this.getDataFromApi();
	},
	methods: {
		getDataFromApi() {
			axios
			.get(DENTAL_SHOW_URL+this.idSubmission)
			.then((resp) => {
				this.itemsDental = resp.data.dataDentalService;
				this.itemsDentalFiles = resp.data.dentalFiles;

				resp.data.dataDentalDependents.forEach((element) => {
					element.menu = false;
				});

				this.itemsDentalDependents = resp.data.dataDentalDependents;
				this.itemsDentalCityTown = resp.data.dataDentalCityTown;
				this.itemsDentalGroups = resp.data.dataDentalGroups;
				this.itemsDentalGenders = resp.data.dataDentalGenders;
				this.itemsDentalEducationLevels = resp.data.dataEducationLevels;
				this.itemsDentalOften = resp.data.dataDentalOften;
				this.itemsDentalStates = resp.data.dataDentalStates;
				this.itemsDentalTimePeriods = resp.data.dataTimePeriods;
				this.itemsDentalReasons = resp.data.dataDentalReasons;
				this.itemsDentalPaymentMethods = resp.data.dataPaymentMethods;
				this.itemsDentalBarriers = resp.data.dataDentalBarriers;
				this.itemsDentalProblems = resp.data.dataDentalProblems;
				this.itemsDentalServices = resp.data.dataDentalNeedServices;
				this.disableUpdate = false;
				this.loading = false;
			})
			.catch((err) => console.error(err))
			.finally(() => {
			});
		},
		getDataSubmission(){
			const applicantInformation = this.$refs.FormApplicantInformation;
			const attachment = this.$refs.FormAttachment;
			const dependents = this.$refs.FormDependents;
			const demographic = this.$refs.FormDemographic;

			this.dataApplicantInformation = applicantInformation.getApplicantInformation();
			this.dataAttachment = attachment.getAttachment();
			this.dataDependents = dependents.getDependents();
			this.dataDemographic = demographic.getDemographic();

			this.dataSubmission = Object.assign(
										{},
										this.dataApplicantInformation,
										this.dataDemographic
									);

			this.updateSubmission();
		},
		updateSubmission() {
			this.disableUpdate = true;
			this.loading = true;
			axios
			.patch(DENTAL_UPDATE_URL, {
				params: {
					idSubmission: this.idSubmission,
					data: this.dataSubmission,
					dataFile: this.dataAttachment,
					dataDependents: this.dataDependents,
					dataUpdatedFields: this.updatedFields
				}
			})
			.then((resp) => {
				this.$refs.notifier.showSuccess(resp.data.message);
				this.getDataFromApi();
				this.$router.push({ path: '/dental/show/'+this.idSubmission });
			})
			.catch((err) => console.error(err));

		},
		addUpdatedFields(fields) {
			this.updatedFields.push(fields);
		},
	},
};
</script>