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
								<th>
									<b>Value<span v-if="dentalServiceDuplicated">&nbsp;(Original Request)</span></b>
								</th>
								<th v-if="dentalServiceDuplicated">
									<b>Value&nbsp;(Duplicated Request)</b>
								</th>
								<th v-else>
								</th>
							</tr>
                        </thead>
                        <tbody v-if="dentalServiceDuplicated" >
							<tr>
								<td>Proof of income</td>
								<td v-if="dentalFiles" class="td-file-download">
									<v-icon
										right
										light
										color="black"
									>
									mdi-file
									</v-icon>
									{{dentalFiles.file_fullName}}
									<br>
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
								<td v-else>
								</td>
								<td  v-if="dentalFilesDuplicated" class="td-file-download">
									<v-icon
										right
										light
										color="black"
									>
									mdi-file
									</v-icon>
									{{dentalFilesDuplicated.file_fullName}}
									<br>
									<v-btn
										color="#F3A901"
										class="pull-right ma-2 white--text apply-btn"
										@click="downloadFile(dentalFilesDuplicated.id)"
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
								<td v-else>
								</td>
							</tr>

                        </tbody>
						<tbody v-else>
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
										v-show="showDownloadButton"
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
    props: ['dentalService', 'dentalServiceDuplicated', 'dentalFiles',
			'dentalFilesDuplicated', 'panelModel', 'showDownload'
			],
	data() {
		return {
			modelPanel: this.panelModel,
			showDownloadButton: this.showDownload
		};
	},
	watch: {
		panelModel(newValue) {
			this.modelPanel = newValue;
		},
		showDownload(newValue) {
			this.showDownloadButton = newValue;
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