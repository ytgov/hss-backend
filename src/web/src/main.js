import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

axios.defaults.withCredentials = true

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
