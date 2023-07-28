<template>
	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Demographic and dental care information</v-expansion-panel-header>
			<v-expansion-panel-content>

				<v-radio-group v-model="selectedDemographic" class="ma-5">
					<label class="mb-5">
						<b>Are you willing to provide demographic and dental care information to improve our program?</b>
					</label>
					<v-radio
						v-for="option in optionsDemographic"
						:key="option.key"
						:label="option.text"
						:value="option.value"
						@change="provideDemographic(option.key)"
					></v-radio>
				</v-radio-group>

				<div v-if="showDemographicFields">
					<v-row class="ma-5">
						<label>
							<b>Do you identify with any of these groups and communities?</b>
						</label>
						<v-col
							v-for="(item, index) in groups"
							:key="index"
							cols="12"
							md="12"
							class="pa-1"
						>
								<v-checkbox
									class="maxh-10"
									v-model="selectedGroups"
									:label="item.description"
									:value="item.id"
								>
								</v-checkbox>
						</v-col>
					</v-row>
					<v-row class="ma-5">
						<v-radio-group v-model="selectedGender">
							<label class="mb-5">
								<b>Which gender do you currently most identify with?</b>
							</label>
							<v-radio
								v-for="option in genders"
								:key="option.key"
								:label="option.text"
								:value="option.value"
								@change="validateGender(option.value)"
							>
							</v-radio>

							<v-text-field
								v-if="showCustomGender"
								outlined
								v-model="customGender"
							>
							</v-text-field>

						</v-radio-group>
					</v-row>
					<v-row class="ma-5">
						<v-radio-group v-model="selectedEducationLevel">
							<label class="mb-5">
								<b>What is the highest level of education you have completed?</b>
							</label>
							<v-radio
								v-for="option in educationLevels"
								:key="option.key"
								:label="option.text"
								:value="option.value"
							></v-radio>
						</v-radio-group>
					</v-row>

					<v-row no-gutters>
						<v-col
							cols="12"
							sm="5"
							md="5"
							lg="5"
							class="ma-5"
						>
							<v-select
								outlined
								v-model="selectedOftenBrush"
								:items="often"
								label="How often do you brush your teeth?"
							></v-select>
						</v-col>
						<v-col
							cols="12"
							sm="5"
							md="5"
							lg="5"
							class="ma-5"
						>
							<v-select
								outlined
								v-model="selectedStateTeeth"
								:items="states"
								label="How would you describe the state of your teeth?"
							></v-select>
						</v-col>
					</v-row>

					<v-row no-gutters>
						<v-col
							cols="12"
							sm="5"
							md="5"
							lg="5"
							class="ma-5"
						>
							<v-select
								outlined
								v-model="selectedOftenFloss"
								:items="often"
								label="How often do you floss your teeth?"
							></v-select>
						</v-col>
						<v-col
							cols="12"
							sm="5"
							md="5"
							lg="5"
							class="ma-5"
						>
							<v-select
								outlined
								v-model="selectedStateGums"
								:items="states"
								label="How would you describe the state of your gums?"
							></v-select>
						</v-col>
					</v-row>

					<v-row class="ma-5">
						<v-radio-group v-model="selectedTimePeriod">
							<label class="mb-5">
								<b>How long has it been since you last saw a dentist or a dental therapist?</b>
							</label>
							<v-radio
								v-for="option in timePeriods"
								:key="option.key"
								:label="option.text"
								:value="option.value"
							>
							</v-radio>
						</v-radio-group>
					</v-row>

					<v-row class="ma-5">
						<label>
							<b>What was the reason for your last visit to the dentist?</b>
						</label>
						<v-col
							v-for="(item, index) in reasons"
							:key="index"
							cols="12"
							md="12"
							class="pa-1 mb-3"
						>
								<v-checkbox
									class="maxh-10"
									v-model="selectedReasons"
									:label="item.description"
									:value="item.id"
								>
								</v-checkbox>
						</v-col>
					</v-row>

					<v-row class="ma-5">
						<v-radio-group v-model="selectedAffordSupplies">
							<label class="mb-5">
								<b>Are you able to regularly afford dental supplies (toothpaste, floss, toothbrushes)?</b>
							</label>
							<v-radio
								v-for="option in optionsAffordSupplies"
								:key="option.key"
								:label="option.text"
								:value="option.value"
							>
							</v-radio>
						</v-radio-group>
					</v-row>

					<v-row class="ma-5">
						<label>
							<b>In the past 12 months, if you needed to go to the dentist, how would you have paid for it?</b>
						</label>
						<v-col
							v-for="(item, index) in paymentMethods"
							:key="index"
							cols="12"
							md="12"
							class="pa-1"
						>
							<v-checkbox
								class="maxh-10"
								v-model="selectedPaymentMethods"
								:label="item.description"
								:value="item.id"
								@change="validatePaymentMethod(item.id)"
							>
							</v-checkbox>
						</v-col>
						<v-col
							cols="12"
							md="4"
							sm="4"
							lg="4"
						>
							<v-text-field
								v-if="showCustomPaymentMethod"
								outlined
								class="ma-5"
								v-model="customPaymentMethod"
							>
							</v-text-field>
						</v-col>
					</v-row>

					<v-row class="ma-5">
						<label>
							<b>In the past 12 months, what barriers have you experienced when trying to get dental care for yourself?</b>
						</label>
						<v-col
							v-for="(item, index) in barriers"
							:key="index"
							cols="12"
							md="12"
							class="pa-1"
						>
							<v-checkbox
								class="maxh-10"
								v-model="selectedBarriers"
								:label="item.description"
								:value="item.id"
								@change="validateBarrier(item.id)"
							>
							</v-checkbox>
						</v-col>
						<v-col
							cols="12"
							md="4"
							sm="4"
							lg="4"
						>
							<v-text-field
								v-if="showCustomBarrier"
								outlined
								class="ma-5"
								v-model="customBarrier"
							>
							</v-text-field>
						</v-col>
					</v-row>

					<v-row class="ma-5">
						<label>
							<b>In the past 12 months, have you experienced any problems because of the state of your teeth, gums or mouth?</b>
						</label>
						<v-col
							v-for="(item, index) in problems"
							:key="index"
							cols="12"
							md="12"
							class="pa-1"
						>
							<v-checkbox
								class="maxh-10"
								v-model="selectedProblems"
								:label="item.description"
								:value="item.id"
								@change="validateProblem(item.id)"
							>
							</v-checkbox>
						</v-col>
						<v-col
							cols="12"
							md="4"
							sm="4"
							lg="4"
						>
							<v-text-field
								v-if="showCustomProblem"
								outlined
								class="ma-5"
								v-model="customProblem"
							>
							</v-text-field>
						</v-col>
					</v-row>

					<v-row class="ma-5">
						<label>
							<b>Do you currently need dental services?</b>
						</label>
						<v-col
							v-for="(item, index) in services"
							:key="index"
							cols="12"
							md="12"
							class="pa-1"
						>
							<v-checkbox
								class="maxh-10"
								v-model="selectedServices"
								:label="item.description"
								:value="item.id"
								@change="validateService(item.id)"
							>
							</v-checkbox>
						</v-col>
						<v-col
							cols="12"
							md="4"
							sm="4"
							lg="4"
						>
							<v-text-field
								v-if="showCustomService"
								outlined
								class="ma-5"
								v-model="customService"
							>
							</v-text-field>
						</v-col>
					</v-row>

				</div>

			</v-expansion-panel-content>
        </v-expansion-panel>
	</v-expansion-panels>
</template>
<script>
export default {
	name: "FormDependents",
	props: ["dentalService",
			"groups",
			"genders",
			"educationLevels",
			"often",
			"states",
			"timePeriods",
			"reasons",
			"paymentMethods",
			"barriers",
			"problems",
			"services",
			"idSubmission",
			"panelModel"
	],
	data() {
		return {
			modelPanel: this.panelModel,
			menus: [],
			dataDemographic: {},
			ask_demographic: {},
			selectedDemographic: null,
			selectedGender: null,
			selectedEducationLevel: null,
			showCustomGender: false,
			customGender: null,
			checkNoDependents: false,
			showDemographicFields: false,
			optionsDemographic: [
				{ text: "Yes, I will provide demographic information.", value: "Yes, I will provide demographic information.", key: 1,},
				{ text: "No, I don't want to provide demographic information.", value: "No, I don't want to provide demographic information.", key: 2 },
			],
			selectedGroups: [],
			selectedReasons: [],
			selectedPaymentMethods: [],
			selectedBarriers: [],
			selectedProblems: [],
			selectedServices: [],
			selectedOftenBrush: null,
			selectedStateTeeth: null,
			selectedOftenFloss: null,
			selectedStateGums: null,
			selectedTimePeriod: null,
			optionsAffordSupplies: [
				{ text: "Yes", value: "Yes", key: 1,},
				{ text: "No", value: "No", key: 2 },
				{ text: "Unsure", value: "Unsure", key: 3 }
			],
			selectedAffordSupplies: null,
			showCustomPaymentMethod: false,
			customPaymentMethod: null,
			showCustomBarrier: false,
			customBarrier: null,
			showCustomProblem: false,
			customProblem: null,
			showCustomService: false,
			customService: null
		};
	},
	watch: {
		panelModel(newValue) {
			this.modelPanel = newValue;
		},
		dentalService(newValue){

			if(newValue.ask_demographic) {
				const result = this.optionsDemographic.find(item => item.value === newValue.ask_demographic);

				this.selectedDemographic = result.value;
				this.provideDemographic(result.key);
			}

			if(newValue.identify_groups) {
				let groupsElements = newValue.identify_groups.split(/,\s(?!Inuk\/Inuit)/);

				this.selectedGroups = Object.values(this.groups)
									.filter(item => groupsElements.includes(item.description))
									.map(item => item.id);
			}

			if(newValue.gender) {
				let result = this.genders.find(option => option.value == newValue.gender);

				if(result){
					this.selectedGender = result.value;
				}else{
					const notListedData = this.genders.find(item => item.text == "Gender not listed");

					this.showCustomGender = true;
					this.selectedGender = notListedData.value;
					this.customGender = newValue.gender;
				}

			}

			if(newValue.education) {
				let result = this.educationLevels.find(option => option.value == newValue.education);
				this.selectedEducationLevel = result.value;
			}

			if(newValue.often_brush) {
				let result = this.often.find(option => option.text == newValue.often_brush);
				this.selectedOftenBrush = result.value;
			}

			if(newValue.state_teeth) {
				let result = this.states.find(option => option.text == newValue.state_teeth);
				this.selectedStateTeeth = result.value;
			}

			if(newValue.often_floss) {
				let result = this.often.find(option => option.text == newValue.often_floss);
				this.selectedOftenFloss = result.value;
			}

			if(newValue.state_gums) {
				let result = this.states.find(option => option.text == newValue.state_gums);
				this.selectedStateGums = result.value;
			}

			if(newValue.last_saw_dentist) {
				this.selectedTimePeriod = (this.timePeriods.find(option => option.value == newValue.last_saw_dentist)?.value) ?? null;
			}

			if(newValue.reason_for_dentist) {
				const groupsElements = this.reasons.reduce((result, item) => {
					if (newValue.reason_for_dentist.includes(item.description)) {
						result.push(item.description);
					}
					return result;
				}, []);

				this.selectedReasons = Object.values(this.reasons)
									.filter(item => groupsElements.includes(item.description))
									.map(item => item.id);
			}

			if(newValue.buy_supplies) {
				const result = this.optionsAffordSupplies.find(item => item.value === newValue.buy_supplies);

				this.selectedAffordSupplies = result.value;
			}

			if(newValue.pay_for_visit) {

				const stringElements = this.paymentMethods.reduce((acc, item) => {
					const regex = new RegExp(item.description, 'g');
					return acc.replace(regex, parseInt(item.id));

				}, newValue.pay_for_visit);

				let arrayData = stringElements.split(/,(?=\s*\D|$)/).map(item => item.trim());

				this.selectedPaymentMethods = arrayData.map(item => {
					const id = item;

					if (!isNaN(id)) {
						return parseInt(item);
					} else {
						const dataItem = this.paymentMethods.find(data => data.description === 'other');
						this.customPaymentMethod = item;
						this.showCustomPaymentMethod = true;

						return parseInt(dataItem.id);
					}
				});

			}

			if(newValue.barriers) {

				let stringBarriers = newValue.barriers;

				for (const item of this.barriers) {
					const description = item.description;
					const id = item.id;

					if(description !== "other"){
						while (stringBarriers.includes(description)) {
							stringBarriers = stringBarriers.replace(description, id);
						}
					}
				}

				let arrayData = stringBarriers.split(/,(?=\s*\D|$)/).map(item => item.trim());

				this.selectedBarriers = arrayData.map(item => {
					const id = item;

					if (!isNaN(id)) {
						return parseInt(item);
					} else {
						const dataItem = this.barriers.find(data => data.description === 'other');
						this.customBarrier = item;
						this.showCustomBarrier = true;

						return parseInt(dataItem.id);
					}
				});

			}

			if(newValue.problems) {

				let stringProblems = newValue.problems;

				for (const item of this.problems) {
					const description = item.description;
					const id = item.id;

					if(description !== "other"){
						while (stringProblems.includes(description)) {
							stringProblems = stringProblems.replace(description, id);
						}
					}
				}

				let arrayData = stringProblems.split(/,(?=\s*\D|$)/).map(item => item.trim());

				this.selectedProblems = arrayData.map(item => {
					const id = item;

					if (!isNaN(id)) {
						return parseInt(item);
					} else {
						const dataItem = this.problems.find(data => data.description === 'other');
						this.customProblem = item;
						this.showCustomProblem = true;

						return parseInt(dataItem.id);
					}
				});

			}

			if(newValue.services_needed) {

				let stringServices = newValue.services_needed;

				for (const item of this.services) {
					const description = item.description;
					const id = item.id;

					if(description !== "other"){
						while (stringServices.includes(description)) {
							stringServices = stringServices.replace(description, id);
						}
					}
				}

				let arrayData = stringServices.split(/,(?=\s*\D|$)/).map(item => item.trim());

				this.selectedServices = arrayData.map(item => {
					const id = item;

					if (!isNaN(id)) {
						return parseInt(item);
					} else {
						const dataItem = this.services.find(data => data.description === 'other');
						this.customService = item;
						this.showCustomService = true;

						return parseInt(dataItem.id);
					}
				});

			}


		}
	},
	methods: {
		provideDemographic(key) {
			if (key === 1) {
				this.showDemographicFields = true;
			} else {
				this.showDemographicFields = false;
				this.cleanDemographic();
			}

			let options = this.optionsDemographic.find(option => option.key == key);

			this.ask_demographic = {
				text: options.text,
				key: options.key,
				value: options.value
			}
		},
		validateGender(value){
			const genderData = this.genders.find(item => item.value === value);

			if(genderData.text == 'Gender not listed'){
				this.showCustomGender = true;
			}else{
				this.showCustomGender = false;
				this.customGender = null;
			}
		},
		validatePaymentMethod(value){

			const paymentData = this.paymentMethods.find(item => item.id === value);

			if(paymentData.description == 'other'){
				const dataElement = Object.values(this.paymentMethods).find(item => item.description == paymentData.description);

				if(this.selectedPaymentMethods.includes(dataElement.id)){
					this.showCustomPaymentMethod = true;
				}else{
					this.showCustomPaymentMethod = false;
					this.customPaymentMethod = null;
				}

			}
		},
		validateBarrier(value){
			const barrierData = this.barriers.find(item => item.id === value);

			if(barrierData.description == 'other'){
				const dataElement = Object.values(this.barriers).find(item => item.description == barrierData.description);

				if(this.selectedBarriers.includes(dataElement.id)){
					this.showCustomBarrier = true;
				}else{
					this.showCustomBarrier = false;
					this.customBarrier = null;
				}

			}
		},
		validateProblem(value){
			const problemData = this.problems.find(item => item.id === value);

			if(problemData.description == 'other'){
				const dataElement = Object.values(this.problems).find(item => item.description == problemData.description);

				if(this.selectedProblems.includes(dataElement.id)){
					this.showCustomProblem = true;
				}else{
					this.showCustomProblem = false;
					this.customProblem = null;
				}

			}
		},
		validateService(value){
			const serviceData = this.services.find(item => item.id === value);

			if(serviceData.description == 'other'){
				const dataElement = Object.values(this.services).find(item => item.description == serviceData.description);

				if(this.selectedServices.includes(dataElement.id)){
					this.showCustomService = true;
				}else{
					this.showCustomService = false;
					this.customService = null;
				}

			}
		},
		escapeRegExp(string) {
			return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		},
		getDemographic() {

			if(this.ask_demographic.key == 1){

				let gender = null;

				if(this.selectedGender) {
					const genderData = this.genders.find(item => item.value === this.selectedGender);
					gender = genderData.text;

					if(gender == 'Gender not listed'){
						gender = this.customGender;
					}
				}

				if(this.selectedGroups) {
					this.selectedGroups = Object.values(this.groups)
										.filter(item => this.selectedGroups.includes(item.id))
										.map(item => item.description);
				}


				const oftenBrushData = (this.often.find(item => item.value === this.selectedOftenBrush)?.text) ?? null;

				const stateTeethData = (this.states.find(item => item.value === this.selectedStateTeeth)?.text) ?? null;

				const oftenFlossData = (this.often.find(item => item.value === this.selectedOftenFloss)?.text) ?? null;

				const stateGumsData = (this.states.find(item => item.value === this.selectedStateGums)?.text) ?? null;

				const timePeriod = (this.timePeriods.find(item => item.value === this.selectedTimePeriod)?.text) ?? null;

				if(this.selectedReasons) {
					this.selectedReasons = Object.values(this.reasons)
										.filter(item => this.selectedReasons.includes(item.id))
										.map(item => item.description);
				}

				if(this.selectedPaymentMethods) {
					this.selectedPaymentMethods = Object.values(this.paymentMethods)
										.filter(item => this.selectedPaymentMethods.includes(item.id))
										.map(item => item.description);

					if(this.selectedPaymentMethods.includes("other")){
						this.selectedPaymentMethods = this.selectedPaymentMethods.map(item =>
														(item === "other" ? this.customPaymentMethod : item));
					}
				}

				if(this.selectedBarriers) {
					this.selectedBarriers = Object.values(this.barriers)
										.filter(item => this.selectedBarriers.includes(item.id))
										.map(item => item.description);

					if(this.selectedBarriers.includes("other")){
						this.selectedBarriers = this.selectedBarriers.map(item =>
														(item === "other" ? this.customBarrier : item));
					}
				}

				if(this.selectedProblems) {
					this.selectedProblems = Object.values(this.problems)
										.filter(item => this.selectedProblems.includes(item.id))
										.map(item => item.description);

					if(this.selectedProblems.includes("other")){
						this.selectedProblems = this.selectedProblems.map(item =>
														(item === "other" ? this.customProblem : item));
					}
				}

				if(this.selectedServices) {
					this.selectedServices = Object.values(this.services)
										.filter(item => this.selectedServices.includes(item.id))
										.map(item => item.description);

					if(this.selectedServices.includes("other")){
						this.selectedServices = this.selectedServices.map(item =>
														(item === "other" ? this.customService : item));
					}
				}

				this.dataDemographic.IDENTIFY_GROUPS = this.selectedGroups;
				this.dataDemographic.GENDER = gender;
				this.dataDemographic.EDUCATION = this.selectedEducationLevel;
				this.dataDemographic.OFTEN_BRUSH = oftenBrushData;
				this.dataDemographic.STATE_TEETH = stateTeethData;
				this.dataDemographic.OFTEN_FLOSS = oftenFlossData;
				this.dataDemographic.STATE_GUMS = stateGumsData;
				this.dataDemographic.LAST_SAW_DENTIST = timePeriod;
				this.dataDemographic.REASON_FOR_DENTIST = this.selectedReasons;
				this.dataDemographic.BUY_SUPPLIES = this.selectedAffordSupplies;
				this.dataDemographic.PAY_FOR_VISIT = this.selectedPaymentMethods;
				this.dataDemographic.BARRIERS = this.selectedBarriers;
				this.dataDemographic.PROBLEMS = this.selectedProblems;
				this.dataDemographic.SERVICES_NEEDED = this.selectedServices;

			}else{

				this.dataDemographic.IDENTIFY_GROUPS = null;
				this.dataDemographic.GENDER = null;
				this.dataDemographic.EDUCATION = null;
				this.dataDemographic.OFTEN_BRUSH = null;
				this.dataDemographic.STATE_TEETH = null;
				this.dataDemographic.OFTEN_FLOSS = null;
				this.dataDemographic.STATE_GUMS = null;
				this.dataDemographic.LAST_SAW_DENTIST = null;
				this.dataDemographic.REASON_FOR_DENTIST = null;
				this.dataDemographic.BUY_SUPPLIES = null;
				this.dataDemographic.PAY_FOR_VISIT = null;
				this.dataDemographic.BARRIERS = null;
				this.dataDemographic.PROBLEMS = null;
				this.dataDemographic.SERVICES_NEEDED = null;

			}

			this.dataDemographic.ASK_DEMOGRAPHIC = this.ask_demographic;

			return this.dataDemographic;
		},
		cleanDemographic(){
			this.selectedGender = null;
			this.selectedEducationLevel = null;
			this.showCustomGender = false;
			this.customGender = null;
			this.checkNoDependents = false;
			this.showDemographicFields = false;
			this.selectedGroups = [];
			this.selectedReasons = [];
			this.selectedPaymentMethods = [];
			this.selectedBarriers = [];
			this.selectedOftenBrush = null;
			this.selectedStateTeeth = null;
			this.selectedOftenFloss = null;
			this.selectedStateGums = null;
			this.selectedTimePeriod = null;
			this.selectedAffordSupplies = null;
			this.showCustomPaymentMethod = false;
			this.customPaymentMethod = null;
			this.showCustomBarrier = false;
			this.customBarrier = null;
			this.selectedProblems = [];
			this.showCustomProblem = false;
			this.customProblem = null;
			this.selectedServices = [];
			this.showCustomService = false;
			this.customService = null;
		}
	}
};
</script>