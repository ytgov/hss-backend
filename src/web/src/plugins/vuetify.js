import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import "../assets/yk-style.css";

Vue.use(Vuetify);
export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: "#0097a9",
                secondary: "#fff",
                anchor: "#00818f",
            }
        }
    }
});
