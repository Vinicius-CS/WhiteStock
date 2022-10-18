import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import { loadFonts } from './plugins/webfontloader'
import VueTheMask from 'vue-the-mask'

loadFonts();

const app = createApp(App);

app.use(router);
app.use(VueTheMask)
app.use(vuetify);
app.mount('#app');