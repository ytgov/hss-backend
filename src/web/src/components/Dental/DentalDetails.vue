<template>
	<div class="dental-service details">
		<Notifications ref="notifier"></Notifications>
		<v-row class="mb-6" no-gutters>
			<v-col class="d-flex align-top">
				<span class="title-service">Dental Requests</span>
			</v-col>
			<v-col
				cols="10"
				sm="6"
				md="10"
				lg="2"
				class="d-flex align-center"
			>
				<v-select
					v-model="selectAction"
					style="margin-top: 30px"
					:items="bulkActions"
					class="details-select"
					solo
					label="Update status"
					append-icon="mdi-chevron-down"
					prepend-inner-icon="mdi-layers-triple"
					color="grey lighten-2"
					item-color="grey lighten-2"
					@change="enterBulkAction"
					id="bulk-accion-select"
				>
				</v-select>
			</v-col>
        <v-col md="auto" class="d-flex align-center">
			<v-btn
				color="#F3A901"
				class="ma-2 white--text details-btn"
				id="apply-btn"
				@click="changeStatus"
			>
				Apply
			</v-btn>
			</v-col>

				<v-col 
					md="auto" 
				class="d-flex align-center"
					cols="2"
					sm="6"
				>
					<v-btn
						color="#F3A901"
						class="pull-right"
						dark
						@click="exportToPDF"
					>

						Export selected

						<v-icon
							right
							dark
						>
						mdi-file-move
						</v-icon>

					</v-btn>
			</v-col>
			<v-col lg="1"> </v-col>
		</v-row>
		<v-row no-gutters>
			<v-col id="dentalPanels">
				<v-btn
					color="#DC4405"
					class="pull-right"
					@click="editSubmission"
					v-if="showEdit"
					hidden
				>
					Edit submission
					<v-icon
						right
						dark
					>
					mdi-pencil
					</v-icon>
				</v-btn>
				<DentalApplicantInformation
					v-bind:dentalService="itemsDental"
					v-bind:panelModel="panelModel"
				/>

				<DentalDependents
					v-if="itemsDental.flagDependents"
					v-bind:dentalService="itemsDental"
					v-bind:dentalDependents="itemsDentalDependents"
					v-bind:panelModel="panelModel"
				/>

				<DentalDemographicInformation
					v-if="itemsDental.flagDemographic"
					v-bind:dentalService="itemsDental"
					v-bind:panelModel="panelModel"
				/>

				<DentalInformation
					v-if="itemsDental.flagDemographic"
					v-bind:dentalService="itemsDental"
					v-bind:panelModel="panelModel"
				/>

				<DentalAttachments
					v-if="itemsDental.flagFile"
					v-bind:dentalService="itemsDental"
					v-bind:dentalFiles="itemsDentalFiles"
					v-bind:panelModel="panelModel"
					v-bind:showDownload="showExport"
				/>

				<DentalInternalFields
					v-bind:dentalService="itemsDental"
					v-bind:idSubmission="idSubmission"
					v-bind:dentalInternalFields="itemsDentalInternalFields"
					v-bind:panelModel="panelModel"
					v-bind:showSubmit="showExport"
					v-bind:exportPDF="showExportClass"
					@getNotification="showNotification"
				/>

				<DentalComments
					v-bind:dentalService="itemsDental"
					v-bind:idSubmission="idSubmission"
					v-bind:dentalComments="itemsDentalComments"
					v-bind:userData="dbUser"
					v-bind:panelModel="panelModel"
					v-if="showExport"
					@getNotification="showNotification"
				/>

			</v-col>
			<v-col lg="1"> </v-col>
		</v-row>
	</div>
</template>

<script>
const axios = require("axios");
import store from "../../store";
import DentalApplicantInformation from './DentalApplicantInformation.vue';
import DentalDependents from './DentalDependents.vue';
import DentalDemographicInformation from './DentalDemographicInformation.vue';
import DentalInformation from './DentalInformation.vue';
import DentalAttachments from './DentalAttachments.vue';
import DentalInternalFields from './DentalInternalFields.vue';
import DentalComments from './DentalComments.vue';
import { DENTAL_SHOW_URL } from "../../urls.js";
import { DENTAL_VALIDATE_URL } from "../../urls.js";
import { DENTAL_CHANGE_STATUS_URL } from "../../urls.js";
import html2pdf from "html2pdf.js";
import Notifications from "../Notifications.vue";

export default {
	name: "DentalDetails",
	data: () => ({
		loading: false,
		selectAction:[],
		itemsDental: [],
		itemsDentalFiles: [],
		itemsDentalDependents: [],
		dialog: false,
		panelModel: [0],
		fileName: "",
		bulkActions: [],
		idStatusClosed: null,
		showExport: true,
		showEdit: false,
		showExportClass: false,
		idSubmission: null,
		dbUser: null,
		itemsDentalInternalFields: [],
		itemsDentalComments: [],
	}),
	components: {
		Notifications,
		DentalApplicantInformation,
		DentalDependents,
		DentalDemographicInformation,
		DentalInformation,
		DentalAttachments,
		DentalInternalFields,
		DentalComments
	},
	beforeCreate: async function() {
        await store.dispatch("checkAuthentication");
        this.dbUser = store.getters.dbUser;
    },
	mounted() {
		this.idSubmission = this.$route.params.dentalService_id;
		this.validateRecord();
	},
	methods: {
		validateRecord() {
			axios
			.get(DENTAL_VALIDATE_URL+this.idSubmission)
			.then((resp) => {
				if(!resp.data.flagDental){
					this.$router.push({
						path: '/dental',
						query: { message: resp.data.message, type: resp.data.type}
					});
				}else{
					this.getDataFromApi();
				}
			})
			.catch((err) => console.error(err))
			.finally(() => {
			});
		},
		getDataFromApi() {
			axios
			.get(DENTAL_SHOW_URL+this.idSubmission)
			.then((resp) => {
				this.itemsDental = resp.data.dataDentalService;
				this.fileName = resp.data.fileName;
				this.itemsDentalFiles = resp.data.dentalFiles;
				this.itemsDentalDependents =resp.data.dataDentalDependents;
				this.itemsDentalComments = resp.data.dataDentalComments;
				this.itemsDentalInternalFields = resp.data.dataDentalInternalFields;
				this.idStatusClosed = resp.data.dentalStatusClosed;
				this.bulkActions = resp.data.dataStatus;
				this.selectAction = resp.data.dataDentalService.status;
			})
			.catch((err) => console.error(err))
			.finally(() => {
			});
		},
		enterBulkAction(value) {
			this.actionSelected = value;
		},
		changeStatus(){
			//Sent it as an array to use the same function for both single and bulk status changes
			var dentalId = [Number(this.idSubmission)];

			axios
			.patch(DENTAL_CHANGE_STATUS_URL, {
                params: {
					requests: dentalId,
					requestStatus: this.actionSelected
				}
            })
			.then((resp) => {

				if(this.actionSelected == this.idStatusClosed){
					this.$router.push({
					path: '/dental',
					query: { message: resp.data.message, type: resp.data.type}
					});
				}else{
					this.$refs.notifier.showSuccess(resp.data.message);
				}
			})
			.catch((err) => console.error(err))
		},
		exportToPDF() {
			this.panelModel = [0];
			var namePdf = this.fileName;
			this.showExport = false;
			this.showExportClass = true;

			setTimeout(() => {
				html2pdf(document.getElementById("dentalPanels"), {
						margin: 5,
						filename: namePdf,
						pagebreak: {
							mode: ['avoid-all', 'css', 'legacy']
						}
				});

				this.showExport = true;
				this.showExportClass = false;
			}, 500);
		},
		showNotification(message) {
			this.$refs.notifier.showSuccess(message);
			this.getDataFromApi();
		},
		editSubmission(){
			this.$router.push({ path: '/dental/edit/'+this.idSubmission });
		}
	},
};
</script>
