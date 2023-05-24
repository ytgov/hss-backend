<template>
  <div class="dental-service details">
<!--     <v-container> -->
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
<!--
    </v-container>
    <v-container>
-->
		<v-row no-gutters>
			<v-col id="dentalPanels">
				<DentalApplicantInformation
					v-bind:dentalService="itemsDental"
					v-bind:dentalFiles="itemsDentalFiles"
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

				<v-expansion-panels
				multiple
				>
					<v-expansion-panel>
						<v-expansion-panel-header class="info">Internal Fields</v-expansion-panel-header>
						<v-expansion-panel-content>
						<v-row no-gutters>
							<v-col
							cols="12"
							sm="3"
							md="3"
							lg="3"
							style="margin: 10px;"
							>
								<v-text-field label="Program Year"></v-text-field>
							</v-col>
							<v-col
							cols="12"
							sm="3"
							md="3"
							lg="3"
							style="margin: 10px;"
							>
								<v-text-field label="Income Amount"></v-text-field>
							</v-col>
							<v-col
							cols="12"
							sm="3"
							md="3"
							lg="3"
							style="margin: 10px;"
							>
								<v-text-field label="Date of Enrollment"></v-text-field>
							</v-col>
						</v-row>
						<v-row no-gutters class="internal-field-row">
							<v-col
							cols="12"
							sm="3"
							md="3"
							lg="3"
							style="margin: 10px;"
							>
								<v-text-field label="policy number"></v-text-field>
							</v-col>
							<v-btn
								color="#F3A901"
								class="ma-2 white--text details-btn"
								id="apply-btn"
							>
								Apply
							</v-btn>
						</v-row>
						</v-expansion-panel-content>
					</v-expansion-panel>

				</v-expansion-panels>
			</v-col>
			<v-col lg="1"> </v-col>
		</v-row>
<!--     </v-container> -->

	</div>
</template>

<script>
const axios = require("axios");
import DentalApplicantInformation from './DentalApplicantInformation.vue';
import DentalDependents from './DentalDependents.vue';
import DentalDemographicInformation from './DentalDemographicInformation.vue';
import DentalInformation from './DentalInformation.vue';
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
	}),
	components: {
    Notifications,
		DentalApplicantInformation,
		DentalDependents,
		DentalDemographicInformation,
		DentalInformation
	},
	created(){

	},
	mounted() {
		this.validateRecord();
	},
	methods: {
		validateRecord() {
			axios
			.get(DENTAL_VALIDATE_URL+this.$route.params.dentalService_id)
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
			.get(DENTAL_SHOW_URL+this.$route.params.dentalService_id)
			.then((resp) => {
				this.itemsDental = resp.data.dataDentalService;
				this.fileName = resp.data.fileName;
				this.itemsDentalFiles = resp.data.dentalFiles;
				this.itemsDentalDependents =resp.data.dataDentalDependents;
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
			var dentalId = [Number(this.$route.params.dentalService_id)];

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

			setTimeout(function() {
				html2pdf(document.getElementById("dentalPanels"), {
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
