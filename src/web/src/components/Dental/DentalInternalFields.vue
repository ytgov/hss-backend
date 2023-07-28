<template>
	<v-expansion-panels
		multiple
		v-model="modelPanel"
	>
		<v-expansion-panel class="mb-6">
			<v-expansion-panel-header class="info">Internal Fields</v-expansion-panel-header>
			<v-expansion-panel-content class="bg-grey">
				<v-row no-gutters class="mt-5">
					<v-col
						cols="12"
						sm="3"
						md="3"
						lg="3"
					>
						<div class="custom-text-field" :class="{ 'internal-field-print': exportClass }">
							<label class="ml-5">Program Year</label>
							<v-select
								solo
								class="ml-5 mr-5"
								v-model="programYear"
								:items="internalFieldsYears"
								:rules="[rules.year]"
							>
							</v-select>
						</div>
					</v-col>
					<v-col
						cols="12"
						sm="3"
						md="3"
						lg="3"
					>
						<div class="custom-text-field" :class="{ 'internal-field-print': exportClass }">
							<label class="ml-5">Income Amount</label>
							<v-text-field
								solo
								class="ml-5 mr-5"
								v-model="income"
								type="number"
							>
							</v-text-field>
						</div>
					</v-col>
					<v-col
						cols="12"
						sm="3"
						md="3"
						lg="3"
					>

						<v-menu
							ref="menu"
							v-model="menu"
							:close-on-content-click="false"
							transition="scale-transition"
							min-width="auto"
						>
							<template v-slot:activator="{ on, attrs }">
								<div class="custom-text-field" :class="{ 'internal-field-print': exportClass }">
									<label class="ml-5">Date of Enrollment</label>
									<v-text-field
										solo
										class="ml-5 mr-5"
										v-model="dateEnrollment"
										v-bind="attrs"
										v-on="on"
									></v-text-field>
								</div>
							</template>
							<v-date-picker
								v-model="dateEnrollment"
								no-title
								:min="minDate"
								:max="maxDate"
								@input="menu = false"
							></v-date-picker>
						</v-menu>

					</v-col>
				</v-row>

				<v-row no-gutters>
					<v-col
						cols="12"
						sm="3"
						md="3"
						lg="3"
					>
						<div class="custom-text-field" :class="{ 'internal-field-print': exportClass }">
							<label class="ml-5">Policy Number</label>
							<v-text-field
								solo
								class="ml-5 mr-5"
								v-model="policy"
							>
							</v-text-field>
						</div>
					</v-col>
					<v-btn
						color="#F3A901"
						class="mt-8 white--text details-btn"
						id="apply-btn"
						:disabled="applyDisabled"
						v-show="showSubmitButton"
						@click="storeInternalFields"
					>
						Submit
					</v-btn>
				</v-row>
			</v-expansion-panel-content>
		</v-expansion-panel>
	</v-expansion-panels>
</template>
<script>
const axios = require("axios");
import { DENTAL_STORE_INTERNAL_FIELDS_URL } from "../../urls.js";

export default {
	name: "DentalInternalFields",
	props: ["dentalService",
			"dentalInternalFields",
			"internalFieldsYears",
			"idSubmission",
			"panelModel",
			"showSubmit",
			"exportPDF"
	],
	data() {
		return {
			modelPanel: this.panelModel,
			showSubmitButton: this.showSubmit,
			id: 0,
			programYear: null,
			flagYear: false,
			income: null,
			dateEnrollment: null,
			policy: null,
			menu: false,
			applyDisabled: false,
			minDate: '1950-01-01',
			maxDate: '2050-12-31',
			exportClass: this.exportPDF,
			rules: {
				year: value => {
					const year = parseInt(value);

					if(value !== null && value !== ''){
						if (Number.isInteger(year) && year >= 1900 && year <= 2050) {
							this.applyDisabled = false;
							this.dateYear = year;
							return true;
						}else{
							this.applyDisabled = true;
							return 'Invalid year.';
						}

					}

					return true;
				},
			},
		};
	},
	watch: {
		panelModel(newValue) {
			this.modelPanel = newValue;
		},
		showSubmit(newValue) {
			this.showSubmitButton = newValue;
		},
		exportPDF(newValue){
			this.exportClass = newValue;
		},
		dentalInternalFields(newVal) {
			this.assignInternalFields(newVal);
		}
	},
	methods: {
		assignInternalFields(internalFields){
			if (Object.keys(internalFields).length !== 0) {
				this.income = internalFields.income_amount;
				this.programYear = internalFields.program_year;
				this.dateEnrollment = internalFields.date_enrollment;
				this.policy = internalFields.policy_number;
				this.id = internalFields.id;
			}
		},
		storeInternalFields() {

			axios
			.post(DENTAL_STORE_INTERNAL_FIELDS_URL, {
                params: {
					idSubmission: this.idSubmission,
					id: this.id,
					income: this.income,
					programYear: this.programYear,
					dateEnrollment: this.dateEnrollment,
					policy: this.policy
				}
            })
			.then((resp) => {
				this.income = null;
				this.programYear = null;
				this.dateEnrollment = null;
				this.policy = null;

				this.$emit("getNotification", resp.data.message);
			})
			.catch((err) => console.error(err));

		}
	}
};
</script>