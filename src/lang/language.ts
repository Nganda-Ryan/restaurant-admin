// src/lang/language.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type LanguageCode = 'en' | 'fr' | 'es' | 'de' // Étendez selon vos besoins

export const useLanguageStore = defineStore('language', () => {
  const locale = ref<LanguageCode>((localStorage.getItem('lang') as LanguageCode) || 'en')

  const set = (lang: LanguageCode): void => {
    locale.value = lang
    localStorage.setItem('lang', lang)
    // Déclencher un événement personnalisé pour notifier les changements
    window.dispatchEvent(new CustomEvent('language-changed', { detail: lang }))
  }

  return { locale, set }
})