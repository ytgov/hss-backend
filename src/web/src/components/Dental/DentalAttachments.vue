<template>

	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Attachments Information</v-expansion-panel-header>
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
							<tr v-if="dentalFiles">
								<td>Proof of income</td>
								<td>
									<v-icon
										right
										light
										color="black"
									>
									mdi-file
									</v-icon>
									{{dentalFiles.file_fullName}}
								</td>
								<td>
									<v-btn
										color="#F3A901"
										class="pull-right ma-2 white--text apply-btn"
										@click="downloadFile(dentalFiles.id)"
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
    name: 'DentalAttachments',
    props: ['dentalService', 'dentalFiles', 'panelModel'],
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