<template>
	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Dental Information</v-expansion-panel-header>
			<v-expansion-panel-content>
                <v-simple-table>
                    <template v-slot:default>
                        <thead class="table-details-header">
							<tr>
								<th>
									<b>Field</b>
								</th>
								<th>
									<b>Value<span v-if="dentalServiceDuplicated">&nbsp;(Original Request)</span></b>
								</th>
								<th v-if="dentalServiceDuplicated">
									<b>Value&nbsp;(Duplicated Request)</b>
								</th>
							</tr>
                        </thead>
						<tbody v-if="dentalServiceDuplicated" >

							<tr>
								<td>How often do you brush your teeth?</td>
								<td>{{ dentalService.often_brush }}</td>
								<td>{{ dentalServiceDuplicated.often_brush }}</td>
							</tr>

							<tr>
								<td>How would you describe the state of your teeth?</td>
								<td>{{ dentalService.state_teeth }}</td>
								<td>{{ dentalServiceDuplicated.state_teeth }}</td>
							</tr>

							<tr>
								<td>How often do you floss your teeth?</td>
								<td>{{ dentalService.often_floss }}</td>
								<td>{{ dentalServiceDuplicated.often_floss }}</td>
							</tr>

							<tr>
								<td>How would you describe the state of your gums?</td>
								<td>{{ dentalService.state_gums }}</td>
								<td>{{ dentalServiceDuplicated.state_gums }}</td>
							</tr>

							<tr>
								<td>How long has it been since you last saw a dentist or a dental therapist?</td>
								<td>{{ dentalService.last_saw_dentist }}</td>
								<td>{{ dentalServiceDuplicated.last_saw_dentist }}</td>
							</tr>

							<tr>
								<td>What was the reason for your last visit to the dentist?</td>
								<td>{{ dentalService.reason_for_dentist }}</td>
								<td>{{ dentalServiceDuplicated.reason_for_dentist }}</td>
							</tr>

							<tr>
								<td>Are you able to regularly afford dental supplies (toothpaste, floss, toothbrushes)?</td>
								<td>{{ dentalService.buy_supplies }}</td>
								<td>{{ dentalServiceDuplicated.buy_supplies }}</td>
							</tr>

							<tr>
								<td>In the past 12 months, if you needed to go to the dentist, how would you have paid for it?</td>
								<td>{{ dentalService.pay_for_visit }}</td>
								<td>{{ dentalServiceDuplicated.pay_for_visit }}</td>
							</tr>

							<tr>
								<td>In the past 12 months. what barriers have you experienced when trying to get dental care for yourself? </td>
								<td>{{ dentalService.barriers }}</td>
								<td>{{ dentalServiceDuplicated.barriers }}</td>
							</tr>

							<tr>
								<td>In the past 12 months, have you experienced any problems because of the state of your teeth, gums or mouth? </td>
								<td>{{ dentalService.problems }}</td>
								<td>{{ dentalServiceDuplicated.problems }}</td>
							</tr>

							<tr>
								<td>Do you currently need dental services?</td>
								<td>{{ dentalService.services_needed }}</td>
								<td>{{ dentalServiceDuplicated.services_needed }}</td>
							</tr>

                        </tbody>
                        <tbody v-else >

							<tr v-if="dentalService.often_brush">
								<td>How often do you brush your teeth?</td>
								<td>{{ dentalService.often_brush }}</td>
							</tr>

							<tr v-if="dentalService.state_teeth">
								<td>How would you describe the state of your teeth?</td>
								<td>{{ dentalService.state_teeth }}</td>
							</tr>

							<tr v-if="dentalService.often_floss">
								<td>How often do you floss your teeth?</td>
								<td>{{ dentalService.often_floss }}</td>
							</tr>

							<tr v-if="dentalService.state_gums">
								<td>How would you describe the state of your gums?</td>
								<td>{{ dentalService.state_gums }}</td>
							</tr>

							<tr v-if="dentalService.last_saw_dentist">
								<td>How long has it been since you last saw a dentist or a dental therapist?</td>
								<td>{{ dentalService.last_saw_dentist }}</td>
							</tr>

							<tr v-if="dentalService.reason_for_dentist">
								<td>What was the reason for your last visit to the dentist?</td>
								<td>{{ dentalService.reason_for_dentist }}</td>
							</tr>

							<tr v-if="dentalService.buy_supplies">
								<td>Are you able to regularly afford dental supplies (toothpaste, floss, toothbrushes)?</td>
								<td>{{ dentalService.buy_supplies }}</td>
							</tr>

							<tr v-if="dentalService.pay_for_visit">
								<td>In the past 12 months, if you needed to go to the dentist, how would you have paid for it?</td>
								<td>{{ dentalService.pay_for_visit }}</td>
							</tr>

							<tr v-if="dentalService.barriers">
								<td>In the past 12 months. what barriers have you experienced when trying to get dental care for yourself? </td>
								<td>{{ dentalService.barriers }}</td>
							</tr>

							<tr v-if="dentalService.problems">
								<td>In the past 12 months, have you experienced any problems because of the state of your teeth, gums or mouth? </td>
								<td>{{ dentalService.problems }}</td>
							</tr>

							<tr v-if="dentalService.services_needed">
								<td>Do you currently need dental services?</td>
								<td>{{ dentalService.services_needed }}</td>
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
	name: "DentalInformation",
	props: ["dentalService", "dentalServiceDuplicated", "panelModel"],
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
};
</script>