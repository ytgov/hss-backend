<template>
	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Proof of income</v-expansion-panel-header>
			<v-expansion-panel-content>
                <v-row no-gutters v-if="showFileRow">
					<v-col
						cols="10"
						sm="8"
						md="8"
						lg="8"
						class="ma-5"
						v-if="showFile"
					>
						<v-icon
							right
							light
							color="black"
						>
						mdi-file
						</v-icon>
						{{fileFullName}}

						<v-btn
							color="red"
							class="pull-right ma-2 white--text apply-btn"
							@click="deleteFile"
						>
							Delete &nbsp;
							<v-icon
								right
								dark
							>
							mdi-delete
							</v-icon>
						</v-btn>

						<v-btn
							color="#F3A901"
							class="pull-right ma-2 white--text apply-btn"
							@click="downloadFile"
						>
							Download &nbsp;
							<v-icon
								right
								dark
							>
							mdi-cloud-download
							</v-icon>
						</v-btn>
					</v-col>
					<v-col
						cols="10"
						sm="6"
						md="6"
						lg="6"
						class="ma-5"
						v-if="showFileInput"
					>
						<v-file-input
							v-model="fileProofIncome"
							ref="fileInput"
							clearable
							label="Attach your proof of income"
							outlined
							show-size
							accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
							@change="validateFile"
						>
						</v-file-input>
						<v-row class="red--text ma-3" v-if="showAttachmentSize">
								<v-icon
									right
									light
									color="red"
								>
								mdi-alert
								</v-icon>
								&nbsp;The attachment must not be larger than 10MB
						</v-row>
						<v-row class="red--text ma-3" v-if="showAttachmentType">
								<v-icon
									right
									light
									color="red"
								>
								mdi-alert
								</v-icon>
								&nbsp;Allowed attachment types: PDF, DOC, DOCX, JPG, JPEG, PNG
						</v-row>
					</v-col>
				</v-row>

				<v-row no-gutters class="ma-5">
					<v-checkbox
						v-model="checkProofIncome"
						label="I will submit my proof of income separately."
						@change="submitSeparately"
					>
					</v-checkbox>
				</v-row>

			</v-expansion-panel-content>
        </v-expansion-panel>
	</v-expansion-panels>
</template>
<script>
const axios = require("axios");
import { DENTAL_DOWNLOAD_FILE_URL } from "../../../urls.js";
import { DENTAL_DELETE_FILE } from "../../../urls.js";

export default {
	name: "FormAttachment",
	props: ["dentalService", "panelModel", "cityTown"],
	data() {
		return {
			modelPanel: this.panelModel,
			menu: false,
			checkProofIncome: false,
			showFileInput: false,
			showFile: false,
			showFileRow: true,
			fileFullName: null,
			fileId: null,
			fileProofIncome: null,
			base64: null,
			showAttachmentType: false,
			allowedExtensions: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
			showAttachmentSize: false,
			maxFileSize: 10 * 1024 * 1024, // 10 MB in bytes,
			updatedFields: []
		};
	},
	watch: {
		panelModel(newValue) {
			this.modelPanel = newValue;
		},
		dentalService(newValue){
			this.cleanAttachment();

			if (newValue.file_name) {
				this.showFile = true;
				this.fileFullName = newValue.file_name+"."+newValue.file_type;
				this.fileId = newValue.file_id;
			}else{
				this.showFileInput = true;
			}
		},
		fileProofIncome(newVal) {
			if(newVal) {
				this.createBase64Image(newVal);

				if (!this.updatedFields.includes("PROOF_INCOME")) {
					this.updatedFields.push("PROOF_INCOME");
					this.$emit('addField', "PROOF_INCOME");
				}

			} else {
				this.base64 = null;
			}
		},
		checkProofIncome(){
			this.submitSeparately();
		}
	},
	methods: {
		validateFile(){
			if(this.fileProofIncome){
				let flagReset = false;

				if(this.fileProofIncome.size > this.maxFileSize){
					this.showAttachmentSize = true;
					flagReset = true;
				}else{
					this.showAttachmentSize = false;
				}

				let fileType = this.fileProofIncome.name.split('.')[1];

				if(!this.allowedExtensions.includes(fileType.toLowerCase())){
					this.showAttachmentType = true;
					flagReset = true;
				}else{
					this.showAttachmentType = false;
				}

				if(flagReset){
					this.fileProofIncome = null;
					this.$refs.fileInput.reset();
				}
			}
		},
		createBase64Image(FileObject) {
			const reader = new FileReader();
			reader.onload = (event) => {
				this.base64 = event.target.result;
			}
			reader.readAsDataURL(FileObject);
		},
		submitSeparately(){
			this.showFileRow = this.checkProofIncome ? false : true;

			if (!this.updatedFields.includes("PROOF_INCOME")) {
				this.updatedFields.push("PROOF_INCOME");
				this.$emit('addField', "PROOF_INCOME");
			}
		},
		downloadFile(){
			axios
			.get(DENTAL_DOWNLOAD_FILE_URL+this.fileId)
			.then((resp) => {
				this.generateDownload(resp.data.fileName);
			})
			.catch((err) => console.error(err))
			.finally(() => {
				this.loading = false;
			});
		},
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
		deleteFile(){
			this.showFile = false;
			this.showFileInput = true;
			this.checkProofIncome = true;

			if (!this.updatedFields.includes("PROOF_INCOME")) {
				this.updatedFields.push("PROOF_INCOME");
				this.$emit('addField', "PROOF_INCOME");
			}
		},
		getAttachment() {

			const attachmentData = {};
			attachmentData.FILE_ID = this.fileId;
			attachmentData.PROOF_INCOME = this.checkProofIncome;
			attachmentData.DESCRIPTION = "_attach_proof";

			if(this.fileProofIncome && !this.checkProofIncome){
				attachmentData.FILE_NAME = this.fileProofIncome.name.split('.')[0];
				attachmentData.FILE_TYPE = this.fileProofIncome.name.split('.')[1];
				attachmentData.FILE_SIZE = this.fileProofIncome.size;
				attachmentData.FILE_DATA = this.base64.split(',')[1];
			}else{
				attachmentData.FILE_NAME = null;
				attachmentData.FILE_TYPE = null;
				attachmentData.FILE_SIZE = null;
				attachmentData.FILE_DATA = null;
			}

			return attachmentData;
		},
		cleanAttachment(){
			this.checkProofIncome = false;
			this.showFileInput = false;
			this.showFile = false;
			this.showFileRow = true;
			this.fileFullName = null;
			this.fileId = null;
			this.fileProofIncome = null;
		}
	}
};
</script>