import './assets/css/satoshi.css'
import './assets/css/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
const pinia = createPinia();
pinia.use(createPersistedState());

//import PrimeVue from 'primevue/config';

const app = createApp(App)

app.use(createPinia())
app.use(router);

app.mount('#app')
