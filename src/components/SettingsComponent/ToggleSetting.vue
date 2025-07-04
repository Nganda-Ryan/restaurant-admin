<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-7 w-full max-w-none">
    <!-- Section Principale avec icône -->
    <div class="p-4 border border-gray-200 rounded-lg">
      <div class="flex items-center mb-4">
        <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900">Préférences principales</h3>
      </div>
      <div class="space-y-4">
        <div v-for="pref in preferences" :key="pref.id" class="flex items-start">
          <div class="flex items-center h-5">
            <input
              :id="pref.id"
              v-model="pref.value"
              @change="onPreferenceChange(pref.id, ($event.target as HTMLInputElement)?.checked)"
              type="checkbox"
              class="focus:ring-olive-500 h-4 w-4 text-olive-600 border-gray-300 rounded"
            />
          </div>
          <div class="ml-3 text-sm">
            <label :for="pref.id" class="font-medium text-gray-700">{{ pref.label }}</label>
            <p class="text-gray-500">{{ pref.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Langues avec icône -->
    <div class="p-4 border border-gray-200 rounded-lg">
      <div class="flex items-center mb-4">
        <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900">Langues</h3>
      </div>
      <div class="space-y-4">
        <div v-for="language in languages" :key="language.code" class="flex items-start">
          <div class="flex items-center h-5">
            <input
              :id="`lang-${language.code}`"
              v-model="selectedLanguage"
              type="radio"
              :value="language.code"
              class="focus:ring-olive-500 h-4 w-4 text-olive-600 border-gray-300"
              name="language-selection"
            />
          </div>
          <div class="ml-3 text-sm">
            <label :for="`lang-${language.code}`" class="font-medium text-gray-700">{{ language.label }} ({{ language.code }})</label>
            <p class="text-gray-500">{{ language.nativeName }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Section Monnaies avec icône -->
    <div class="p-4 border border-gray-200 rounded-lg">
      <div class="flex items-center mb-4">
        <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900">Monnaies</h3>
      </div>
      <div class="space-y-4">
        <div v-for="currency in currencies" :key="currency.id" class="flex items-start">
          <div class="flex items-center h-5">
            <input
              :id="currency.id"
              v-model="selectedCurrency"
              type="radio"
              :value="currency.code"
              class="focus:ring-olive-500 h-4 w-4 text-olive-600 border-gray-300"
              name="currency-selection"
            />
          </div>
          <div class="ml-3 text-sm">
            <label :for="currency.id" class="font-medium text-gray-700">{{ currency.label }}</label>
            <p class="text-gray-500">{{ currency.description }}</p>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="(showSectionsCount % 2) === 1"
      class="hidden md:block"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLanguageStore, type LanguageCode } from '@/lang/language'
import { updateResto } from '@/services/database'

interface Preference {
  id: string
  label: string
  description: string
  value: boolean
}

interface Currency {
  id: string
  code: string
  label: string
  description: string
}

interface Language {
  code: string
  label: string
  nativeName: string
}

// Props pour permettre la gestion externe des états
const props = defineProps<{
  preferencesValue?: Preference[] | null
  currencyValue?: string | null
  languageValue?: string | null
}>()

const languageStore = useLanguageStore()
const showSectionsCount = ref<number>(3)

const emit = defineEmits<{
  (e: 'update:preferencesValue', value: Preference[]): void
  (e: 'update:currencyValue', value: string): void
  (e: 'update:languageValue', value: string): void
}>()

// Préférences principales
const defaultPreferences: Preference[] = [
  { id: 'notifications', label: 'Notifications', description: 'Activer les notifications par email', value: true },
  { id: 'darkMode', label: 'Mode sombre', description: 'Activer l\'apparence sombre', value: false },
  { id: 'analytics', label: 'Analytics', description: 'Partager les données d\'analyse', value: true },
  { id: 'autoPrint', label: 'Impression auto', description: 'Imprimer automatiquement les commandes', value: false }
]

function onPreferenceChange(id: string, checked: boolean) {
  const updated = preferences.value.map(p =>
    p.id === id ? { ...p, value: checked } : p
  )
  preferences.value = updated
}

const preferences = computed<Preference[]>({
  get() {
    return props.preferencesValue || defaultPreferences
  },
  set(value: Preference[]) {
    emit('update:preferencesValue', value)
    localStorage.setItem('preference', JSON.stringify(value))
  }
})

// Monnaies
const defaultCurrencies: Currency[] = [
  { id: 'currency-eur', code: 'EUR', label: 'Euro', description: 'Monnaie utilisée dans la zone euro' },
  { id: 'currency-usd', code: 'USD', label: 'Dollar US', description: 'Monnaie des États-Unis' },
  { id: 'currency-gbp', code: 'GBP', label: 'Livre Sterling', description: 'Monnaie du Royaume-Uni' },
  { id: 'currency-xof', code: 'XAF', label: 'Franc CFA', description: 'Monnaie utilisée en Afrique de l\'Ouest' }
]

const selectedCurrency = computed<string>({
  get() {
    return props.currencyValue || 'EUR'
  },
  set(value: string) {
    emit('update:currencyValue', value)
    localStorage.setItem('currency', value)
  }
})

const currencies = ref<Currency[]>(defaultCurrencies)

// Langues
const languages = ref<Language[]>([
  { code: 'fr', label: 'Français', nativeName: 'Français' },
  { code: 'en', label: 'Anglais', nativeName: 'English' },
  { code: 'es', label: 'Espagnol', nativeName: 'Español' },
  { code: 'de', label: 'Allemand', nativeName: 'Deutsch' }
])

const selectedLanguage = computed<string>({
  get() {
    return props.languageValue || languageStore.locale
  },
  set(value: string) {
    emit('update:languageValue', value)
    languageStore.set(value as LanguageCode) // Met à jour le store Pinia
  }
})

watch(selectedLanguage, (newLang) => {
  console.log('Langue changée :', newLang)
})
</script>