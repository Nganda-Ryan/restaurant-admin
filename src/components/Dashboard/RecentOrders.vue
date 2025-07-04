<template>
  <div class="space-y-3 md:space-y-4">
    <div v-for="order in orders" :key="order.id" class="flex flex-nowrap items-center justify-between p-3 border-b gap-2">
      <div class="min-w-0 flex-1 truncate">
        <p class="font-medium truncate">{{ order.Code }}</p>
        <p class="text-sm text-gray-500 truncate">Table {{ order.table }}</p>
      </div>
      <div class="flex-shrink-0 ml-2 flex items-center">
        <!-- <p class="font-semibold mr-2">{{ order.TotalPrice}}</p> -->
        <span :class="statusClass(order.StatusCode)" class="text-xs px-2 py-1 rounded-full whitespace-nowrap">
          {{ order.StatusCode }}
        </span>
      </div>
    </div>
    <button @click="navigateToDashboard" class="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
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
  switch(status) {
    case 'CANCELED': return 'bg-red-300 text-red-800'
    case 'IN PROGRESS': return 'bg-blue-300 text-blue-800'
    case 'COMPLETED': return 'bg-green-300 text-green-800'
    case 'DRAFT': return 'bg-orange-300 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const navigateToDashboard = () => {
  router.push('/commande-list')
}
</script>

<style scoped>
/* Classes utilitaires supplémentaires si nécessaire */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Espacement minimum entre les éléments */
.gap-2 {
  gap: 0.5rem;
}

/* Pour les très petits écrans */
@media (max-width: 360px) {
  .text-xs {
    font-size: 0.65rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>