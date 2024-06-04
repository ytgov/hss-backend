
<template>
	<div class="hipma-service">
		<v-row class="mb-5" no-gutters>
			<span class="title-service">Health Information Export</span>
		</v-row>
		<div class="text-center loading" v-show="loadingExport">
			<v-progress-circular
				:size="125"
				:width="10"
				color="primary"
				indeterminate
			>
				Generating...
			</v-progress-circular>
		</div>
		<v-row class="row-filter">
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
		<br>
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

			:server-items-length="totalItems"
			@update:options="handlePagination"
			:footer-props="{
                'items-per-page-options': itemsPerPage
            }"
		>

		</v-data-table>
	</div>
</template>

<script>
const axios = require("axios");
import { HIPMA_URL } from "../../urls.js";
import { HIPMA_EXPORT_FILE_URL } from "../../urls.js";
import { utils, writeFileXLSX  } from 'xlsx';

export default {
	name: "HipmaExport",
	data: () => ({
		loading: false,
		items: [],
		itemsUnfiltered: [],
		fetchedItems: [],
		options: {
			page: 1,
			itemsPerPage: 10
		},
		flagAlert: false,
		menu: false,
		date: null,
		menuEnd: false,
		dateEnd: null,
		selected: [],
		loader: null,
		loadingExport: false,
		loadingReset: false,
		headers: [
			{ text: "Confirmation Number", value: "confirmation_number", sortable: true},
			{ text: "Request Type", value: "hipma_request_type_desc", sortable: true},
			{ text: "Request Access to personal information", value: "access_personal_health_information", sortable: true},
			{ text: "Applicant", value: "applicant_full_name", sortable: true},
			{ text: "Created", value: "created_at", sortable: true},
		],
		initialPage: 1,
        initialItemsPerPage: 10,
        totalItems: 0,
		itemsPerPage: [10, 15, 50, 100, -1],
		exportMaxSize: 250,
		allItems: 0,
		isAllData: false,
		initialFetch: 1,
	}),
	watch: {
		loader () {
			const l = this.loader;
			this[l] = !this[l];

			setTimeout(() => (this[l] = false), 2000)

			this.loader = null;
		},
	},
	mounted() {
	},
	methods: {
		updateDate(){
			if(this.date !== null && this.dateEnd !== null){
				this.selected = [];
				this.getDataFromApi();
			}
		},
		getDataFromApi() {
		this.loading = true;
		this.items = [];
		const { page, itemsPerPage, sortBy, sortDesc } = this.options;

			axios
			.post(HIPMA_URL, {
				params: {
					dateFrom: this.date,
					dateTo: this.dateEnd,
					page: page,
					pageSize: itemsPerPage,
					sortBy: sortBy.length ? sortBy[0] : null,
					sortOrder: sortBy.length ? (sortDesc[0] ? 'DESC' : 'ASC') : null,
					initialFetch: this.initialFetch,
				}
			})
			.then((resp) => {
				this.fetchedItems = resp.data.data;
				this.itemsUnfiltered = resp.data.data;
				this.loading = false;
				this.totalItems = resp.data.total;
				this.allItems = resp.data.all;

                if (this.initialFetch == 1) {
                    this.items = this.fetchedItems.slice(0, itemsPerPage);
                    this.initialFetch = 0;
                } else {
                    this.items = this.fetchedItems;
                }
			})
			.catch((err) => console.error(err))
			.finally(() => {
				this.loading = false;
			});
		},
		handlePagination() {
            const { page, itemsPerPage, sortBy, sortDesc } = this.options;
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

            if (sortBy.length || sortDesc.length) {
                this.getDataFromApi();
            } else {
                if (this.fetchedItems.length >= endIndex) {
                    this.items = this.fetchedItems.slice(startIndex, endIndex);
                } else {
                    this.getDataFromApi();
                }
            }
        },
		selectAll(isChecked) {
			this.isAllData = isChecked.value;
			this.selected = this.selected.length === this.items.length
			? []
			: this.items
		},
		resetInputs() {
			this.loader = 'loadingReset';
			this.date = null;
			this.dateEnd = null;
			this.selected = [];
			this.options.page = this.initialPage;
            this.options.itemsPerPage = this.initialItemsPerPage;
			this.initialFetch = 1;
			this.getDataFromApi();
		},
		sortItems(items, sortBy, sortDesc) {
            if (sortBy.length) {
                let sorted = items.sort((a, b) => {
                    const sortKey = sortBy[0];
                    const sortOrder = sortDesc[0] ? -1 : 1;
                    if (a[sortKey] < b[sortKey]) return -1 * sortOrder;
                    if (a[sortKey] > b[sortKey]) return 1 * sortOrder;
                    return 0;
                });

                return sorted;
            }else{
                return items;
            }
        },
		exportFile () {
			this.loadingExport = true;

            let totalBatches = 0;

            if(this.selected.length > 0 && !this.isAllData){
                totalBatches = Math.ceil(this.selected.length / this.exportMaxSize);
            }else if(this.selected.length == 0 && !this.isAllData){
                totalBatches = Math.ceil(this.allItems / this.exportMaxSize);
                this.isAllData = true;
            }else if(this.selected.length > 0 && this.isAllData){
                totalBatches = Math.ceil(this.totalItems / this.exportMaxSize);
            }

            let hipmaData = [];
			let fileName = "";

            const fetchBatchData = async (start, end) => {
				let idArray = [];
                if (!this.isAllData) {
                    idArray = this.selected.slice(start, end).map(e => e.constellation_health_id);
                }

				try {
					const response = await axios.post(HIPMA_EXPORT_FILE_URL, {
						params: {
							requests: idArray,
							dateFrom: this.date,
							dateTo: this.dateEnd,
							offset: start,
                            limit: this.exportMaxSize,
                            isAllData: this.isAllData,
						}
					});
					return response.data;
				} catch (error) {
					console.error(error);
					throw error;
				}
			};

			const processBatches = async () => {
                const batchPromises = [];

                for (let batch = 0; batch < totalBatches; batch++) {
                    const start = batch * this.exportMaxSize;
                    const end = start + this.exportMaxSize;
                    batchPromises.push(fetchBatchData(start, end));
                }

                try {
                    const results = await Promise.all(batchPromises);

                    results.forEach((data) => {
                        hipmaData = hipmaData.concat(data.data);
						fileName = data.fileName;
                    });

                    this.generateExcel(hipmaData, fileName);
                } catch (error) {
                    console.error('Error processing Hipma Export batches:', error);
                } finally {
                    this.loadingExport = false;
                }
            };

            processBatches();
		},
		generateExcel(hipmaData, fileName) {
            const ws = utils.json_to_sheet(hipmaData);
			const wb = utils.book_new();
			utils.book_append_sheet(wb, ws, "Hipma Requests");

			utils.sheet_add_aoa(ws, [[
				"Confirmation number",
				"First name behalf",
				"Last name behalf",
				"Company or organization optional behalf",
				"Address behalf",
				"City or town behalf",
				"Postal code behalf",
				"Email address behalf",
				"Phone number behalf",
				"First name",
				"Last name",
				"Date of birth",
				"Address",
				"City or town",
				"Postal code",
				"Email address",
				"Phone number",
				"Name of health and social services program area optional ",
				"Indicate the hss system s you would like a record of user activity",
				"Provide details about your request ",
				"Date from ",
				"Date to ",
				"Created at",
				"Updated at",
				"Request Type",
				"Access Personal Health Information",
				"Get a copy of your health information",
				"Situations",
				"Copy activity request",
				"Need help identifying data range",
				"Affirm information accurate"
			]], { origin: "A1" });

			writeFileXLSX(wb, fileName);
        }
	},
};
</script>
