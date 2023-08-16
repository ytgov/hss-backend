<template>
    <div>
        <h1>My Profile</h1>
        <p>** This information is all read-only</p>

        <div class="row ">
            <div class="col-md-6 mb-3">
                <v-text-field
                v-model="email"
                outlined
                label="Email"
                readonly
                hide-details
                ></v-text-field>
            </div>
            <div class="col-md-6 mb-3">
                <v-text-field
                v-model="username"
                outlined
                label="Username"
                readonly
                hide-details
                ></v-text-field>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from "vue";
import store from "../store";
import axios from "axios";
import { ROLES_OPTIONS } from "../urls";

const allRoles = ref([]);

export default {
    name: "Profile",
    data: () => ({
        email: '',
        username: ''
    }),
    async created() {
        await store.dispatch("profile/loadProfile");
        allRoles.value = await axios.get(ROLES_OPTIONS).then((res) => res.data.data);
        this.email = allRoles.value.email;
        this.username = allRoles.value.userName;
    }
};
</script>
