<template>
	<div class="midwifery-service details">

		<Notifications ref="notifier"></Notifications>

		<v-row class="mb-5" no-gutters>
			<span class="title-service">Midwifery Requests</span>
		</v-row>

		<v-row class="submission-filters mb-4 text-right" no-gutters>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="6"
			></v-col>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="3"
			>
				<v-select
					v-model="selectAction"
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
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="1"
			>
				<v-btn
					color="#F3A901"
					class="white--text details-btn mt-1"
					id="apply-btn"
					@click="changeStatus"
				>
					Apply
				</v-btn>
			</v-col>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="2"
			>
				<v-btn
					color="#F3A901"
					class="mt-1"
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
		</v-row>
		<v-row no-gutters>
			<v-col cols="12" id="midwiferyPanels">
				<MidwiferyInformation
					v-bind:midwifery="itemsMidwifery"
					v-bind:options="optionsMidwifery"
					v-bind:panelModel="panelModel"
				/>

				<MidwiferyContactInformation
					v-bind:midwifery="itemsMidwifery"
					v-bind:options="optionsMidwifery"
					v-bind:panelModel="panelModel"
				/>

				<MidwiferyMedicalInformation
					v-bind:midwifery="itemsMidwifery"
					v-bind:options="optionsMidwifery"
					v-bind:panelModel="panelModel"
				/>

				<MidwiferyOtherMedicalInformation
					v-if="itemsMidwifery.menstrual_cycle_length
					|| itemsMidwifery.family_physician
					|| itemsMidwifery.physician_s_name
					|| itemsMidwifery.major_medical_conditions
					|| itemsMidwifery.provide_details3"
					v-bind:midwifery="itemsMidwifery"
					v-bind:options="optionsMidwifery"
					v-bind:panelModel="panelModel"
				/>

				<MidwiferyDemographicInformation
					v-if="itemsMidwifery.do_you_identify_with_one_or_more_of_these_groups_and_communitie
						|| itemsMidwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that"
					v-bind:midwifery="itemsMidwifery"
					v-bind:panelModel="panelModel"
				/>
			</v-col>
			<v-col lg="1"> </v-col>
		</v-row>
	</div>
</template>

<script>
const axios = require("axios");
import MidwiferyInformation from './MidwiferyInformation.vue';
import MidwiferyContactInformation from './MidwiferyContactInformation.vue';
import MidwiferyMedicalInformation from './MidwiferyMedicalInformation.vue';
import MidwiferyOtherMedicalInformation from './MidwiferyOtherMedicalInformation.vue';
import MidwiferyDemographicInformation from './MidwiferyDemographicInformation.vue';
import { MIDWIFERY_SHOW_URL } from "../../urls.js";
import { MIDWIFERY_VALIDATE_URL } from "../../urls.js";
import { MIDWIFERY_CHANGE_STATUS_URL } from "../../urls.js";
import html2pdf from "html2pdf.js";
import Notifications from "../Notifications.vue";

export default {
	name: "MidwiferyDetails",
	data: () => ({
		loading: false,
		selectAction:[],
		itemsMidwifery: [],
		optionsMidwifery: [],
		dialog: false,
		panelModel: [0],
		fileName: "",
		bulkActions: [],
		idStatusClosed: null,
	}),
	components: {
		Notifications,
		MidwiferyInformation,
		MidwiferyContactInformation,
		MidwiferyMedicalInformation,
		MidwiferyOtherMedicalInformation,
		MidwiferyDemographicInformation
	},
	created(){

	},
	mounted() {
		this.validateRecord();
	},
	methods: {
		validateRecord() {
			axios
			.get(MIDWIFERY_VALIDATE_URL+this.$route.params.midwifery_id)
			.then((resp) => {
				if(!resp.data.flagMidwifery){
					this.$router.push({
						path: '/midwifery',
						query: { type: 'nonexistent' }
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
			.get(MIDWIFERY_SHOW_URL+this.$route.params.midwifery_id)
			.then((resp) => {
				this.itemsMidwifery = resp.data.midwifery;
				this.optionsMidwifery = resp.data.options;
				this.fileName = resp.data.fileName;
				this.idStatusClosed = resp.data.midwiferyStatusClosed;
				this.bulkActions = resp.data.dataStatus;
				this.selectAction = resp.data.midwifery.status;
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
			var midwiferyId = [Number(this.$route.params.midwifery_id)];

			axios
			.patch(MIDWIFERY_CHANGE_STATUS_URL, {
                params: {
					requests: midwiferyId,
					requestStatus: this.actionSelected
				}
            })
			.then((resp) => {

				if(this.actionSelected == this.idStatusClosed){
					this.$router.push({
						path: '/midwifery',
						query: { type: 'status' }
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

			setTimeout(function() {
				html2pdf(document.getElementById("midwiferyPanels"), {
						margin: 5,
						filename: namePdf,
						pagebreak: {
							mode: ['avoid-all', 'css', 'legacy']
						}
				});
			}, 500);
		},
	},
};
</script>
