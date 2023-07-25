<template>
	<div class="dental-service details">
		<Notifications ref="notifier"></Notifications>
		<v-row class="mb-6" no-gutters>
			<v-col class="d-flex align-top">
				<span class="title-service">Edit Submission</span>
			</v-col>
		</v-row>
		<v-row no-gutters>
			<v-col id="dentalPanels">
				<h4>Applicant Information</h4>

				<FormApplicantInformation
					ref="FormApplicantInformation"
					v-bind:dentalService="itemsDental"
					v-bind:panelModel="panelModel"
					v-bind:cityTown="itemsDentalCityTown"
				/>

				<FormAttachment
					ref="FormAttachment"
					v-bind:dentalService="itemsDental"
					v-bind:panelModel="panelModel"
				/>

				<FormDependents
					ref="FormDependents"
					v-bind:dentalService="itemsDental"
					v-bind:dentalDependents="itemsDentalDependents"
					v-bind:idSubmission="idSubmission"
					v-bind:panelModel="panelModel"
				/>

			</v-col>
			<v-col lg="1"> </v-col>
		</v-row>
		<v-row no-gutters>
			<v-btn
				color="#F3A901"
				class="pull-right"
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
import { DENTAL_SHOW_URL, DENTAL_UPDATE_URL } from "../../urls.js";

export default {
	name: "DentalEditSubmission",
	data: () => ({
		loading: false,
		itemsDental: [],
		itemsDentalFiles: [],
		itemsDentalDependents: [],
		itemsDentalCityTown: [],
		dialog: false,
		panelModel: [0, 1],
		showDownload: true,
		idSubmission: null,
		dbUser: null,
		dataApplicantInformation: {},
		dataAttachment: {}
	}),
	components: {
		Notifications,
		FormApplicantInformation,
		FormAttachment,
		FormDependents
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
			})
			.catch((err) => console.error(err))
			.finally(() => {
			});
		},
		getDataSubmission(){
			const applicantInformation = this.$refs.FormApplicantInformation;
			const attachment = this.$refs.FormAttachment;
			const dependents = this.$refs.FormDependents;

			this.dataApplicantInformation = applicantInformation.getApplicantInformation();
			this.dataAttachment = attachment.getAttachment();
			this.dataDependents = dependents.getDependents();

			/*const dataSubmission = Object.assign(
										{},
										this.dataApplicantInformation,
										this.dataAttachment
									);
			*/

			this.updateSubmission();
		},
		updateSubmission() {

			axios
			.patch(DENTAL_UPDATE_URL, {
				params: {
					idSubmission: this.idSubmission,
					data: this.dataApplicantInformation,
					dataFile: this.dataAttachment,
					dataDependents: this.dataDependents
				}
			})
			.then((resp) => {
				this.$refs.notifier.showSuccess(resp.data.message);
				this.getDataFromApi();
			})
			.catch((err) => console.error(err));

		},
	},
};
</script>