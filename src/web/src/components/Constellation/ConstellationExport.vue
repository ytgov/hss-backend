<template>
    <div class="constellation-service">
    <v-row class="mb-5" no-gutters>
        <span class="title-service">Constellation Health Requests</span>
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
            cols="12"
            sm="12"
            md="12"
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
        >
            <v-icon @click="resetInputs"> mdi-filter-remove </v-icon>
        </v-col>
        <v-col
            cols="12"
            sm="12"
            md="12"
            lg="2"
        >
            <v-btn
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
        item-key="constellation_health_id"
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
import { CONSTELLATION_URL, CONSTELLATION_EXPORT_FILE_URL } from "../../urls.js";
import { utils, writeFileXLSX } from "xlsx";
export default {
    name: "ConstellationIndex",
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
            initialPage: 1,
            initialItemsPerPage: 10,
            totalItems: 0,
            itemsPerPage: [10, 15, 50, 100, -1],
            exportMaxSize: 250,
            allItems: 0,
            isAllData: false,
            initialFetch: 1,
    }),
    computed: {
        headers() {
            return [
                {
                    text: "Legal Name",
                    value: "your_legal_name",
                    width: "15%",
                    sortable: true,
                },
                {
                    text: "Date of Birth",
                    value: "date_of_birth",
                    width: "11%",
                    sortable: true,
                },
                {
                    text: "Do you have a family physician?",
                    value: "family_physician",
                    width: "15%",
                    sortable: true,
                },
                {
                    text: "Diagnosis/History",
                    value: "diagnosis",
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
                    value: "status",
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
            if(this.date !== null && this.dateEnd !== null) {
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
            .post(CONSTELLATION_URL, {
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

            let allConstellationData = [];
            let allFamilyMembersData = [];

            const fetchBatchData = async (start, end) => {
                let idArray = [];
                if (!this.isAllData) {
                    idArray = this.selected.slice(start, end).map(e => e.constellation_health_id);
                }

                try {
                    const response = await axios.post(CONSTELLATION_EXPORT_FILE_URL, {
                        params: {
                            requests: idArray,
                            status: this.actionSelected,
                            dateFrom: this.date,
                            dateTo: this.dateEnd,
                            offset: start,
                            limit: this.exportMaxSize,
                            isAllData: this.isAllData
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
                        allConstellationData = allConstellationData.concat(data.dataConstellation);
                        allFamilyMembersData = allFamilyMembersData.concat(data.dataFamilyMembers);
                    });

                    this.generateExcel(allConstellationData, allFamilyMembersData);
                } catch (error) {
                    console.error('Error processing Constellation Export batches:', error);
                } finally {
                    this.loadingExport = false;
                    this.isAllData = false;
                }
            };

            processBatches();
        },
        generateExcel(allConstellationData, allFamilyMembersData) {
            const ws = utils.json_to_sheet(allConstellationData);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Constellation Requests");

            utils.sheet_add_aoa(
                ws,
                [
                    [
                        "First name",
                        "Last name",
                        "Is this your legal name?",
                        "Legal name",
                        "Pronouns",
                        "Date of birth",
                        "Do you have a Yukon health care card?",
                        "Health care card number",
                        "YHCIP",
                        "Postal code",
                        "City or community",
                        "Prefer to be contacted",
                        "Phone Number",
                        "Email",
                        "Leave phone message",
                        "Language prefer to receive services",
                        "Interpretation support",
                        "Family physician",
                        "Current family physician",
                        "Accessing health care",
                        "Diagnosis or history",
                        "Demographic groups",
                        "Include family members",
                        "created_at",
                    ],
                ],
                { origin: "A1" }
            );

            const ws2 = utils.json_to_sheet(allFamilyMembersData);
            utils.book_append_sheet(wb, ws2, "Const. Health Family Members");
            utils.sheet_add_aoa(
                ws2,
                [
                    [
                        "Client name",
                        "First name family member",
                        "Last name family member",
                        "Legal name family member",
                        "Pronouns family member",
                        "Date of birth family member",
                        "Do you have a Yukon health care card?",
                        "Health care card number",
                        "Which province or territory is this card from?",
                        "YHCIP family member",
                        "Relationship",
                        "Language prefer to receive services",
                        "Other language",
                        "Interpretation support",
                        "Family physician",
                        "Current family physician",
                        "Accessing health care family member",
                        "Diagnosis or history family member",
                        "Demographic groups family member",
                    ],
                ],
                { origin: "A1" }
            );

            writeFileXLSX(wb, "Constellation_request.xlsx");
        }
    },
};
</script>
