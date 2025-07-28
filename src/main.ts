import './assets/css/satoshi.css'
import './assets/css/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import i18n from './lang/index'
import App from './App.vue'
import router from './router'

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia);
app.use(router);
app.use(i18n);

app.mount('#app')
