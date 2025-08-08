<script setup lang="ts">
import { useSidebarStore } from '@/stores/sidebar'
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { toggleSidebar } = useSidebarStore()
const sidebarStore = useSidebarStore()
const searchQuery = ref('');
const showUserDropdown = ref(false);
const isMenuOpen = ref(false);

const menuButton = ref<HTMLElement | null>(null)
const dropdownMenu = ref<HTMLElement | null>(null)



const handleClickOutside = (event: MouseEvent) => {
  if (dropdownMenu.value && 
      !dropdownMenu.value.contains(event.target as Node) && 
      !menuButton.value?.contains(event.target as Node)) {
    isMenuOpen.value = false
  }
}

// Gestion du thème
const darkMode = ref(false);
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  localStorage.setItem('darkMode', darkMode.value.toString());
  updateTheme();
};

const updateTheme = () => {
  if (darkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const toggleMenu = (event: MouseEvent) => {
  // Empêche le clic de se propager au document
  event.stopPropagation()
    isMenuOpen.value = !isMenuOpen.value
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
onMounted(() => {
  darkMode.value = localStorage.getItem('darkMode') === 'true';
  updateTheme();
   document.addEventListener('click', handleClickOutside)
});

// Gestion de la langue
const { locale } = useI18n();
const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
];
const showLanguageDropdown = ref(false);

// Données utilisateur
const user = ref({
  name: 'Jean Dupont',
  email: 'jean.dupont@example.com',
  role: 'Administrateur'
});

// Couleur aléatoire pour le profil
const profileColors = [
  'bg-blue-500', 'bg-green-500', 'bg-red-500', 
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
  'bg-yellow-500', 'bg-teal-500'
];

const randomColor = computed(() => {
  const hash = user.value.email.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return profileColors[hash % profileColors.length];
});

const getInitials = (email: string) => {
  if (!email) return '';
  const parts = email.split('@')[0].split(/[._]/);
  return parts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
};
</script>

<template>
  <header class="sticky top-0 z-999 flex w-full bg-white shadow dark:bg-gray-800">
    <div class="flex flex-grow items-center justify-between py-3 px-4 md:px-6 2xl:px-11">
      <!-- Partie gauche - Menu mobile -->
      <div class="flex items-center gap-2 sm:gap-4 lg:hidden">
        <button
          class="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-gray-600 dark:bg-gray-700 lg:hidden"
          @click="toggleSidebar()">
          <span class="relative block h-5.5 w-5.5 cursor-pointer">
            <span class="block absolute right-0 h-full w-full">
              <span
                class="relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white"
                :class="{ '!w-full delay-300': !sidebarStore.isSidebarOpen }"></span>
              <span
                class="relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white"
                :class="{ '!w-full delay-400': !sidebarStore.isSidebarOpen }"></span>
              <span
                class="relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white"
                :class="{ '!w-full delay-500': !sidebarStore.isSidebarOpen }"></span>
            </span>
            <span class="block absolute right-0 h-full w-full rotate-45">
              <span
                class="absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white"
                :class="{ '!h-0 delay-[0]': !sidebarStore.isSidebarOpen }"></span>
              <span
                class="delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white"
                :class="{ '!h-0 delay-200': !sidebarStore.isSidebarOpen }"></span>
            </span>
          </span>
        </button>
        
        <router-link class="block flex-shrink-0 lg:hidden" to="/">
          <img src="@/assets/images/logo/restaurant-logo.png" alt="Logo" class="h-15"/>
        </router-link>
      </div>

      <!-- Barre de recherche - Taille originale -->
      <div class="hidden sm:flex items-center p-2 rounded-lg bg-gray-50 shadow h-14 mx-4 dark:bg-gray-700" 
           :class="{'w-3/5 sm:w-4/5 md:w-9/12 lg:w-full': true}">
        <form class="w-full">
          <div class="relative">
            <button class="absolute top-1/2 left-0 -translate-y-1/2">
              <svg class="fill-gray-500 hover:fill-primary dark:fill-gray-300 dark:hover:fill-primary" width="20"
                height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                  fill="" />
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                  fill="" />
              </svg>
            </button>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="w-full bg-transparent pl-9 pr-4 font-medium focus:outline-none dark:text-white"
            />
          </div>
        </form>
      </div>

      <!-- Contrôles utilisateur -->
      <div class="flex items-center gap-3">
        <!-- Dark/Light mode -->
        <button
          @click="toggleDarkMode"
          class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          :title="darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'"
        >
          <svg
            v-if="darkMode"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-yellow-300"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-700 dark:text-gray-300"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
            />
          </svg>
        </button>

        <!-- Sélecteur de langue -->
        <div class="relative">
          <button
            @click="showLanguageDropdown = !showLanguageDropdown"
            class="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span class="text-lg">{{ locale === 'en' ? '🇬🇧' : '🇫🇷' }}</span>
          </button>

          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showLanguageDropdown"
              class="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:ring-gray-600 z-50"
              @click.away="showLanguageDropdown = false"
            >
              <div class="py-1" role="none">
                <button
                  v-for="lang in languages"
                  :key="lang.code"
                  @click="locale = lang.code; showLanguageDropdown = false"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                  :class="{ 'bg-gray-100 dark:bg-gray-600': locale === lang.code }"
                >
                  {{ lang.flag }} {{ lang.name }}
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- Menu utilisateur - Nouveau design -->
        <div class="relative">
          <button
            @click="showUserDropdown = !showUserDropdown"
            class="flex items-center justify-center w-10 h-10 rounded-full text-white font-medium hover:opacity-90 transition-opacity"
            :class="randomColor"
          >
            {{ getInitials(user.email) }}
          </button>

          <!-- Nouveau menu déroulant -->
          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showUserDropdown"
              class="absolute right-0 mt-2 w-64 origin-top-right rounded-lg bg-white shadow-xl dark:bg-gray-700 z-50 overflow-hidden"
              @click.away="showUserDropdown = false"
            >
              <!-- En-tête avec couleur de profil -->
              <div class="h-16" :class="randomColor"></div>
              
              <!-- Photo de profil et infos -->
              <div class="px-4 pb-4 -mt-8">
                <div class="flex items-end">
                  <div class="w-16 h-16 rounded-full border-4 border-white dark:border-gray-700 flex items-center justify-center text-2xl font-bold text-white" :class="randomColor">
                    {{ getInitials(user.email) }}
                  </div>
                  <button class="ml-auto p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>

                <div class="mt-3">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ user.name }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-300">{{ user.role }}</p>
                  <p class="text-xs text-gray-400 dark:text-gray-400 mt-1 truncate">{{ user.email }}</p>
                </div>
              </div>

              <!-- Menu -->
              <div class="border-t border-gray-200 dark:border-gray-600 py-1">
                <router-link
                  to="/profile"
                  class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center"
                  @click="showUserDropdown = false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mon profil
                </router-link>
                <router-link
                  to="/settings"
                  class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center"
                  @click="showUserDropdown = false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Paramètres
                </router-link>
                <button
                  class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center"
                  @click="showUserDropdown = false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Déconnexion
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
  .shadow-top {
    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .custom-scrollbar {
    overflow-x: auto;
  }

  .custom-scrollbar::-webkit-scrollbar {
    height: 8px;
    background-color: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #4CAF50; 
    border-radius: 10px;
  }
</style>