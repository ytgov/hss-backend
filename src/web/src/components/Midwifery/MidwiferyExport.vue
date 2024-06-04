
<template>
	<div class="midwifery-service">
		<v-row class="mb-5" no-gutters>
			<span class="title-service">Midwifery Export</span>
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
import { MIDWIFERY_URL } from "../../urls.js";
import { MIDWIFERY_EXPORT_FILE_URL } from "../../urls.js";
import { utils, writeFileXLSX  } from 'xlsx';

export default {
	name: "MidwiferyExport",
	data: () => ({
		loading: false,
		items: [],
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
		itemsStatus: [],
		selectedStatus: null,
		loader: null,
		loadingExport: false,
		loadingReset: false,
		headers: [
			{ text: "Preferred Name", value: "preferred_name", sortable: true},
			{ text: "Phone", value: "preferred_phone", sortable: true},
			{ text: "Email", value: "preferred_email", sortable: true},
			{ text: "Is this your first pregnancy?", value: "first_pregnancy", sortable: true},
			{ text: "Due Date", value: "due_date", sortable: true},
			{ text: "Preferred Birth Location", value: "birth_locations", sortable: true},
			{ text: "Medical Concerns with Pregnancy", value: "medical_concerns", sortable: true},
			{ text: "Major Medical Conditions", value: "major_medical_conditions", sortable: true},
			{ text: "Status", value: "status_description", sortable: true},
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
				this.options.page = this.initialPage;
				this.options.itemsPerPage = this.initialItemsPerPage;
				this.getDataFromApi();
			}
		},
		changeSelect(){
			this.selected = [];
			this.options.page = this.initialPage;
            this.options.itemsPerPage = this.initialItemsPerPage;
			this.getDataFromApi();
		},
		getDataFromApi() {
			this.loading = true;
			this.items = [];
			const { page, itemsPerPage, sortBy, sortDesc } = this.options;

			axios
			.post(MIDWIFERY_URL, {
				params: {
					dateFrom: this.date,
					dateTo: this.dateEnd,
					status: this.selectedStatus,
					page: page,
					pageSize: itemsPerPage,
					sortBy: sortBy.length ? sortBy[0] : null,
					sortOrder: sortBy.length ? (sortDesc[0] ? 'DESC' : 'ASC') : null,
					initialFetch: this.initialFetch,
				}
			})
			.then((resp) => {
				this.fetchedItems = resp.data.data;
				this.itemsStatus = resp.data.dataStatus.filter((element) => element.value != 4);
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
			this.selectedStatus = null;
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

            let midwiferyData = [];
			let fileName = "";

            const fetchBatchData = async (start, end) => {
				let idArray = [];
                if (!this.isAllData) {
                    idArray = this.selected.slice(start, end).map(e => e.constellation_health_id);
                }

				try {
					const response = await axios.post(MIDWIFERY_EXPORT_FILE_URL, {
						params: {
							requests: idArray,
							dateFrom: this.date,
							dateTo: this.dateEnd,
							status: this.selectedStatus,
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
                        midwiferyData = midwiferyData.concat(data.data);
						fileName = data.fileName;
                    });

                    this.generateExcel(midwiferyData, fileName);
                } catch (error) {
                    console.error('Error processing Midwifery Export batches:', error);
                } finally {
                    this.loadingExport = false;
                }
            };

            processBatches();
		},
		generateExcel(midwiferyData, fileName) {
            const ws = utils.json_to_sheet(midwiferyData);
			const wb = utils.book_new();
			utils.book_append_sheet(wb, ws, "Midwifery Requests");

			utils.sheet_add_aoa(ws, [[
				"Confirmation number",
				"First name",
				"Last name",
				"Preferred name",
				"Pronouns",
				"Yukon health insurance",
				"Need interpretation",
				"Preferred phone",
				"Preferred email",
				"Is okay to leave message",
				"Date confirmed",
				"Is this your first pregnancy?",
				"How many vaginal births",
				"How many c-section births",
				"Complications with previous",
				"Provide details",
				"Midwife before",
				"Medical Concerns with Pregnancy",
				"Provide details2",
				"Have you had primary healthcare?",
				"Menstrual cycle length",
				"Family physician",
				"Physician's name",
				"Major medical conditions",
				"Provide details3",
				"Do you identify with one or more of these groups and communities",
				"How did you find out about the midwifery clinic",
				"Birth location",
				"Preferred contact",
				"Date of birth",
				"When was the first day of your last period",
				"Due date",
				"Created at",
				"Updated at",
				"Community located",
				"Preferred language"
			]], { origin: "A1" });

			writeFileXLSX(wb, fileName);
        }
	},
};
</script>
