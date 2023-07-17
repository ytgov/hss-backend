<template>
	<div class="dental-service details">
		<!-- <v-row class="mb-6" no-gutters>
			<v-col class="d-flex align-top">
				<span class="title-service">Edit Submission</span>
			</v-col>
		</v-row>
		<v-row no-gutters>
			<v-col id="dentalPanels">
				<h4>Applicant Information</h4>
				</br>
				<FormApplicantInformation
					v-bind:dentalService="itemsDental"
					v-bind:panelModel="panelModel"
				/>

			</v-col>
			<v-col lg="1"> </v-col>
		</v-row> -->
	</div>
</template>

<script>
const axios = require("axios");
import store from "../../store";
import FormApplicantInformation from './SubmissionForm/FormApplicantInformation.vue';
import { DENTAL_SHOW_URL } from "../../urls.js";

export default {
	name: "DentalEditSubmission",
	data: () => ({
		loading: false,
		itemsDental: [],
		itemsDentalFiles: [],
		itemsDentalDependents: [],
		dialog: false,
		panelModel: [0, 1],
		showDownload: true,
		idSubmission: null,
		dbUser: null,
	}),
	components: {
		FormApplicantInformation
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
				this.itemsDentalDependents =resp.data.dataDentalDependents;
			})
			.catch((err) => console.error(err))
			.finally(() => {
			});
		}
	},
};
</script>
