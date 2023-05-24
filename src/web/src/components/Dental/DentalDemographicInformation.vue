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
									<b>Value</b>
								</th>
							</tr>
                        </thead>
                        <tbody>

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
};
</script>