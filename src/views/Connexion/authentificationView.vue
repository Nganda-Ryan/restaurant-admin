<template>
  <div class="min-h-screen bg-gradient-to-br from-teal-600 to-teal-900 flex flex-col items-center font-sans p-4 relative overflow-hidden">
    <!-- Contenu principal -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
      <h1 class="text-white text-5xl md:text-6xl font-pacifico mb-8 md:mb-12 text-center drop-shadow-lg">
        Online Food World
        <span class="block text-xl font-sans font-normal mt-2">Discover the best culinary experiences</span>
      </h1>
      
      <!-- Carte de formulaire -->
      <div class="flex flex-col md:flex-row bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl transition-all duration-300 hover:shadow-3xl">
        <!-- Section Image -->
        <div class="flex-1 p-8 md:p-10 md:w-2/5 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/20 relative overflow-hidden min-h-[300px]">
          <div class="absolute inset-0 bg-gradient-to-br from-red-400/20 to-red-600/30"></div>
          <div class="absolute inset-0 flex overflow-hidden z-20">
            <transition-group 
              name="slide" 
              tag="div" 
              class="flex w-full h-full"
            >
              <div 
                v-for="(image, index) in images" 
                :key="index"
                class="flex-shrink-0 w-full h-full transition-transform duration-500 ease-in-out"
                :style="{
                  transform: `translateX(-${currentImageIndex * 100}%)`,
                  'min-width': '100%'
                }"
              >
                <img
                  :src="image"
                  alt="Food presentation"
                  class="w-full h-full object-cover"
                />
              </div>
            </transition-group>
          </div>
        </div>

        <!-- Section Formulaire -->
        <div class="flex-1 p-8 md:p-10 md:w-3/5">
          <h2 class="text-red-500 text-3xl md:text-4xl font-pacifico mb-8 text-center relative">
            Login!

          </h2>
          
          <form @submit.prevent="submitForm" class="space-y-6 w-full max-w-sm mx-auto">
            <div class="form-group">
              <!-- <label class="block text-sm font-medium text-gray-700 mb-1 mt-8">Email Address</label> -->
              <input
                type="email"
                v-model="email"
                placeholder="Username"
                class="border-b-2 border-gray-300 focus:border-red-500 outline-none p-2 w-full transition duration-300 bg-transparent"
                required
              />
            </div>

            <div class="form-group">
              <!-- <label class="block text-sm font-medium text-gray-700 mb-1">Password</label> -->
              <div class="relative">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  placeholder="Enter your password"
                  class="border-b-2 border-gray-300 focus:border-red-500 outline-none p-2 w-full pr-10 transition duration-300 bg-transparent"
                  required
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                >
                  <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center text-sm text-gray-600">
                <input type="checkbox" class="rounded border-gray-300 text-red-500 focus:ring-red-500 mr-2">
                Remember me
              </label>
              <a href="#" class="text-sm text-red-500 hover:text-red-700">Forgot password?</a>
            </div>

            <button
              type="submit"
              class="relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-full hover:from-red-600 hover:to-red-700 transition-all w-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300 group flex items-center justify-center"
              :disabled="loading"
            >
              <span v-if="!loading" class="relative z-10">Sign In</span>
              <span v-else class="relative z-10 flex items-center">
                Signing in
                <span class="dot-flashing ml-2" style="display: flex; align-items: center;">
                  <span></span>
                </span>
              </span>
              <span class="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import rotiBoeuf from '@/assets/images/logo/roti-boeuf.jpg';
import gombo from '@/assets/images/logo/gombo.jpg';
import pile from '@/assets/images/logo/pile.jpg';
import EventBus from '@/EventBus'

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const loading = ref(false);
const password = ref('');
const showPassword = ref(false);
const currentImageIndex = ref(0);
let slideInterval = null;


const images = [
  rotiBoeuf,
  gombo, 
  pile,
  // Ajoutez d'autres images si nécessaire
];  


const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % images.length;
};

const randomImage = () => {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * images.length);
  } while (newIndex === currentImageIndex.value && images.length > 1);
  currentImageIndex.value = newIndex;
};

const startSlideShow = () => {
  slideInterval = setInterval(randomImage, 50000); // Change toutes les 3 secondes
};
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const submitForm = async() => {
  if(!email.value || !password.value) {
    EventBus.emit('login-error', { message: 'Please fill in all fields' });
    return;
  }
    loading.value = true;
  try {
    await authStore.login(email.value, password.value);
      EventBus.emit('login-success', { 
      user: authStore.user,
      timestamp: new Date().toISOString() 
    });
    router.push('/');
  } catch (error) {
    EventBus.emit('login-error', { 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
    if (error.message.includes('session is active')) {
      if (confirm('A session is already active. Do you want to log out first?')) {
        await authStore.logout();
        await authStore.login(email.value, password.value);
      }
    } else {
      console.error('Login error:', error);
    }
  }finally {
    loading.value = false;
  }
};

onMounted(() => {
  startSlideShow();
});

onBeforeUnmount(() => {
  if (slideInterval) {
    clearInterval(slideInterval);
  }
});
</script>

@<style>
@import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Open+Sans:wght@400;500;600;700&display=swap');

.font-pacifico {
  font-family: 'Pacifico', cursive;
}

.font-sans {
  font-family: 'Open Sans', sans-serif;
}

.form-group {
  position: relative;
  margin-bottom: 1.5rem;
}

/* Animation pour le carrousel */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* Conteneur du carrousel */
.carousel-container {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

/* Effet de verre moderne */
.glass-effect {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.dot-flashing {
  display: flex;
  align-items: center;
  position: relative;
  width: 1.2em;
  height: 1em;
}
.dot-flashing span, .dot-flashing:before, .dot-flashing:after {
  content: '';
  display: inline-block;
  width: 0.3em;
  height: 0.3em;
  margin: 0 0.1em;
  background: white;
  border-radius: 50%;
  animation: dotFlashing 1s infinite linear alternate;
  vertical-align: middle;
}
.dot-flashing:before {
  animation-delay: 0s;
}
.dot-flashing span {
  animation-delay: 0.3s;
}
.dot-flashing:after {
  animation-delay: 0.6s;
}
@keyframes dotFlashing {
  0% { opacity: 0.2; }
  50%, 100% { opacity: 1; }
}

/* Animation pour le bouton */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.hover\:animate-pulse:hover {
  animation: pulse 1.5s infinite;
}
</style>

