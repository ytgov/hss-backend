<template>

	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Applicant Information</v-expansion-panel-header>
			<v-expansion-panel-content>
                <v-simple-table>
                    <template v-slot:default>
                        <thead class="table-details-header">
							<tr>
								<th>
									<b>Field</b>
								</th>
								<th>
									<b>Value</b>
								</th>
							</tr>
                        </thead>
                        <tbody>
							<tr>
								<td>First name</td>
								<td>{{ dentalService.first_name }}</td>
							</tr>

							<tr v-if="dentalService.middle_name">
								<td>Middle name</td>
								<td>{{ dentalService.middle_name }}</td>
							</tr>

							<tr>
								<td>Last name</td>
								<td>{{ dentalService.last_name }}</td>
							</tr>

							<tr v-if="dentalService.date_of_birth">
								<td>Date of birth</td>
								<td>{{ (dentalService.date_of_birth) }}</td>
							</tr>

							<tr v-if="dentalService.health_card_number">
								<td>Yukon health care card number</td>
								<td>{{ dentalService.health_card_number }}</td>
							</tr>

							<tr v-if="dentalService.mailing_address">
								<td>Mailing address</td>
								<td>{{ dentalService.mailing_address }}</td>
							</tr>

							<tr v-if="dentalService.city_or_town">
								<td>City or town</td>
								<td>{{ dentalService.city_or_town }}</td>
							</tr>

							<tr v-if="dentalService.postal_code">
								<td>Postal code</td>
								<td>{{ dentalService.postal_code }}</td>
							</tr>

							<tr v-if="dentalService.phone">
								<td>Phone number</td>
								<td>{{ (dentalService.phone) }}</td>
							</tr>

							<tr v-if="dentalService.email">
								<td>Email address</td>
								<td>{{ (dentalService.email) }}</td>
							</tr>

							<tr v-if="dentalService.other_coverage">
								<td>Do you have coverage for dental services under any other program, plan or insurance group?</td>
								<td>{{ (dentalService.other_coverage) }}</td>
							</tr>

							<tr v-if="dentalService.are_you_eligible_for_the_pharmacare_and_extended_health_care_ben">
								<td>Are you eligible for the Pharmacare and Extended Health Care Benefits program?</td>
								<td>{{ dentalService.are_you_eligible_for_the_pharmacare_and_extended_health_care_ben }}</td>
							</tr>

							<tr v-if="dentalService.email_instead">
								<td>I will submit my proof of income separately</td>
								<td>{{ dentalService.email_instead }}</td>
							</tr>

							<tr v-if="dentalService.file_id">
								<td>Proof of income</td>
								<td>
									<v-icon
										right
										light
										color="black"
									>
									mdi-file
									</v-icon>
									{{dentalService.file_fullName}}
								</td>
								<td>
									<v-btn
										color="#F3A901"
										class="pull-right ma-2 white--text apply-btn"
										@click="downloadFile(dentalService.file_id)"
									>
										Download &nbsp;
										<v-icon
											right
											dark
										>
										mdi-cloud-download
										</v-icon>
									</v-btn>
								</td>

							</tr>

							<tr v-if="dentalService.have_children">
								<td>Do you have children who are under 19 years of age AND listed on your Yukon Health Care Insurance Plan (YHCIP)?</td>
								<td>{{ dentalService.have_children }}</td>
							</tr>

                        </tbody>
                    </template>
				</v-simple-table>
			</v-expansion-panel-content>
        </v-expansion-panel>

	</v-expansion-panels>

</template>
<script>
const axios = require("axios");
import { DENTAL_DOWNLOAD_FILE_URL } from "../../urls.js";
import { DENTAL_DELETE_FILE } from "../../urls.js";

export default {
    name: 'DentalApplicantInformation',
    props: ['dental', 'panelModel'],
	data() {
		return {
			modelPanel: this.panelModel
		};
	},
	watch: {
		panelModel(newValue) {
			this.modelPanel = newValue;
		}
	},
	methods: {
		generateDownload(file){
			axios({
				url: '/'+file,
				method: 'GET',
				responseType: 'blob',
			}).then((response) => {
				// create file link in browser's memory
				const href = URL.createObjectURL(response.data);

				// create "a" HTML element with href to file & click
				const link = document.createElement('a');
				link.href = href;
				link.setAttribute('download', file);
				document.body.appendChild(link);
				link.click();

				// clean up "a" element & remove ObjectURL
				document.body.removeChild(link);
				URL.revokeObjectURL(href);

				//delete generated file for download
				axios.post(DENTAL_DELETE_FILE, {
					params: {
						file: file
					}
				});
			});
		},
		downloadFile (idDownload) {
			axios
			.get(DENTAL_DOWNLOAD_FILE_URL+idDownload)
			.then((resp) => {
				this.generateDownload(resp.data.fileName);
			})
			.catch((err) => console.error(err))
			.finally(() => {
				this.loading = false;
			});

		}
	},
}
</script>