// src/composables/useTheme.ts
import { ref, watch } from 'vue';

export function useTheme() {
  const isDark = ref(localStorage.getItem('theme') === 'dark');
  
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
    updateTheme();
  };
  
  const updateTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Appliquer le thème au chargement
  updateTheme();
  
  return { isDark, toggleTheme };
}