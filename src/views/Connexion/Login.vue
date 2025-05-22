<template>
  <div class="min-h-screen bg-[rgb(18,112,134)] flex flex-col items-center font-sans p-4">
    <!-- Contenu principal -->
    <div class="flex-1 flex flex-col items-center justify-center w-full">
      <h1 class="text-white text-4xl font-pacifico mb-10">Online Food World</h1>
      
      <!-- Formulaire -->
      <div class="flex flex-col md:flex-row bg-white shadow-[10px_10px_15px_-5px_rgba(255,255,255,0.7)] overflow-hidden w-full max-w-4xl">
        <!-- Image Section -->
        <div class="flex-1 p-8 md:p-12 md:w-2/5 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
            alt="Delicious Burger"
            class="rounded-lg w-full h-auto max-h-80 object-cover"
          />
        </div>

        <!-- Form Section -->
        <div class="flex-1 p-8 md:p-12 md:w-3/5">
          <h2 class="text-[rgb(235,102,102)] text-3xl md:text-[35px] font-pacifico mb-[50px] text-center">Login In !</h2>
          
          <form @submit.prevent="submitForm" class="space-y-6 w-full max-w-sm mx-auto">
            <div class="form-group">
              <input
                type="text"
                v-model="name"
                placeholder="Name"
                class="border-b-[1px] border-gray-300 focus:border-[rgb(235,102,102)] outline-none p-2 w-full mb-2 transition duration-300"
                required
              />
            </div>

            <div class="form-group">
              <input
                type="email"
                v-model="email"
                placeholder="Email"
                class="border-b-[1px] border-gray-300 focus:border-[rgb(235,102,102)] outline-none p-2 w-full mb-2 transition duration-300"
                required
              />
            </div>

            <div class="form-group relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="Password"
                class="border-b-[1px] border-gray-300 focus:border-[rgb(235,102,102)] outline-none p-2 w-full pr-10 mb-2 transition duration-300"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <span v-if="showPassword">👁️</span>
                <span v-else>👁️‍🗨️</span>
              </button>
            </div>

            <button
              type="submit"
              class="bg-[rgb(235,102,102)] text-white px-6 py-3 rounded-full hover:bg-[rgb(235,68,68)] transition w-full font-medium shadow-md hover:shadow-lg"
            >
             Connexion
            </button>
          </form>
        </div>
      </div>
    </div>

        
      <!--   <div class="w-full max-w-8xl flex hidden lg:flex justify-between mt-auto">
      <div class="ml-4 h-32 flex items-end "> 
        <svg xmlns="http://www.w3.org/2000/svg" width="190" height="400" fill="#FFFFFF" class="bi bi-fork-knife" viewBox="0 0 16 16" preserveAspectRatio="none">
          <path d="M13 .5c0-.276-.226-.506-.498-.465-1.703.257-2.94 2.012-3 8.462a.5.5 0 0 0 .498.5c.56.01 1 .13 1 1.003v5.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5zM4.25 0a.25.25 0 0 1 .25.25v5.122a.128.128 0 0 0 .256.006l.233-5.14A.25.25 0 0 1 5.24 0h.522a.25.25 0 0 1 .25.238l.233 5.14a.128.128 0 0 0 .256-.006V.25A.25.25 0 0 1 6.75 0h.29a.5.5 0 0 1 .498.458l.423 5.07a1.69 1.69 0 0 1-1.059 1.711l-.053.022a.92.92 0 0 0-.58.884L6.47 15a.971.971 0 1 1-1.942 0l.202-6.855a.92.92 0 0 0-.58-.884l-.053-.022a1.69 1.69 0 0 1-1.059-1.712L3.462.458A.5.5 0 0 1 3.96 0z"/>
        </svg>
      </div>
      
      <div class="mr-4 h-32 flex items-end"> 
        <svg xmlns="http://www.w3.org/2000/svg" width="190" height="400" fill="#FFFFFF" class="bi bi-fork-knife" viewBox="0 0 16 16" preserveAspectRatio="none">
          <path d="M13 .5c0-.276-.226-.506-.498-.465-1.703.257-2.94 2.012-3 8.462a.5.5 0 0 0 .498.5c.56.01 1 .13 1 1.003v5.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5zM4.25 0a.25.25 0 0 1 .25.25v5.122a.128.128 0 0 0 .256.006l.233-5.14A.25.25 0 0 1 5.24 0h.522a.25.25 0 0 1 .25.238l.233 5.14a.128.128 0 0 0 .256-.006V.25A.25.25 0 0 1 6.75 0h.29a.5.5 0 0 1 .498.458l.423 5.07a1.69 1.69 0 0 1-1.059 1.711l-.053.022a.92.92 0 0 0-.58.884L6.47 15a.971.971 0 1 1-1.942 0l.202-6.855a.92.92 0 0 0-.58-.884l-.053-.022a1.69 1.69 0 0 1-1.059-1.712L3.462.458A.5.5 0 0 1 3.96 0z"/>
        </svg>
      </div>
      </div> -->
  </div>
</template>

<script setup>
import { ref } from 'vue';

const name = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);

function submitForm() {
  console.log("User info:", name.value, email.value, password.value);
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Open+Sans:wght@400;500;600&display=swap');

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
</style>