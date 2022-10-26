import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import { loadFonts } from './plugins/webfontloader'
import VueTheMask from 'vue-the-mask'
import { createStore } from 'vuex'
import Cookies from 'js-cookie'

loadFonts();

const store = createStore({
    state () {
        return {
            token: Cookies.get('token'),
        }
    },

    mutations: {
        setToken (state, value) {
            state.token = value;
            Cookies.set(`token`, value, { expires: 3 });
        },

        removeToken (state) {
            state.token = undefined;
            Cookies.remove('token');
        }
    }
})

const app = createApp(App);

app.use(router);
app.use(VueTheMask)
app.use(vuetify);
app.use(store);
app.mount('#app');