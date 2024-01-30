<template>
	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Children's information</v-expansion-panel-header>
			<v-expansion-panel-content>

				<v-radio-group v-model="selectedDependent" class="ma-5">
					<label class="mb-5">
						<b>Do you have children who are under 19 years of age AND listed on your Yukon Health Care Insurance Plan (YHCIP)?</b>
					</label>
					<v-radio
						v-for="option in optionsDependents"
						:key="option.key"
						:label="option.text"
						:value="option.value"
						@change="haveDependents(option.key, 'C')"
					></v-radio>
				</v-radio-group>

				<div v-if="showDependentsList">
				<v-row
					no-gutters
					class="mt-5 mb-5 ml-2 mr-1"
					v-for="(items, index) in listDependents"
					:key="index"
				>
					<v-col cols="10" sm="10" xs="10" md="2" lg="2" class="mr-1">
						<v-text-field
							outlined
							label="First name"
							v-model="items.c_firstname"
						>
						</v-text-field>
					</v-col>
					<v-col cols="10" sm="10" xs="10" md="2" lg="2" class="mr-1">
						<v-text-field
							outlined
							label="Last name"
							v-model="items.c_lastname"
						>
						</v-text-field>
					</v-col>
					<v-col cols="10" sm="10" xs="10" md="2" lg="2" class="mr-1">
						<v-menu
							ref="menu"
							v-model="items.menu"
							:close-on-content-click="false"
							transition="scale-transition"
							min-width="auto"
						>
							<template v-slot:activator="{ on, attrs }">
								<v-text-field
									outlined
									label="Date of Birth"
									readonly
									v-model="items.c_dob"
									v-bind="attrs"
									v-on="on"
								></v-text-field>
							</template>
							<v-date-picker
								v-model="items.c_dob"
								no-title
								@input="items.menu = false"
							>
							</v-date-picker>
						</v-menu>
					</v-col>
					<v-col cols="10" sm="10" xs="10" md="2" lg="2" class="mr-1">
						<v-text-field
							outlined
							label="YHCIP number"
							v-model="items.c_healthcare"
						>
						</v-text-field>
					</v-col>
					<v-col cols="10" sm="10" xs="10" md="2" lg="2" class="mr-1">
						<v-select
							outlined
							v-model="items.c_apply"
							:items="applyCoverage"
							label="Applying for coverage?"
						></v-select>
					</v-col>
					<v-col cols="1">
						<v-btn @click="addRow" class="mr-1" color="primary" x-small><v-icon>mdi-plus</v-icon></v-btn>
						<v-btn @click="deleteRow(index)" color="error" x-small><v-icon>mdi-delete</v-icon></v-btn>
					</v-col>
				</v-row>
				</div>

			</v-expansion-panel-content>
        </v-expansion-panel>
	</v-expansion-panels>
</template>
<script>
export default {
	name: "FormDependents",
	props: ["dentalService", "dentalDependents", "idSubmission" ,"panelModel"],
	data() {
		return {
			modelPanel: this.panelModel,
			menus: [],
			selectedDependent: false,
			checkNoDependents: false,
			showDependentsList: false,
			optionsDependents: [
				{ text: "Yes, I have children listed on my YHCIP.", value: "Yes, I have children listed on my YHCIP.", key: 1,},
				{ text: "No, I don't have children listed on my YHCIP.", value: "No, I don't have children listed on my YHCIP.", key: 2 },
			],
			applyCoverage:  [
				{ text: "Yes, they are applying", value: "Yes", key: 1,},
				{ text: "No, they have coverage", value: "No", key: 2 },
			],
			haveChildren: {},
			newDependentsCounter:0,
			listDependents: [],
			newDependents: [],
			updatedDependents: [],
			deletedDependents: [],
			updatedFields: []
		};
	},
	watch: {
		panelModel(newValue) {
			this.modelPanel = newValue;
		},
		dentalService(newValue){
			this.cleanDependents();

			if(newValue.have_children) {
				let option = this.optionsDependents.find(option => option.value == newValue.have_children);
				this.selectedDependent = option.value;
				this.haveDependents(option.key, 'D');
			}

			this.newDependentsCounter = Object.keys(this.dentalDependents).length;

			if(Object.keys(this.dentalDependents).length === 0){
				this.addRow();
			}else{
				this.listDependents = this.dentalDependents;
			}
		},
		dentalDependents(newValue){
			const resultApply = [];

			for (const obj of newValue) {
				for (const item of this.applyCoverage) {
					if (obj.c_apply) {
						if (obj.c_apply === item.value) {
							resultApply[obj.id] = item.value;
							break;
						}
					}else{
						resultApply[obj.id] = null;
					}
				}
			}
		}
	},
	methods: {
		addRow() {
			this.listDependents.push({
				c_apply: null,
				c_dob: null,
				c_firstname: null,
				c_healthcare: null,
				c_lastname: null,
				dental_service_id: null,
				menu: false,
				id: this.newDependentsCounter
			});

			if (!this.updatedFields.includes("HAVE_CHILDREN")) {
				this.updatedFields.push("HAVE_CHILDREN");
				this.$emit('addField', "HAVE_CHILDREN");
			}
		},
		deleteRow(index) {
			//let deletedElement = this.listDependents.pop();
			let deletedElement = this.listDependents.splice(index, 1)[0];
			this.deletedDependents.push(deletedElement);

			if (!this.updatedFields.includes("HAVE_CHILDREN")) {
				this.updatedFields.push("HAVE_CHILDREN");
				this.$emit('addField', "HAVE_CHILDREN");
			}
		},
		haveDependents(key, type) {
			this.showDependentsList = key === 1 ? true : false;

			let options = this.optionsDependents.find(option => option.key == key);

			this.haveChildren = {
				text: options.text,
				key: options.key,
				value: options.key == 1 ? 'Yes' : 'No'
			}

			if (type == 'C' && !this.updatedFields.includes("HAVE_CHILDREN")) {
				this.updatedFields.push("HAVE_CHILDREN");
				this.$emit('addField', "HAVE_CHILDREN");
			}
		},
		getDependents() {

			this.newDependents = this.listDependents.map((item) => {
				if(item.dental_service_id == null){
					const modifiedId = item.dental_service_id == null ? null : item.id;
					const modifiedItem = { ...item, id: modifiedId };
					modifiedItem.dental_service_id = Number(this.idSubmission);

					for (const key in modifiedItem) {
						modifiedItem[key.toUpperCase()] = modifiedItem[key];
						delete modifiedItem[key];
					}

					delete modifiedItem.MENU;
					delete modifiedItem.ID;

					return modifiedItem;
				}

					return undefined;

			}).filter(Boolean);

			this.updatedDependents = this.listDependents
			.map((item) => {
				const modifiedItem = { ...item };
				delete modifiedItem.menu;

				for (const key in modifiedItem) {
					modifiedItem[key.toUpperCase()] = modifiedItem[key];
					delete modifiedItem[key];
				}

				return item.dental_service_id !== null ? modifiedItem : null;

			}).filter(Boolean);

			this.deletedDependents = this.deletedDependents
			.map((item) => {
				const modifiedItem = { ...item };
				delete modifiedItem.menu;

				for (const key in modifiedItem) {
					modifiedItem[key.toUpperCase()] = modifiedItem[key];
					delete modifiedItem[key];
				}

				return item.dental_service_id !== null ? modifiedItem : null;

			}).filter(Boolean);

			return {newDependents: this.newDependents,
					updatedDependents: this.updatedDependents,
					deletedDependents: this.deletedDependents,
					haveChildren: this.haveChildren};
		},
		cleanDependents(){
			this.menus = [];
			this.selectedDependent = false;
			this.checkNoDependents = false;
			this.showDependentsList = false;
			this.haveChildren = {};
			this.newDependentsCounter = 0;
			this.listDependents = [];
			this.newDependents = [];
			this.updatedDependents = [];
			this.deletedDependents = [];
		}
	}
};
</script>