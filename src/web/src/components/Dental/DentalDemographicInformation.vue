<template>

	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Demographic Information</v-expansion-panel-header>
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
								<td>Are you willing to provide demographic and dental care information to improve our program?</td>
								<td>{{ dentalService.ask_demographic }}</td>
								<td>{{ dentalServiceDuplicated.ask_demographic }}</td>
							</tr>

							<tr>
								<td>Do you identify with any of these groups and communities? </td>
								<td>{{ dentalService.identify_groups }}</td>
								<td>{{ dentalServiceDuplicated.identify_groups }}</td>
							</tr>

							<tr>
								<td>Which gender do you currently most identify with?</td>
								<td>{{ dentalService.gender }}</td>
								<td>{{ dentalServiceDuplicated.gender }}</td>
							</tr>

							<tr>
								<td>What is the highest level of education you have completed?</td>
								<td>{{ dentalService.education }}</td>
								<td>{{ dentalServiceDuplicated.education }}</td>
							</tr>

                        </tbody>
                        <tbody v-else >

							<tr v-if="dentalService.ask_demographic">
								<td>Are you willing to provide demographic and dental care information to improve our program?</td>
								<td>{{ dentalService.ask_demographic }}</td>
							</tr>

							<tr v-if="dentalService.identify_groups">
								<td>Do you identify with any of these groups and communities? </td>
								<td>{{ dentalService.identify_groups }}</td>
							</tr>

							<tr v-if="dentalService.gender">
								<td>Which gender do you currently most identify with?</td>
								<td>{{ dentalService.gender }}</td>
							</tr>

							<tr v-if="dentalService.education">
								<td>What is the highest level of education you have completed?</td>
								<td>{{ dentalService.education }}</td>
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
	name: "DentalDemographic",
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