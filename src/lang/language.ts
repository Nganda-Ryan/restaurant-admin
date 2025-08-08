// src/lang/language.ts
import { defineStore } from 'pinia';

export const useLanguageStore = defineStore('language', {
  state: () => ({
    language: localStorage.getItem('language') || null as string | null,
  }),

  getters: {
    locale: (state) => state.language,
  },

  actions: {
    set(lang: string | null) {
      this.language = lang;
      localStorage.setItem('language', lang || '');
      console.log('here', lang);
    },

    init() {
      // Cette action peut être appelée au démarrage de l'application
      const storedLanguage = localStorage.getItem('language');
      if (storedLanguage) {
        this.language = storedLanguage;
      }
    },
  },
  persist: true,
});
