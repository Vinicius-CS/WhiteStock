import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from './router';
import { loadFonts } from './plugins/webfontloader';
import VueTheMask from 'vue-the-mask';
import { createStore } from 'vuex';
import Cookies from 'js-cookie';
import VueJwtDecode from 'vue-jwt-decode';
import VueApexCharts from "vue3-apexcharts";

loadFonts();

const store = createStore({
    state () {
        return {
            token: Cookies.get('token')
        }
    },

    getters: {
        hasPermission: (state) => (key, permission) => {
            const userData = VueJwtDecode.decode(state.token);

            if (userData.cnpj != undefined) {
                return true;
            } else if (userData.permission != undefined && userData.permission[key] != undefined && userData.permission[key][permission] != undefined && userData.permission[key][permission] == 1) {
                return true;
            }

            return false;
        },

        userData (state) {
            return VueJwtDecode.decode(state.token);
        }
    },

    mutations: {
        setToken (state, value) {
            state.token = value;
            Cookies.set(`token`, value, { expires: 1 });
        },

        removeToken (state) {
            state.token = undefined;
            Cookies.remove('token');
        }
    },
});

const app = createApp(App);

app.use(store);
app.use(router);
app.use(VueTheMask);
app.use(vuetify);
app.use(VueApexCharts);
app.mount('#app');