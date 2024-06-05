
<template>
    <div class="midwifery-service">
        <v-row class="mb-5" no-gutters>
            <span class="title-service">Midwifery Requests</span>
        </v-row>

        <Notifications ref="notifier"></Notifications>
        <br>
        <v-row class="submission-filters mb-5" no-gutters>
            <v-col
                cols="12"
				sm="12"
				md="12"
				lg="3"
            >
                <v-select
                    :items="itemsBulk"
                    solo
                    label="Bulk Actions"
                    append-icon="mdi-chevron-down"
                    prepend-inner-icon="mdi-layers-triple"
                    color="grey lighten-2"
                    item-color="grey lighten-2"
                    v-model="selectedStatus"
                    @change="changeSelect"
                    id="bulk-accion-select"
                ></v-select>
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
                    :disabled="applyDisabled"
                    @click="changeStatus"
                >
                    Apply
                </v-btn>
            </v-col>
            <v-col
                cols="12"
                sm="12"
                md="12"
                lg="3"
            >
                <v-select
                    v-model="statusSelected"
                    :items="statusFilter"
                    :menu-props="{ maxHeight: '400' }"
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
                v-if="removeFilters"
                cols="12"
                sm="12"
                md="12"
                lg="1"
                class="btn-reset"
            >
                <v-icon @click="resetInputs"> mdi-filter-remove </v-icon>
            </v-col>
        </v-row>
        <v-data-table
            dense
            :items="items"
            :headers="headers"
            :options.sync="options"
            :loading="loading"
            :search="search"
            v-model="selected"
            show-select
            checkbox-color="black"
            :value="selected"
            @toggle-select-all="selectAll"

            :server-items-length="totalItems"
			@update:options="handlePagination"
            :footer-props="{
                'items-per-page-options': itemsPerPage
            }"
        >
            <template v-slot:[`item.showUrl`]="{ item }">
                <v-icon @click="showDetails(item.showUrl)">mdi-eye</v-icon>
            </template>
        </v-data-table>
    </div>
</template>

<script>
const axios = require("axios");
import Notifications from "../Notifications.vue";
import { MIDWIFERY_URL } from "../../urls.js";
import { MIDWIFERY_CHANGE_STATUS_URL } from "../../urls.js";

export default {
    name: "MidwiferyIndex",
    props: ['type'],
    data: () => ({
        loading: false,
        statusSelected: [1],
        date: null,
        menu: false,
        dateEnd: null,
        menuEnd: false,
        items: [],
        fetchedItems: [],
        itemsUnfiltered: [],
        alertMessage: "",
        alertType: null,
        search: "",
        options: {
			page: 1,
			itemsPerPage: 10
		},
        flagAlert: false,
        selected: [],
        statusFilter: [],
        applyDisabled: true,
        itemsBulk: [],
        selectedStatus: null,
        statusChangeMessage: "Status changed successfully.",
		nonexistentMessage: "The submission you are consulting is closed or non existant, please choose a valid submission.",
        headers: [
            { text: "Preferred Name", value: "preferred_name", sortable: true},
            { text: "Phone", value: "preferred_phone", sortable: true},
            { text: "Email", value: "preferred_email", sortable: true},
            { text: "Is this your first pregnancy?", value: "first_pregnancy", sortable: true},
            { text: "Due Date", value: "due_date", sortable: true},
            { text: "Preferred Birth Location", value: "birth_locations", sortable: true},
            { text: "Medical Concerns with Pregnancy", value: "medical_concerns", sortable: true},
            { text: "Major Medical Conditions", value: "major_medical_conditions", sortable: true},
            { text: "Do you identify with any of these groups and communities?", value: "do_you_identify_with_one_or_more_of_these_groups_and_communitie", sortable: true},
            { text: "Created", value: "created_at", sortable: true},
            { text: "", value: "status_description", sortable: true},
            { text: "", value: "showUrl", sortable: false},
        ],
        initialPage: 1,
        initialItemsPerPage: 10,
        totalItems: 0,
        itemsPerPage: [10, 15, 50, 100, -1],
        allItems: 0,
        isAllData: false,
        initialFetch: 1,
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
        },
    },
    created(){
    },
    mounted() {

        if (typeof this.$route.query.type !== undefined){
			if(this.$route.query.type == "status"){
				this.$refs.notifier.showSuccess(this.statusChangeMessage);
			}else if(this.$route.query.type == "nonexistent"){
				this.$refs.notifier.showError(this.nonexistentMessage);
			}
		}

    },
    methods: {
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
        getDataFromApi() {
            this.loading = true;
            this.items = [];
            const { page, itemsPerPage, sortBy, sortDesc } = this.options;

            axios.post(MIDWIFERY_URL, {
                params: {
                    dateFrom: this.date,
                    dateTo: this.dateEnd,
                    status: this.statusSelected,
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
                this.itemsBulk = resp.data.dataStatus;
                this.statusFilter = resp.data.dataStatus.filter((element) => element.value != 4);
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

            if ((sortBy.length || sortDesc.length) && sortBy[0] == 'do_you_identify_with_one_or_more_of_these_groups_and_communitie') {
                this.initialFetch = 1;
                this.getDataFromApi();
            } else if(sortBy.length || sortDesc.length){
                this.getDataFromApi();
            } else {
                if (this.fetchedItems.length >= endIndex) {
                    this.items = this.fetchedItems.slice(startIndex, endIndex);
                } else {
                    this.getDataFromApi();
                }
            }
        },
        showDetails (route) {
            this.$router.push({ path: route });
        },
        selectAll(isChecked) {
                this.isAllData = isChecked.value;
                this.selected = this.selected.length === this.items.length
                ? []
                : this.items
        },
        changeSelect(){
            this.applyDisabled = false;
        },
        removeFilters() {
            return this.date || this.dateEnd || this.statusSelected;
        },
        resetInputs() {
            this.date = null;
            this.dateEnd = null;
            this.statusSelected = null;
            this.selectedStatus = null;
            this.applyDisabled = true;
            this.selected = [];
            this.options.page = this.initialPage;
            this.options.itemsPerPage = this.initialItemsPerPage;
            this.initialFetch = 1;
            this.getDataFromApi();
        },
        changeStatus(){
            let requests = [];
			let checked = this.selected;

			if(checked.length > 0){
				checked.forEach(function (value) {
					requests.push(value.id);
				});

                axios
                .patch(MIDWIFERY_CHANGE_STATUS_URL, {
                    params: {
                        requests: requests,
                        requestStatus: this.selectedStatus
                    }
                })
                .then((resp) => {
                    this.$refs.notifier.showSuccess(resp.data.message);
                    this.getDataFromApi();
                    this.selectedStatus = null;
                    this.flagAlert = true;
                    this.applyDisabled = true;
                    this.selected = [];
                })
                .catch((err) => console.error(err))
                .finally(() => {
                    this.loading = false;
                });
            }
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
    },
};
</script>
