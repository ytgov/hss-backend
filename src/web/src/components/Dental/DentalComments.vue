<template>
	<v-expansion-panels
		multiple
	>
		<v-expansion-panel class="mb-6">
			<v-expansion-panel-header class="info">Comments</v-expansion-panel-header>
			<v-expansion-panel-content class="bg-grey">
				<v-card
					class="transparent"
					v-for="(items, index) in dentalComments"
					:key="index"
				>
					<v-row no-gutters class="submission-filters">
						<v-col
							cols="2"
							sm="4"
							md="2"
							lg="2"
							class="mt-5"
						>
							<v-card-title>
								{{ items.user_name }}
							</v-card-title>
						</v-col>
						<v-col
							cols="10"
							sm="8"
							md="10"
							lg="10"
						>
							<v-card-subtitle>
								{{ items.created_at }}
							</v-card-subtitle>
						</v-col>
					</v-row>
					<v-card-text>
						{{ items.comment_description }}
					</v-card-text>
					<hr class="custom-hr">
				</v-card>
				<v-row no-gutters>
					<v-col
						cols="12"
						sm="12"
						md="12"
						lg="12"
					>
						<div class="custom-text-field">
							<label class="ma-5">Add Comment</label>
							<v-textarea
								solo
								class="ml-5 mr-5"
								v-model="comment"
								@input="handleComment"
							>
							</v-textarea>
						</div>
					</v-col>
				</v-row>
				<v-row no-gutters>
					<v-btn
						color="#F3A901"
						class="ma-5 white--text details-btn"
						id="apply-btn"
						:disabled="submitDisabled"
						@click="storeComments"
					>
						Submit
					</v-btn>
				</v-row>
			</v-expansion-panel-content>
		</v-expansion-panel>
	</v-expansion-panels>
</template>
<script>
const axios = require("axios");
import { DENTAL_STORE_COMMENTS_URL } from "../../urls.js";

export default {
	name: "DentalComments",
	props: ["dentalService", "dentalComments", "idSubmission", "userData", "panelModel"],
	data() {
		return {
			modelPanel: this.panelModel,
			comment: null,
			dateComment: null,
			submitDisabled: true
		};
	},
	watch: {
		panelModel(newValue) {
			this.modelPanel = newValue;
		},
	},
	methods: {
		handleComment(event){
			this.submitDisabled = !event;
		},
		storeComments() {
			axios
			.post(DENTAL_STORE_COMMENTS_URL, {
                params: {
					id: this.idSubmission,
					comment: this.comment,
					user: this.userData.user.id
				}
            })
			.then((resp) => {
				this.comment = null;

				this.$emit("getNotification", resp.data.message);
			})
			.catch((err) => console.error(err));

		}
	}
};
</script>