<template>
	<div class="dental-service">
	<v-row class="mb-5" no-gutters>
		<span class="title-service">Dental Service Requests</span>
	</v-row>

    <v-row class="row-filter">
		<v-col
			cols="10"
			sm="10"
			md="10"
			lg="2"
		>
			<v-select
				:items="itemsStatus"
				:menu-props="{ maxHeight: '400' }"
				label="Select"
				multiple
				persistent-hint
				v-model="selectedStatus"
				@change="changeSelect"
				id="export-status-select"
			></v-select>
		</v-col>
		<v-col
			cols="10"
			sm="10"
			md="10"
			lg="2"
		>
			<v-text-field
				v-model="selectedYear"
				label="Year"
				prepend-icon="mdi-calendar"
				variant="underlined"
				@input="handleYear"
				type="number"
			></v-text-field>
		</v-col>
		<v-col
			cols="10"
			sm="10"
			md="10"
			lg="2"
		>
			<v-menu
				ref="menu"
				v-model="menu"
				:close-on-content-click="false"
				transition="scale-transition"
				offset-y
				min-width="auto"
			>
				<template v-slot:activator="{ on, attrs }">
					<v-text-field
						v-model="date"
						label="From:"
						prepend-icon="mdi-calendar"
						v-bind="attrs"
						v-on="on"
					></v-text-field>
				</template>
				<v-date-picker
					v-model="date"
					no-title
					@input="menu = false"
					@change="updateDate"
				></v-date-picker>
			</v-menu>
		</v-col>
		<v-col
			cols="10"
			sm="10"
			md="10"
			lg="2"
		>
			<v-menu
				ref="menuEnd"
				v-model="menuEnd"
				:close-on-content-click="false"
				transition="scale-transition"
				offset-y
				min-width="auto"
			>
				<template v-slot:activator="{ on, attrs }">
					<v-text-field
						v-model="dateEnd"
						label="To:"
						prepend-icon="mdi-calendar"
						v-bind="attrs"
						v-on="on"
					></v-text-field>
				</template>
				<v-date-picker
					v-model="dateEnd"
					no-title
					@input="menuEnd = false"
					@change="updateDate"
				></v-date-picker>
			</v-menu>
		</v-col>
		<v-col
			cols="10"
			sm="10"
			md="10"
			lg="1"
			class="btn-reset"
		>
			<v-icon @click="resetInputs"> mdi-filter-remove </v-icon>
		</v-col>
		<v-col
			cols="10"
			sm="10"
			md="10"
			lg="2"
		>
			<v-btn
				:loading="loadingExport"
				:disabled="loadingExport"
				color="#F3A901"
				class="ma-2 white--text apply-btn"
				@click="exportFile()"
				id="export-btn"
			>
				Export
				<v-icon
					right
					dark
				>
					mdi-cloud-download
				</v-icon>
			</v-btn>
		</v-col>
	</v-row>
	<v-data-table
		dense
		v-model="selected"
		show-select
		:items="items"
		:headers="headers"
		:options.sync="options"
		:loading="loading"
		checkbox-color="black"
		:value="selected"
		@toggle-select-all="selectAll"
	>
	</v-data-table>
	</div>
</template>

<script>
const axios = require("axios");
import { DENTAL_URL, DENTAL_EXPORT_FILE_URL } from "../../urls.js";
import { utils, writeFileXLSX } from "xlsx";
export default {
	name: "DentalExport",
	data: () => ({
	loading: false,
		items: [],
		options: {},
		flagAlert: false,
		menu: false,
		date: null,
		menuEnd: false,
		dateEnd: null,
		selectedYear: null,
		dateYear: null,
		selected: [],
		itemsStatus: [],
		selectedStatus: null,
		loader: null,
		loadingExport: false,
		loadingReset: false,
	}),
	computed: {
		headers() {
			return [
			{
				text: "First Name",
				value: "first_name",
				width: "10%",
				sortable: true,
			},
			{
				text: "Last Name",
				value: "last_name",
				width: "10%",
				sortable: true,
			},
			{
				text: "Date of Birth",
				value: "date_of_birth",
				width: "10%",
				sortable: true,
			},
			{
				text: "Eligible for the Pharmacare and Extended Health Care Benefits program",
				value: "eligible_pharmacare",
				sortable: true,
			},
			{
				text: "Dependents",
				value: "dependent",
				sortable: true,
			},
			{
				text: "Proof of income",
				value: "file_dental",
				sortable: true,
			},
			{
				text: "Created",
				value: "created_at",
				width: "15%",
				sortable: true,
				filter: (value) => {
				if (!this.dateFormattedMin || !this.dateFormattedMax) return true;
				const dateMin = new Date(Date.parse(this.dateMin));
				const dateMax = new Date(Date.parse(this.dateMax));
				const date = new Date(Date.parse(value.substr(0, 10)));

				return date >= dateMin && date <= dateMax;
				},
			},
			{
				text: "Status",
				value: "status_description",
				sortable: true,
				width: "10%",
				filter: (value) => {
				if (!this.actionToFilter) return true;
				return value === this.actionToFilter;
				},
			},
			];
		},
	},
	components: {
	},
	watch: {
		options: {
			handler() {
				this.getDataFromApi();
			},
			deep: true,
		},
		loader () {
			const l = this.loader;
			this[l] = !this[l];

			setTimeout(() => (this[l] = false), 2000)

			this.loader = null;
		},
	},
	mounted() {
		this.getDataFromApi();
	},
	methods: {
		handleYear() {
			const year = parseInt(this.selectedYear);
			if (Number.isInteger(year) && year >= 1950 && year <= 2050) {
				this.dateYear = year;
				this.dateDisabled = true;
				this.date = null;
				this.dateEnd = null;
				this.selected = [];
				this.getDataFromApi();
			}
		},
		updateDate(){
			if(this.date !== null && this.dateEnd !== null) {
				this.selected = [];
				this.getDataFromApi();
			}
		},
		changeSelect(){
			this.selected = [];
			this.getDataFromApi();
		},
		getDataFromApi() {
			this.loading = true;
			axios
			.post(DENTAL_URL, {
				params: {
					dateFrom: this.date,
					dateTo: this.dateEnd,
					dateYear: this.dateYear,
					status: this.selectedStatus
				}
			})
			.then((resp) => {
				this.items = resp.data.data;
				this.itemsStatus = resp.data.dataStatus.filter((element) => element.value != 4);
				this.loading = false;

			})
			.catch((err) => console.error(err))
			.finally(() => {
			this.loading = false;
			});
		},
		selectAll() {
			this.selected = this.selected.length === this.items.length
			? []
			: this.items
		},
		resetInputs() {
			this.loader = 'loadingReset';
			this.date = null;
			this.dateEnd = null;
			this.selectedStatus = null;
			this.dateYear = null;
			this.selectedYear = null;
			this.selected = [];
			this.getDataFromApi();
		},
		exportFile () {
			var idArray = [];
			this.selected.forEach((e) => {
				idArray.push(e.id);
			});

			axios
			.post(DENTAL_EXPORT_FILE_URL, {
				params: {
					requests: idArray,
					status: this.selectedStatus,
					dateFrom: this.date,
					dateTo: this.dateEnd,
					dateYear: this.dateYear
				}
			}).then((resp) => {
				const ws = utils.json_to_sheet(resp.data.dataDental);
				const wb = utils.book_new();
				utils.book_append_sheet(wb, ws, "Dental Service Requests");

				utils.sheet_add_aoa(
				ws,
				[
					[
					"FIRST NAME",
					"MIDDLE NAME",
					"LAST NAME",
					"DATE OF BIRTH",
					"HEALTH CARD NUMBER",
					"MAILING ADDRESS",
					"CITY OR TOWN",
					"POSTAL CODE",
					"PHONE",
					"EMAIL",
					"OTHER COVERAGE",
					"ELIGIBLE PHARMACARE",
					"EMAIL INSTEAD",
					"HAVE CHILDREN",
					"ASK DEMOGRAPHIC",
					"IDENTIFY GROUPS",
					"GENDER",
					"EDUCATION",
					"OFTEN BRUSH",
					"STATE TEETH",
					"OFTEN FLOSS",
					"STATE GUMS",
					"LAST SAW DENTIST",
					"REASON FOR DENTIST",
					"BUY SUPPLIES",
					"PAY FOR VISIT",
					"BARRIERS",
					"PROBLEMS",
					"SERVICES NEEDED",
					"CREATED AT",
					"PROOF OF INCOME ATTACHMENT",
					"PROGRAM YEAR",
					"INCOME AMOUNT",
					"DATE OF ENROLLMENT",
					"POLICY NUMBER",
					"INTERNAL FIELD CREATED AT"
					],
				],
				{ origin: "A1" }
				);
				const ws2 = utils.json_to_sheet(resp.data.dataDependents);
				utils.book_append_sheet(wb, ws2, "Dental Service Dependents");
				utils.sheet_add_aoa(
				ws2,
				[
					[
					"APPLICANT NAME",
					"FIRST NAME",
					"LAST NAME",
					"DATE OF BIRTH",
					"HEALTHCARE",
					"APPLY",
					],
				],
				{ origin: "A1" }
				);

				writeFileXLSX(wb, "DentalService_Requests.xlsx");

				this.loading = false;
			})
			.catch((err) => console.error(err))
			.finally(() => {
				this.loading = false;
			});
		},
	},
};
</script>
