<template>
  <div class="space-y-3 md:space-y-4 rounded-sm bg-white shadow-default dark:bg-boxdark p-4">
    <div 
      v-for="order in orders" 
      :key="order.id" 
      class="flex flex-nowrap items-center justify-between p-3 border-b border-gray-200 dark:border-slate-700 gap-2 hover:bg-teal-50 dark:hover:bg-slate-700"
    >
      <div class="min-w-0 flex-1 truncate">
        <p class="font-medium truncate text-gray-800 dark:text-slate-200">{{ order.Code }}</p>
        <p class="text-sm text-gray-500 dark:text-slate-400 truncate">Table {{ order.table }}</p>
      </div>
      <div class="flex-shrink-0 ml-2 flex items-center">
        <span :class="statusClass(order.StatusCode)" class="text-xs px-2 py-1 rounded-full whitespace-nowrap">
          {{ order.StatusCode }}
        </span>
      </div>
    </div>
    <button 
      @click="navigateToDashboard" 
      class="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
    >
      {{ $t('phrase2') }} →
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  orders: Array
})

const statusClass = (status) => {
  const baseClasses = 'text-xs px-2 py-1 rounded-full whitespace-nowrap'
  switch(status) {
    case 'CANCELED': 
      return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`
    case 'IN PROGRESS': 
      return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`
    case 'COMPLETED': 
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`
    case 'DRAFT': 
      return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300`
    default: 
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`
  }
}

const navigateToDashboard = () => {
  router.push('/commande-list')
}
</script>

<style scoped>
/* Conservez vos styles existants */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gap-2 {
  gap: 0.5rem;
}

@media (max-width: 360px) {
  .text-xs {
    font-size: 0.65rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>