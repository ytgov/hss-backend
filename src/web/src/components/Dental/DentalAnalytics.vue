<template>
	<div class="analytics-page">
		<div class="row">
			<v-card class="mt-3 col-md-6" color="#ffffff">
				<SubmissionsChart :title="'Submissions'" :data="submissionsData" @filterSelected="sFilterSelected"></SubmissionsChart>
			</v-card>
			<v-card class="mt-3 col-md-6" color="#ffffff">
				<StatusChart :title="'Status'" :data="statusData" @filterSelected="scFilterSelected"></StatusChart>
			</v-card>
		</div>
		<div class="row">
			<v-card class="mt-3 col-md-6" color="#ffffff">
				<AgesChart :title="'Age'" :data="submissionsAgeData" @filterSelected="aFilterSelected"></AgesChart>
			</v-card>
			<v-card class="mt-3 col-md-6" color="#ffffff">
				<GenderChart :title="'Sex'" :data="submissionsGenderData" @filterSelected="gFilterSelected"></GenderChart>
			</v-card>
		</div>
	</div>
</template>

<script>
const axios = require("axios");
import StatusChart from "../Chart/Status.vue";
import SubmissionsChart from "../Chart/Submissions.vue";
import AgesChart from "../Chart/Ages.vue";
import GenderChart from "../Chart/Gender.vue";
import { ref } from "vue";
import { setSubmissionsStatusData, setSubmissionsData, setSubmissionsAgeData, setSubmissionsGenderData } from "../../helper/index";
import { DENTAL_STATUS_URL, DENTAL_SUBMISSIONS_URL, SUBMISSION_AGE_URL, SUBMISSION_GENDER_URL } from "../../urls";

const labelColors = [
	{ label: "New", color: "#41b883" },
	{ label: "Closed", color: "#dd3e22" },
	{ label: "Declined", color: "#f3b228" },
	{ label: "Enrolled", color: "#3333ff" },
	{ label: "Pending", color: "#ff1aff" }
];

const scData = ref({});
const sData = ref({});
const saData = ref({});
scData.value = setSubmissionsStatusData([0, 0, 0, 0], labelColors);
saData.value = setSubmissionsAgeData([0, 0, 0, 0], []);
const sgData = ref({});

const getSubmissionsStatusDataFromApi = (actionId, actionVal) => {
	axios
	.get(`${DENTAL_STATUS_URL}/${actionId}/${actionVal}`)
	.then((resp) => {
		const curData = resp.data.data
		const data = curData.map(x => x.submissions);
		const labels = curData.map(x => ({label: x.status, color: labelColors.filter(y => y.label === x.status)[0].color }))
		scData.value = setSubmissionsStatusData(data, labels);
	})
	.catch((err) => console.error(err));
};

const getSubmissionsDataFromApi = (actionId, actionVal) => {
	axios
	.get(`${DENTAL_SUBMISSIONS_URL}/${actionId}/${actionVal}`)
	.then((resp) => {
		sData.value = setSubmissionsData(resp);
	})
	.catch((err) => console.error(err));
};

const getSubmissionsAgeDataFromApi = (actionId, actionVal) => {
    axios
    .get(`${SUBMISSION_AGE_URL}/${actionId}/${actionVal}`)
    .then((resp) => {

		const curData = resp.data.data;
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
	name: "DentalAnalytics",
	components: {
		StatusChart,
		SubmissionsChart,
		AgesChart,
        GenderChart
	},
	data: () => ({
		statusData: scData,
		submissionsData: sData,
		submissionsAgeData: saData,
        submissionsGenderData: sgData
	}),
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
	},
	mounted() {
		getSubmissionsStatusDataFromApi("week", "W20230130");
		getSubmissionsDataFromApi("week", "W20230130");
		getSubmissionsAgeDataFromApi("week", "W20230130");
        getSubmissionsGenderDataFromApi("week", "W20230130");
	},
};
</script>
