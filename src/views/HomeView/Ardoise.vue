<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { fetchOrder, updateOrder } from '@/services/database'
import EventBus from '@/EventBus'
import StatCard from '@/components/Dashboard/statCards.vue'
const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));

// Définition des statuts constants
const STATUS = {
  DRAFT: 'DRAFT',
  IN_PROGRESS: 'IN PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED'
};

const isloading = ref(false)
const ORANGE = 'bg-orange-300 rounded'
const BLUE = 'bg-blue-300 rounded'
const GREEN = 'bg-green-300 rounded'
const RED = 'bg-red-300 rounded'

interface Order {
  Code: string
  StatusCode: 'DRAFT' | 'IN PROGRESS' | 'COMPLETED' | 'CANCELED'
  items: {
    Plat: {
      Title: string
    }
  }[]
  CreatedDate: string
}

const orders = ref<Order[]>([])

// Configuration centralisée des statuts
const statusConfig = {
  [STATUS.DRAFT]: {
    label: 'EN ATTENTE',
    color: ORANGE,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5Z" />
          </svg>`
  },
  [STATUS.IN_PROGRESS]: {
    label: 'EN COURS',
    color: BLUE,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M13.5 4.938a7 7 0 1 1-9.006 1.737c.202-.257.59-.218.793.039.278.352.594.672.943.954.332.269.786-.049.773-.476a5.977 5.977 0 0 1 .572-2.759 6.026 6.026 0 0 1 2.486-2.665c.247-.14.55-.016.677.238A6.967 6.967 0 0 0 13.5 4.938ZM14 12a4 4 0 0 1-4 4c-1.913 0-3.52-1.398-3.91-3.182-.093-.429.44-.643.814-.413a4.043 4.043 0 0 0 1.601.564c.303.038.531-.24.51-.544a5.975 5.975 0 0 1 1.315-4.192.447.447 0 0 1 .431-.16A4.001 4.001 0 0 1 14 12Z" clip-rule="evenodd" />
          </svg>`
  },
  [STATUS.COMPLETED]: {
    label: 'TERMINÉ',
    color: GREEN,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
          </svg>`
  },
  [STATUS.CANCELED]: {
    label: 'ANNULÉ',
    color: RED,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>`
  }
}

// Rafraîchir les données depuis le serveur
const refreshData = async () => {
  isloading.value = true
  try {
    const result = await fetchOrder()
    orders.value = result
    console.log('Orders fetched:', orders.value)
  } catch (error) {
    console.error('Error fetching orders:', error)
    EventBus.emit('showToast', {
      type: 'error',
      message: 'Erreur lors du chargement des commandes'
    })
  } finally {
    isloading.value = false
  }
}

// Commandes disponibles (uniquement DRAFT)
const availableOrders = computed(() => {
  return orders.value.filter(order => order.StatusCode === STATUS.DRAFT)
})

// Commandes en cours (uniquement IN PROGRESS)
const takenOrders = computed(() => {
  return orders.value.filter(order => order.StatusCode === STATUS.IN_PROGRESS)
})

// Compteurs pour le dashboard
const counts = computed(() => {
  return {
    draft: availableOrders.value.length,
    inProgress: takenOrders.value.length,
    completed: orders.value.filter(o => o.StatusCode === STATUS.COMPLETED).length,
    canceled: orders.value.filter(o => o.StatusCode === STATUS.CANCELED).length,
    total: orders.value.length
  }
})

// Mise à jour optimiste du statut
const updateOrderStatus = (orderCode: string, newStatus: Order['StatusCode']) => {
  const index = orders.value.findIndex(o => o.Code === orderCode)
  if (index !== -1) {
    orders.value[index] = { ...orders.value[index], StatusCode: newStatus }
  }
}

// Prendre en charge une commande
const takeOrder = async (orderCode: string) => {
  // Mise à jour optimiste immédiate
  updateOrderStatus(orderCode, STATUS.IN_PROGRESS as Order['StatusCode'])
  
  try {
    await updateOrder({
      Code: orderCode,
      StatusCode: STATUS.IN_PROGRESS
    })
    // Rafraîchissement pour synchronisation
    await refreshData()
    
    EventBus.emit('showToast', {
      type: 'success',
      message: `Commande ${orderCode} prise en charge`
    })
  } catch (error) {
    // En cas d'erreur, on revert et on rafraîchit
    await refreshData()
    EventBus.emit('showToast', {
      type: 'error',
      message: 'Erreur lors de la prise en charge'
    })
  }
}

// Mise à jour du statut (terminé/annulé)
const updateStatus = async (orderCode: string, newStatus: 'COMPLETED' | 'CANCELED') => {
  // Mise à jour optimiste immédiate
  updateOrderStatus(orderCode, newStatus)
  
  try {
    await updateOrder({
      Code: orderCode,
      StatusCode: newStatus
    })
    // Rafraîchissement pour synchronisation
    await refreshData()
    
    EventBus.emit('showToast', {
      type: 'success',
      message: `Statut mis à jour pour la commande ${orderCode}`
    })
  } catch (error) {
    // En cas d'erreur, on revert et on rafraîchit
    await refreshData()
    EventBus.emit('showToast', {
      type: 'error',
      message: 'Erreur lors de la mise à jour du statut'
    })
  }
}

// Écouter les événements de mise à jour
EventBus.on('ordersUpdated', refreshData)

onMounted(async () => {
  await refreshData()
})

onUnmounted(() => {
  EventBus.off('ordersUpdated', refreshData)
})
</script>

<template>²
  <div class="container mx-auto px-2 sm:px-4 py-2 h-full min-h-screen">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Commandes en attente" 
        :value="counts.draft" 
        icon="⏳" 
        color="bg-orange-100 text-orange-600"
      />
      
      <StatCard 
        title="En préparation" 
        :value="counts.inProgress" 
        icon="👨‍🍳" 
        color="bg-blue-100 text-blue-600"
      />
      
      <StatCard 
        title="Commandes terminées" 
        :value="counts.completed" 
        icon="✅" 
        color="bg-green-100 text-green-600"
      />
      
      <StatCard 
        title="Commandes annulées" 
        :value="counts.canceled" 
        icon="❌" 
        color="bg-red-100 text-red-600"
      />
    </div>
    
    <h1 class="text-xl md:text-2xl font-bold mb-4 text-center lg:hidden">Gestion des Commandes</h1>
    
    <div class="flex flex-col xl:flex-row gap-4 h-full">
      <!-- Colonne des commandes disponibles (DRAFT) -->
      <div class="flex-1 order-2 xl:order-1 min-h-[300px] xl:min-h-[calc(100vh-100px)] overflow-y-auto">
        <div class="bg-white rounded-lg shadow p-3 sm:p-4 h-full">
          <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-orange-600">Nouvelles commandes</h2>
          
          <div v-if="availableOrders.length === 0" class="text-gray-500 text-center py-8 text-sm sm:text-base">
            Aucune nouvelle commande
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-2 sm:gap-3">
            <div 
              v-for="order in availableOrders" 
              :key="order.Code"
              class="border border-gray-200 rounded-lg p-2 sm:p-3 transition-all hover:shadow-md"
            >
              <div class="flex justify-between items-center mb-1 sm:mb-2">
                <h3 class="font-semibold text-xs sm:text-sm md:text-base">Commande #{{ order.Code }}</h3>
              </div>

              <ul class="space-y-1 mb-2 sm:mb-3 max-h-[100px] overflow-y-auto">
                <li 
                  v-for="(item, index) in order.items" 
                  :key="index"
                  class="text-xs sm:text-sm truncate"
                >
                  {{ item.Plat.Title }}
                </li>
              </ul>

              <div class="flex justify-end pt-2 border-t">
                <button
                  @click="takeOrder(order.Code)"
                  class="p-1 sm:p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                  title="Prendre en charge"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 sm:w-5 sm:h-5">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne des commandes en préparation (IN PROGRESS) -->
      <div class="flex-1 order-1 xl:order-2 min-h-[300px] xl:min-h-[calc(100vh-100px)] overflow-y-auto">
        <div class="bg-white rounded-lg shadow p-3 sm:p-4 h-full">
          <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-blue-600">Commandes en cours</h2>
          
          <div v-if="takenOrders.length === 0" class="text-gray-500 text-center py-8 text-sm sm:text-base">
            Aucune commande en préparation
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 2xl:grid-cols-1 gap-2 sm:gap-3">
            <div 
              v-for="order in takenOrders" 
              :key="order.Code"
              class="border border-blue-300 rounded-lg p-2 sm:p-3 transition-all hover:shadow-md"
            >
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 sm:mb-2 gap-1">
                <h3 class="font-semibold text-xs sm:text-sm md:text-base">Commande #{{ order.Code }}</h3>
                <span 
                  class="px-2 py-1 text-[10px] sm:text-xs rounded-full font-semibold whitespace-nowrap bg-blue-300"
                >
                  {{ statusConfig[order.StatusCode].label }}
                </span>
              </div>

              <ul class="space-y-1 mb-2 sm:mb-3 max-h-[100px] overflow-y-auto">
                <li 
                  v-for="(item, index) in order.items" 
                  :key="index"
                  class="text-xs sm:text-sm truncate"
                >
                  {{ item.Plat.Title }}
                </li>
              </ul>

              <div class="flex justify-end space-x-1 sm:space-x-2 pt-2 border-t">
                <button
                  v-html="statusConfig[STATUS.COMPLETED].icon"
                  class="p-1 sm:p-2 rounded hover:bg-green-100 transition-colors"
                  @click="updateStatus(order.Code, STATUS.COMPLETED as 'COMPLETED')"
                  title="Marquer comme terminé"
                />
                <button
                  v-html="statusConfig[STATUS.CANCELED].icon"
                  class="p-1 sm:p-2 rounded hover:bg-red-100 transition-colors"
                  @click="updateStatus(order.Code, STATUS.CANCELED as 'CANCELED')"
                  title="Annuler la commande"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <SpinnerOverPage v-if="isloading" />
  </div>
</template>