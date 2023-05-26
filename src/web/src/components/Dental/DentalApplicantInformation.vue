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
								<th colspan="2">
									<b>Value</b>
								</th>
							</tr>
                        </thead>
                        <tbody>
							<tr>
								<td>First name</td>
								<td colspan="2">{{ dentalService.first_name }}</td>
							</tr>

							<tr v-if="dentalService.middle_name">
								<td>Middle name</td>
								<td colspan="2">{{ dentalService.middle_name }}</td>
							</tr>

							<tr>
								<td>Last name</td>
								<td colspan="2">{{ dentalService.last_name }}</td>
							</tr>

							<tr v-if="dentalService.date_of_birth">
								<td>Date of birth</td>
								<td colspan="2">{{ (dentalService.date_of_birth) }}</td>
							</tr>

							<tr v-if="dentalService.health_card_number">
								<td>Yukon health care card number</td>
								<td colspan="2">{{ dentalService.health_card_number }}</td>
							</tr>

							<tr v-if="dentalService.mailing_address">
								<td>Mailing address</td>
								<td colspan="2">{{ dentalService.mailing_address }}</td>
							</tr>

							<tr v-if="dentalService.city_or_town">
								<td>City or town</td>
								<td colspan="2">{{ dentalService.city_or_town }}</td>
							</tr>

							<tr v-if="dentalService.postal_code">
								<td>Postal code</td>
								<td colspan="2">{{ dentalService.postal_code }}</td>
							</tr>

							<tr v-if="dentalService.phone">
								<td>Phone number</td>
								<td colspan="2">{{ (dentalService.phone) }}</td>
							</tr>

							<tr v-if="dentalService.email">
								<td>Email address</td>
								<td colspan="2">{{ (dentalService.email) }}</td>
							</tr>

							<tr v-if="dentalService.other_coverage">
								<td>Do you have coverage for dental services under any other program, plan or insurance group?</td>
								<td colspan="2">{{ (dentalService.other_coverage) }}</td>
							</tr>

							<tr v-if="dentalService.are_you_eligible_for_the_pharmacare_and_extended_health_care_ben">
								<td>Are you eligible for the Pharmacare and Extended Health Care Benefits program?</td>
								<td colspan="2">{{ dentalService.are_you_eligible_for_the_pharmacare_and_extended_health_care_ben }}</td>
							</tr>

							<tr v-if="dentalService.email_instead">
								<td>I will submit my proof of income separately</td>
								<td colspan="2">{{ dentalService.email_instead }}</td>
							</tr>

							<tr v-if="dentalService.have_children">
								<td>Do you have children who are under 19 years of age AND listed on your Yukon Health Care Insurance Plan (YHCIP)?</td>
								<td colspan="2">{{ dentalService.have_children }}</td>
							</tr>

                        </tbody>
                    </template>
				</v-simple-table>
			</v-expansion-panel-content>
        </v-expansion-panel>

	</v-expansion-panels>

</template>
<script>
export default {
    name: 'DentalApplicantInformation',
    props: ["dentalService", "panelModel"],
	data() {
		return {
			modelPanel: this.panelModel,
		};
	},
	watch: {
		panelModel(newValue) {
			this.modelPanel = newValue;
		},
	},
}
</script>