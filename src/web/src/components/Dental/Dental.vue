<template>
    <div class="dental-service">
		<v-row class="mb-5" no-gutters>
			<span class="title-service">Dental Service Requests</span>
		</v-row>

		<Notifications ref="notifier"></Notifications>
		<br>
		<v-row class="submission-filters mb-5" no-gutters>
			<v-col
				cols="12"
                sm="12"
                md="12"
                lg="2"
			>
				<v-select
					:items="bulkActions"
					v-model="bulkSelected"
					solo
					label="Bulk Actions"
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
				class="text-center"
			>
				<v-btn
					color="#F3A901"
					class="white--text apply-btn mt-2"
					id="apply-btn"
					:disabled="applyDisabled"
					@click="submitBulk"
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
				<v-select
					v-model="statusSelected"
					:items="statusFilter"
					label="Select"
					multiple
					persistent-hint
					@change="changeStatusSelect"
				></v-select>

			</v-col>
			<v-col
				cols="12"
                sm="12"
                md="12"
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
				cols="12"
                sm="12"
                md="12"
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
							:disabled="dateDisabled"
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
				cols="12"
                sm="12"
                md="12"
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
							:disabled="dateDisabled"
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
				cols="12"
                sm="12"
                md="12"
                lg="1"
                class="btn-reset"
				v-if="removeFilters"
			>
				<v-icon @click="resetInputs"> mdi-filter-remove </v-icon>
			</v-col>
		</v-row>
		<v-data-table
			dense
			v-model="selected"
			show-select
			checkbox-color="black"
			:items="items"
			:headers="headers"
			:options.sync="options"
			:loading="loadingTable"
			:search="search"
			@input="enterSelect"

			:server-items-length="totalItems"
			@update:options="getDataFromApi"
		>
			<template v-slot:[`item.showurl`]="{ item }">
				<v-icon @click="showDetails(item.showurl)">mdi-eye</v-icon>
			</template>
		</v-data-table>
    </div>
</template>

<script>
	const axios = require("axios");
	import { DENTAL_URL } from "../../urls.js";
	import Notifications from "../Notifications.vue";

	export default {
	name: "DentalServiceIndex",
	props: ['type'],
	data: () => ({
		loadingTable: false,
		bulkSelected: [],
		items: [],
		statusSelected: [1],
		date: null,
		selectedYear: null,
		dateYear: null,
		menu: false,
		dateEnd: null,
		statusFilter: [],
		menuEnd: false,
		dateDisabled: false,
		selected: [],
		bulkActions: [],
		actionSelected: "",
		itemsSelected: [],
		search: "",
		applyDisabled: true,
		options: {
			page: 1,
			itemsPerPage: 10
		},
		flagAlert: false,
		statusChangeMessage: "Status changed successfully.",
		nonexistentMessage: "The submission you are consulting is closed or non existant, please choose a valid submission.",
		headers: [
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
		{ text: "Dependents", value: "dependent", sortable: true },
		{ text: "Proof of income", value: "file_dental", sortable: true },
		{ text: "Comments", value: "has_comments", sortable: true },
		{ text: "Created", value: "created_at", width: "15%", sortable: true },
		{ text: "Status", value: "status_description", sortable: true },
		{ text: "", value: "showurl", sortable: false },
		],
		alignments: "center",
		totalItems: 0,
		initialPage: 1,
		initialItemsPerPage: 10,
	}),
	components: {
		Notifications
	},
	watch: {
		search: {
			handler() {
				this.getDataFromApi();
			},
			deep: true,
		}
	},
	mounted() {

		if (typeof this.$route.query.type !== undefined){
			if(this.$route.query.type == "status"){
				this.$refs.notifier.showSuccess(this.statusChangeMessage);
			}else if(this.$route.query.type == "nonexistent"){
				this.$refs.notifier.showError(this.nonexistentMessage);
			}
		}

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
				this.options.page = this.initialPage;
				this.options.itemsPerPage = this.initialItemsPerPage;
				this.getDataFromApi();
			}
		},
		changeStatusSelect(){
			this.selected = [];
			this.options.page = this.initialPage;
			this.options.itemsPerPage = this.initialItemsPerPage;
			this.getDataFromApi();
		},
		updateDate(){
			if(this.date !== null && this.dateEnd !== null){
				this.selected = [];
				this.options.page = this.initialPage;
				this.options.itemsPerPage = this.initialItemsPerPage;
				this.getDataFromApi();
			}
		},
		removeFilters() {
			this.options.page = this.initialPage;
			this.options.itemsPerPage = this.initialItemsPerPage;
			return this.date || this.dateEnd || this.statusSelected || this.dateYear || this.selectedYear;
		},
		resetInputs() {
			this.date = null;
			this.dateEnd = null;
			this.statusSelected = null;
			this.bulkSelected = null;
			this.applyDisabled = true;
			this.dateYear = null;
			this.selectedYear = null;
			this.selected = [];
			this.getDataFromApi();
		},
		getDataFromApi() {
			this.loadingTable = true;
			this.items = [];

			axios
			.post(DENTAL_URL, {
				params: {
					dateFrom: this.date,
					dateTo: this.dateEnd,
					dateYear: this.dateYear,
					status: this.statusSelected,
					page: this.options.page,
					pageSize: this.options.itemsPerPage,
				}
			})
			.then((resp) => {
				this.items = resp.data.data;
				this.bulkActions = resp.data.dataStatus;
				this.statusFilter = resp.data.dataStatus.filter((element) => element.value != 4);
				this.loadingTable = false;
				this.dateDisabled = false;
				this.totalItems = resp.data.total;
			})
			.catch((err) => console.error(err))
			.finally(() => {
				this.loadingTable = false;
			});
		},
		showDetails(route) {
			this.$router.push({ path: route });
		},
		enterSelect() {
			this.itemsSelected = this.selected;
		},
		enterBulkAction(value) {
			this.actionSelected = value;
			this.applyDisabled = false;
		},
		submitBulk() {
			this.applyDisabled = false;
			if (this.actionSelected != "") {
				let requests = [];
				this.itemsSelected.forEach((element) => {
					requests.push(element.id);
				});

				if(requests.length > 0){
					let patchUrl = DENTAL_URL + "/changeStatus/";
					axios.patch(patchUrl, {
						params: {
							requests: requests,
							requestStatus: this.actionSelected
						}
					})
					.then((resp) => {
						this.$refs.notifier.showSuccess(resp.data.message);
						this.selected = [];
						this.getDataFromApi();
					})
					.catch((err) => console.error(err))
					.finally(() => {
						this.loading = false;
					});
				}
			}
		},
	},
	};
</script>