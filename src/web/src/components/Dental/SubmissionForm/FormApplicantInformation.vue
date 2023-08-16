<template>
	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Applicant Information</v-expansion-panel-header>
			<v-expansion-panel-content>
                <v-row no-gutters>
					<v-col
						cols="10"
						sm="4"
						xs="4"
						md="3"
						lg="3"
						class="ma-5"
					>
						<v-text-field
							outlined
							label="First name"
							v-model="dentalServiceData.first_name"
						>
						</v-text-field>
					</v-col>
					<v-col
						cols="10"
						sm="4"
						md="3"
						lg="3"
						class="ma-5"
					>
						<v-text-field
							outlined
							label="Middle name"
							v-model="dentalServiceData.middle_name"
						>
						</v-text-field>
					</v-col>
					<v-col
						cols="10"
						sm="4"
						md="3"
						lg="3"
						class="ma-5"
					>
						<v-text-field
							outlined
							label="Last name"
							v-model="dentalServiceData.last_name"
						>
						</v-text-field>
					</v-col>
				</v-row>

				<v-row no-gutters>
					<v-col
						cols="10"
						sm="4"
						md="3"
						lg="3"
						class="ma-5"
					>
						<v-menu
							ref="menu"
							v-model="menu"
							:close-on-content-click="false"
							transition="scale-transition"
							min-width="auto"
						>
							<template v-slot:activator="{ on, attrs }">
								<v-text-field
									outlined
									label="Date of Birth"
									v-model="dentalServiceData.date_of_birth"
									v-bind="attrs"
									v-on="on"
								></v-text-field>
							</template>
							<v-date-picker
								v-model="dentalServiceData.date_of_birth"
								no-title
								@input="menu = false"
							></v-date-picker>
						</v-menu>
					</v-col>
					<v-col
						cols="10"
						sm="4"
						md="3"
						lg="3"
						class="ma-5"
					>
						<v-text-field
							outlined
							label="Yukon health care card number"
							v-model="dentalServiceData.health_card_number"
						>
						</v-text-field>
					</v-col>
				</v-row>

			</v-expansion-panel-content>
        </v-expansion-panel>

		<v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Contact Information</v-expansion-panel-header>
			<v-expansion-panel-content>
                <v-row no-gutters>
					<v-col
						cols="10"
						sm="10"
						md="10"
						lg="10"
						class="ma-5"
					>
						<v-text-field
							outlined
							label="Mailing address"
							v-model="dentalServiceData.mailing_address"
						>
						</v-text-field>
					</v-col>
				</v-row>

				<v-row no-gutters>
					<v-col
						cols="10"
						sm="6"
						md="3"
						lg="3"
						class="ma-5"
					>
						<v-select
							outlined
							v-model="selectedCityTown"
							:items="cityTown"
							label="City or Town"
							@change="validateCityTown"
						></v-select>

						<v-text-field
							v-if="showCustomCityTown"
							outlined
							v-model="customCityTown"
						>
						</v-text-field>
					</v-col>
					<v-col
						cols="10"
						sm="6"
						md="4"
						lg="4"
						class="ma-5"
					>
						<v-text-field
							outlined
							label="Postal Code"
							v-model="dentalServiceData.postal_code"
						>
						</v-text-field>
					</v-col>
				</v-row>

				<v-row no-gutters>
					<v-col
						cols="10"
						sm="6"
						md="3"
						lg="3"
						class="ma-5"
					>
						<v-text-field
							outlined
							label="Phone Number"
							v-model="dentalServiceData.phone"
						>
						</v-text-field>
					</v-col>
					<v-col
						cols="10"
						sm="6"
						md="4"
						lg="4"
						class="ma-5"
					>
						<v-text-field
							outlined
							label="Email Address"
							v-model="dentalServiceData.email"
						>
						</v-text-field>
					</v-col>
				</v-row>

				<v-row no-gutters>
					<v-col
						cols="10"
						sm="12"
						md="12"
						lg="12"
						class="ma-5"
					>
						<v-radio-group v-model="selectedCoverage">
							<label class="mb-5">
								<b>Do you have coverage for dental services under any other program, plan or insurance group?</b>
							</label>
							<v-radio
								v-for="option in optionsCoverage"
								:key="option.key"
								:label="option.text"
								:value="option.value"
								@change="coveragePharmacare(option.key)"
							></v-radio>
						</v-radio-group>
					</v-col>
				</v-row>

				<v-row no-gutters>
					<v-col
						cols="10"
						sm="12"
						md="12"
						lg="12"
						class="ma-5"
					>
						<v-radio-group v-if="showPharmacare" v-model="selectedPharmacare">
							<label class="mb-5">
								<b>Are you eligible for the Pharmacare and Extended Health Care Benefits program?</b>
							</label>
							<v-radio
								v-for="option in optionsPharmacare"
								:key="option.key"
								:label="option.text"
								:value="option.value"
							></v-radio>
						</v-radio-group>
					</v-col>
				</v-row>

			</v-expansion-panel-content>
        </v-expansion-panel>
	</v-expansion-panels>
</template>
<script>
export default {
	name: "FormApplicantInformation",
	props: ["dentalService", "panelModel", "cityTown"],
	data() {
		return {
			modelPanel: this.panelModel,
			menu: false,
			dentalServiceData: {},
			selectedCityTown: null,
			showCustomCityTown: false,
			customCityTown: null,
			selectedCoverage: null,
			optionsCoverage: [
				{ text: "Yes, I have other coverage.", value: "Yes, I have other coverage.", key: 1,},
				{ text: "No, I don't have other coverage.", value: "No, I don't have other coverage.", key: 2 },
			],
			selectedPharmacare: null,
			showPharmacare: false,
			optionsPharmacare: [
				{ text: "Yes, I am eligible", value: "Yes, I am eligible", key: 1,},
				{ text: "No, I am not eligible", value: "No, I am not eligible", key: 2 },
			]
		};
	},
	watch: {
		panelModel(newValue) {
			this.modelPanel = newValue;
		},
		dentalService(newValue){

			this.dentalServiceData = this.dentalService;

			if (newValue.city_or_town) {
				const result = this.cityTown.find(item => item.text === newValue.city_or_town);

				if(result){
					this.selectedCityTown = result.value;
				}else{
					const otherData = this.cityTown.find(item => item.text === "other");

					this.showCustomCityTown = true;
					this.selectedCityTown = otherData.value;
					this.customCityTown = newValue.city_or_town;
				}
			}

			if(newValue.other_coverage) {
				let option = this.optionsCoverage.find(option => option.value == newValue.other_coverage);
				this.selectedCoverage = option.value;

				if(option.key == 1) {
					this.showPharmacare = true;
				}
			}

			if(newValue.are_you_eligible_for_the_pharmacare_and_extended_health_care_ben) {
				let option = this.optionsPharmacare.find(option => option.value == newValue.are_you_eligible_for_the_pharmacare_and_extended_health_care_ben);
				this.selectedPharmacare = option.value;
			}
		},
	},
	methods: {
		coveragePharmacare(key) {
			if(key == 1){
				this.showPharmacare = true;
			} else {
				this.showPharmacare = false;
				this.selectedPharmacare = null;
			}
		},
		validateCityTown(){
			const cityData = this.cityTown.find(item => item.value === this.selectedCityTown);

			if(cityData.text == 'other'){
				this.showCustomCityTown = true;
			}else{
				this.showCustomCityTown = false;
				this.customCityTown = null;
			}
		},
		getApplicantInformation() {

			const cityData = this.cityTown.find(item => item.value === this.selectedCityTown);
			let cityTown = cityData.text;

			if(cityTown == 'other'){
				cityTown = this.customCityTown;
			}

			return {
				FIRST_NAME: this.dentalService.first_name,
				MIDDLE_NAME: this.dentalService.middle_name,
				LAST_NAME: this.dentalService.last_name,
				DATE_OF_BIRTH: this.dentalService.date_of_birth,
				HEALTH_CARD_NUMBER: this.dentalService.health_card_number,
				CITY_OR_TOWN: cityTown,
				MAILING_ADDRESS: this.dentalService.mailing_address,
				POSTAL_CODE: this.dentalService.postal_code,
				PHONE: this.dentalService.phone,
				EMAIL: this.dentalService.email,
				OTHER_COVERAGE: this.selectedCoverage,
				ARE_YOU_ELIGIBLE_FOR_THE_PHARMACARE_AND_EXTENDED_HEALTH_CARE_BEN: this.selectedPharmacare
			};
		}
	}
};
</script>