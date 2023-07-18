<template>
	<v-expansion-panels multiple v-model="modelPanel">
	<v-expansion-panel class="mb-6">
		<v-expansion-panel-header>
			Dependents Information&nbsp;{{titleLabel}}
		</v-expansion-panel-header>
		<v-expansion-panel-content>
		<v-expansion-panels
			v-model="modelDependents"
			multiple
		>
			<v-expansion-panel
				v-for="(items, index) in dentalDependents"
				:key="index"
			>
				<v-expansion-panel-header class="panel-header-dependent">
					{{ items.c_firstname }}&nbsp;{{ items.c_lastname }}
				</v-expansion-panel-header>
				<v-expansion-panel-content class="panel-content-dependent">
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
							<tr v-if="items.c_firstname">
								<td>First name</td>
								<td>{{ items.c_firstname }}</td>
							</tr>

							<tr v-if="items.c_lastname">
								<td>Last name</td>
								<td>{{ items.c_lastname }}</td>
							</tr>

							<tr v-if="items.c_dob">
								<td>Date of birth</td>
								<td>{{ items.c_dob }}</td>
							</tr>

							<tr v-if="items.c_healthcare">
								<td>Yukon health care card number</td>
								<td>{{ items.c_healthcare }}</td>
							</tr>

							<tr v-if="items.c_apply">
								<td>Applying for coverage?</td>
								<td>{{ items.c_apply }}</td>
							</tr>
						</tbody>
						</template>
					</v-simple-table>
				</v-expansion-panel-content>
			</v-expansion-panel>
		</v-expansion-panels>
		</v-expansion-panel-content>
	</v-expansion-panel>
	</v-expansion-panels>
</template>
<script>
export default {
	name: "DentalDependents",
	props: ["dentalService", "dentalDependents", "titleLabel", "panelModel"],
	data() {
		return {
			modelPanel: this.panelModel,
			modelDependents: []
		};
	},
	watch: {
		panelModel(newValue) {
			this.modelPanel = newValue;
		},
	},
	created() {
		const count = Object.keys(this.dentalDependents).length;
		this.modelDependents = Array.from({ length: count }, (_, index) => index);
	},
};
</script>
