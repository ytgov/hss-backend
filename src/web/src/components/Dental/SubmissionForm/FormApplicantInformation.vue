<template>
	<v-expansion-panels
        multiple
		v-model="modelPanel"
		readonly="readonly"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Personal Information</v-expansion-panel-header>
			<v-expansion-panel-content>
                <v-row no-gutters>
					<v-col
						cols="12"
						sm="6"
						md="3"
						lg="3"
						class="ma-5"
					>
						<v-text-field
							outlined
							label="First name"
							v-model="dentalService.first_name"
						>
						</v-text-field>
					</v-col>
					<v-col
						cols="12"
						sm="6"
						md="3"
						lg="3"
						class="ma-5"
					>
						<v-text-field
							outlined
							label="Middle name"
							v-model="dentalService.middle_name"
						>
						</v-text-field>
					</v-col>
					<v-col
						cols="12"
						sm="6"
						md="3"
						lg="3"
						class="ma-5"
					>
						<v-text-field
							outlined
							label="Last name"
							v-model="dentalService.last_name"
						>
						</v-text-field>
					</v-col>
				</v-row>

				<v-row no-gutters>
					<v-col
						cols="12"
						sm="6"
						md="3"
						lg="3"
						class="ma-5"
					>
						<v-menu
							ref="menu"
							v-model="menu"
							:close-on-content-click="false"
							transition="scale-transition"
							min-width="auto"
						>
							<template v-slot:activator="{ on, attrs }">
								<v-text-field
									outlined
									label="Date of Birth"
									v-model="dentalService.date_of_birth"
									v-bind="attrs"
									v-on="on"
								></v-text-field>
							</template>
							<v-date-picker
								v-model="dentalService.date_of_birth"
								no-title
								@input="menu = false"
							></v-date-picker>
						</v-menu>
					</v-col>
					<v-col
						cols="12"
						sm="6"
						md="7"
						lg="7"
						class="ma-5"
					>
						<v-text-field
							outlined
							label="Yukon health care card number"
							v-model="dentalService.health_card_number"
						>
						</v-text-field>
					</v-col>
				</v-row>

			</v-expansion-panel-content>
        </v-expansion-panel>

		<v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Contact Information</v-expansion-panel-header>
			<v-expansion-panel-content>
                <v-row no-gutters>
					<v-col
						cols="12"
						sm="10"
						md="10"
						lg="10"
						class="ma-5"
					>
						<v-text-field
							outlined
							label="Mailing address"
							v-model="dentalService.mailing_address"
						>
						</v-text-field>
					</v-col>
				</v-row>

				<v-row no-gutters>
					<v-col
						cols="12"
						sm="6"
						md="3"
						lg="3"
						class="ma-5"
					>
						<v-select
							outlined
							v-model="dentalService.city_or_town"
							label="City or Town"
						></v-select>
					</v-col>
					<v-col
						cols="12"
						sm="6"
						md="7"
						lg="7"
						class="ma-5"
					>
						<v-text-field
							outlined
							label="Yukon health care card number"
							v-model="dentalService.health_card_number"
						>
						</v-text-field>
					</v-col>
				</v-row>

			</v-expansion-panel-content>
        </v-expansion-panel>


	</v-expansion-panels>
</template>
<script>
export default {
	name: "FormApplicantInformation",
	props: ["dentalService", "panelModel"],
	data() {
		return {
			modelPanel: this.panelModel,
			menu: false
		};
	},
	watch: {
		panelModel(newValue) {
			this.modelPanel = newValue;
		},
	}
};
</script>