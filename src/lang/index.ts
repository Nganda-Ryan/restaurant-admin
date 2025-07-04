import { createI18n, type I18nOptions, type I18n } from 'vue-i18n';
import en from './translation/en.json';
import fr from './translation/fr.json';

// Définition du type pour vos messages
type MessageSchema = typeof en;
type Messages = {
  en: MessageSchema;
  fr: MessageSchema;
};

const i18nOptions: I18nOptions = {
  legacy: false, // important pour Vue 3
  locale: localStorage.getItem('lang') || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    fr
  }
};

const i18n: I18n = createI18n(i18nOptions);

export default i18n;