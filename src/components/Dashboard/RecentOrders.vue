<template>
    <div class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="flex items-center justify-between p-3 border-b">
        <div>
          <p class="font-medium">Commande #{{ order.Code }}</p>
          <p class="text-sm text-gray-500">Table {{ order.table }}</p>
        </div>
        <div class="text-right">
          <p class="font-semibold">{{ order.TotalPrice}} Fcfa</p>
          <span :class="statusClass(order.StatusCode)" class="text-xs px-2 py-1 rounded-full">
            {{ order.StatusCode }}
          </span>
        </div>
      </div>
      <button  @click="navigateToDashboard" class="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
        Voir toutes les commandes →
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
      case 'DONE': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'Payé': return 'bg-blue-100 text-blue-800'
      case 'DRAFT': return 'bg-rouge-clair  .text-rouge-fonce'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  
const navigateToDashboard = () => {
  router.push('/commande-list')
}
</script>

<style >

    .bg-rouge-clair { background-color: #ff8c8c; }  /* Équivaut à bg-red-100 */
    .text-rouge-fonce { color: #991b1b; }           /* Équivaut à text-red-800 */

</style>