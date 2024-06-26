<template>
    <div class="constellation-service">
        <v-row class="mb-5" no-gutters>
            <span class="title-service">Constellation Health Requests</span>
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
                cols="12"
                sm="12"
                md="12"
                lg="1"
                class="btn-reset"
                v-if="removeFilters"
            >
                <v-icon @click="resetInputs"> mdi-filter-remove </v-icon>
            </v-col>
            <v-col
				cols="12"
                sm="12"
                md="12"
                lg="1"
			>
			</v-col>
        </v-row>
        <v-data-table
            dense
            v-model="selected"
            show-select
            item-key="constellation_health_id"
            checkbox-color="black"
            :items="items"
            :headers="headers"
            :options.sync="options"
            :loading="loading"
            :search="search"
            @input="enterSelect"
        >
            <template v-slot:[`item.showUrl`]="{ item }">
                <v-icon @click="showDetails(item.showUrl)">mdi-eye</v-icon>
            </template>
        </v-data-table>
    </div>
</template>

<script>
const axios = require("axios");
import { CONSTELLATION_URL } from "../../urls.js";
import Notifications from "../Notifications.vue";

export default {
    name: "ConstellationIndex",
    props: ['type'],
    data: () => ({
        loading: false,
        bulkSelected: [],
        items: [],
        statusSelected: [1],
        date: null,
        menu: false,
        dateEnd: null,
        statusFilter: [],
        menuEnd: false,
        selected: [],
        bulkActions: [],
        actionSelected: "",
        itemsSelected: [],
        alertMessage: "",
        alertType: null,
        search: "",
        applyDisabled: true,
        options: {},
        flagAlert: false,
        statusChangeMessage: "Status changed successfully.",
		nonexistentMessage: "The submission you are consulting is closed or non existant, please choose a valid submission.",
        headers: [
        {
            text: "Legal Name",
            value: "your_legal_name",
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
            text: "Do you have a family physician?",
            value: "family_physician",
            width: "10%",
            sortable: true,
        },
        { text: "Diagnosis/History", value: "diagnosis", sortable: true },
        { text: "Created", value: "created_at", width: "15%", sortable: true },
        { text: "Status", value: "status", sortable: true },
        { text: "", value: "showUrl", sortable: false },
        ],
        page: 1,
        pageCount: 0,
        iteamsPerPage: 10,
        alignments: "center",
    }),
    components: {
        Notifications
    },
    watch: {
        options: {
            handler() {
                this.getDataFromApi();
            },
            deep: true,
        },
        search: {
            handler() {
                this.getDataFromApi();
            },
            deep: true,
        },
    },
    created() {
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
        changeStatusSelect(){
            this.selected = [];
            this.getDataFromApi();
        },
        updateDate(){
            if(this.date !== null && this.dateEnd !== null){
                this.selected = [];
                this.getDataFromApi();
            }
        },
        removeFilters() {
            return this.date || this.dateEnd || this.statusSelected;
        },
        resetInputs() {
            this.date = null;
            this.dateEnd = null;
            this.statusSelected = null;
            this.bulkSelected = null;
            this.applyDisabled = true;
            this.selected = [];
            this.getDataFromApi();
        },
        getDataFromApi() {
            this.loading = true;
            axios
            .post(CONSTELLATION_URL, {
                params: {
                    dateFrom: this.date,
                    dateTo: this.dateEnd,
                    status: this.statusSelected
                }
            })
            .then((resp) => {
                this.items = resp.data.data;
                this.bulkActions = resp.data.dataStatus;
                this.statusFilter = resp.data.dataStatus.filter((element) => element.value != 4);
                this.loading = false;
            })
            .catch((err) => console.error(err))
            .finally(() => {
                this.loading = false;
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
                    let patchUrl = CONSTELLATION_URL + "/changeStatus/";
                    axios.patch(patchUrl, {
                        params: {
                            requests: requests,
                            requestStatus: this.actionSelected
                        }
                    })
                    .then((resp) => {
                        this.$refs.notifier.showSuccess(resp.data.message);
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