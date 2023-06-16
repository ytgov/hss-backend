<template>
    <div class="home">
        <div class="row">
            <div :class="divChartsClass">
                <div class="row">
                    <v-card :class="cardsChartsClass" color="#ffffff">
                        <SubmissionsChart :title="'Submissions'" :data="submissionsData" @filterSelected="sFilterSelected"></SubmissionsChart>
                    </v-card>
                    <v-card :class="cardsChartsClass" color="#ffffff">
                        <StatusChart :title="'Status'" :data="statusData" @filterSelected="scFilterSelected"></StatusChart>
                    </v-card>
                </div>
                <div class="row" v-if="checkPermissions('dental_view')">
                    <v-card class="mt-3 col-md-6" color="#ffffff">
                        <AgesChart :title="'Age'" :data="submissionsAgeData" @filterSelected="aFilterSelected"></AgesChart>
                    </v-card>
                    <v-card class="mt-3 col-md-6" color="#ffffff">
                        <GenderChart :title="'Sex'" :data="submissionsGenderData" @filterSelected="gFilterSelected"></GenderChart>
                    </v-card>
                </div>
            </div>
            <div :class="divTimelineClass">
                <ActivityTimeline :title="'Activity Timeline'" :data="atData"></ActivityTimeline>
            </div>
        </div>
    </div>
</template>

<script>
const axios = require("axios");
import store from "../store";
import StatusChart from "./Chart/Status.vue";
import SubmissionsChart from "./Chart/Submissions.vue";
import AgesChart from "./Chart/Ages.vue";
import GenderChart from "./Chart/Gender.vue";
import ActivityTimeline from "./General/ActivityTimeline.vue";
import { ref } from "vue";
import { setSubmissionsStatusData, setSubmissionsData, setSubmissionsAgeData, setSubmissionsGenderData } from "../helper/index";
import { SUBMISSION_STATUS_URL,
        SUBMISSION_URL,
        AUDIT_TIMELINE_URL,
        SUBMISSION_AGE_URL,
        SUBMISSION_GENDER_URL } from "../urls";

const atData = ref([]);
const scData = ref({});
const sData = ref({});
const saData = ref({});
scData.value = setSubmissionsStatusData([0, 0, 0, 0], []);
saData.value = setSubmissionsAgeData([0, 0, 0, 0], []);
const sgData = ref({});

const getSubmissionsStatusDataFromApi = (actionId, actionVal) => {
    axios
    .get(`${SUBMISSION_STATUS_URL}/${actionId}/${actionVal}`)
    .then((resp) => {
        const curData = resp.data.data
        const data = curData.map(x => x.submissions);
        const labels = curData.map(x => ({label: x.status, color: x.color }))
        scData.value = setSubmissionsStatusData(data, labels);
    })
    .catch((err) => console.error(err));
};

const getSubmissionsDataFromApi = (actionId, actionVal) => {
    axios
    .get(`${SUBMISSION_URL}/${actionId}/${actionVal}`)
    .then((resp) => {
        sData.value = setSubmissionsData(resp);
    })
    .catch((err) => console.error(err));
};

const getAuditTimelineDataFromApi = () => {
    axios
    .get(`${AUDIT_TIMELINE_URL}`)
    .then((resp) => {
        atData.value = resp.data.data;
    })
    .catch((err) => console.error(err));
}

const getSubmissionsAgeDataFromApi = (actionId, actionVal) => {
    axios
    .get(`${SUBMISSION_AGE_URL}/${actionId}/${actionVal}`)
    .then((resp) => {

        const curData = resp.data.data.DENTAL;
        const data = curData.map(x => x.submissions);
        const labels = curData.map(x => ({label: x.age_range, color: x.color}))
        saData.value = setSubmissionsAgeData(data, labels);

    })
    .catch((err) => console.error(err));
};

const getSubmissionsGenderDataFromApi = (actionId, actionVal) => {
    axios
    .get(`${SUBMISSION_GENDER_URL}/${actionId}/${actionVal}`)
    .then((resp) => {
        sgData.value = setSubmissionsGenderData(resp);
    })
    .catch((err) => console.error(err));
};

export default {
    name: "Home",
    components: {
        StatusChart,
        SubmissionsChart,
        ActivityTimeline,
        AgesChart,
        GenderChart
    },
    data: () => ({
        statusData: scData,
        submissionsData: sData,
        atData: atData,
        submissionsAgeData: saData,
        submissionsGenderData: sgData,
        dbUser: null,
        cardsChartsClass: "mt-5",
        divChartsClass: "col-md-7",
        divTimelineClass: "col-md-5"
    }),
    created: async function() {
        await store.dispatch("checkAuthentication");
        this.dbUser = store.getters.dbUser;
    },
    computed: {
        showClass() {
            return this.checkPermissions("dental_view");
        }
    },
    methods: {
        scFilterSelected: (val) => {
            const actionId = val.slice(0, 1) === "W" ? "week" : "month";
            getSubmissionsStatusDataFromApi(actionId, val);
        },
        sFilterSelected: (val) => {
            const actionId = val.slice(0, 1) === "W" ? "week" : "month";
            getSubmissionsDataFromApi(actionId, val);
        },
        aFilterSelected: (val) => {
            const actionId = val.slice(0, 1) === "W" ? "week" : "month";
            getSubmissionsAgeDataFromApi(actionId, val);
        },
        gFilterSelected: (val) => {
            const actionId = val.slice(0, 1) === "W" ? "week" : "month";
            getSubmissionsGenderDataFromApi(actionId, val);
        },
        checkPermissions(permission) {
            const userPermissions = this.dbUser?.permission;
            if (userPermissions) {
                this.cardsChartsClass = "mt-3 col-md-6";
                this.divChartsClass = "col-md-9";
                this.divTimelineClass = "col-md-3";

                return permission.every((x) => {
                    return userPermissions.find((p) => p.permission_name === x) !== undefined;
                });
            }

            return false;
        }
    },
    mounted() {
        getSubmissionsStatusDataFromApi("week", "W20230130");
        getSubmissionsDataFromApi("week", "W20230130");
        getSubmissionsAgeDataFromApi("week", "W20230130");
        getSubmissionsGenderDataFromApi("week", "W20230130");
        getAuditTimelineDataFromApi();
    },
};
</script>
