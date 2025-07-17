import './assets/css/satoshi.css'
import './assets/css/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia';
import i18n from './lang/index'
import App from './App.vue'
import router from './router'
import { QuillEditor } from '@vueup/vue-quill'

const pinia = createPinia();
const quillEditor = QuillEditor;
const app = createApp(App)

app.use(pinia);
app.use(router);
app.component('QuillEditor', quillEditor);
app.use(i18n);

app.mount('#app')
