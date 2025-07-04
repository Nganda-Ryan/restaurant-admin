<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { fetchOrder, updateOrder } from '@/services/database'
import EventBus from '@/EventBus'
import StatCard from '@/components/Dashboard/statCards.vue'
  const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));


const isloading = ref(false)
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
  showStatus?: boolean
}

const orders = ref<Order[]>([])

const statusIcons = {
  TAKE: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
    </svg>
  `,
  COMPLETED: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
      <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684ZM13.949 13.684a1 1 0 0 0-1.898 0l-.184.551a1 1 0 0 1-.632.633l-.551.183a1 1 0 0 0 0 1.898l.551.183a1 1 0 0 1 .633.633l.183.551a1 1 0 0 0 1.898 0l.184-.551a1 1 0 0 1 .632-.633l.551-.183a1 1 0 0 0 0-1.898l-.551-.184a1 1 0 0 1-.633-.632l-.183-.551Z"/>
    </svg>
  `,
  CANCELED: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
    </svg>
  `
}

const statusColors = {
  'IN PROGRESS': BLUE,
  COMPLETED: GREEN,
  CANCELED: RED
}

const statusLabels: Record<Order['StatusCode'], string> = {
  'DRAFT': 'IN KITCHEN',
  'IN PROGRESS': 'IN PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELED: 'COMPLETED'
}

// Commandes disponibles (DRAFT ou IN PROGRESS non affichées)
const availableOrders = computed(() => {
  return orders.value.filter(order => 
    (order.StatusCode === 'DRAFT' || order.StatusCode === 'IN PROGRESS') && 
    !order.showStatus
  )
})

// Commandes en cours (prises en charge)
const takenOrders = computed(() => {
  return orders.value.filter(order => 
    order.StatusCode === 'IN PROGRESS' && order.showStatus
  )
})

// Charger l'état depuis localStorage
interface SavedOrder {
    Code: string
    StatusCode: 'DRAFT' | 'IN PROGRESS' | 'COMPLETED' | 'CANCELED'
    items: {
        Plat: {
            Title: string
        }
    }[]
    showStatus?: boolean
}

const loadState = (): void => {
    const savedOrders: string | null = localStorage.getItem('kitchenOrders')
    if (savedOrders) {
        const parsed: SavedOrder[] = JSON.parse(savedOrders)
        orders.value = parsed
    }
}

// Sauvegarder l'état dans localStorage
const saveState = () => {
  localStorage.setItem('kitchenOrders', JSON.stringify(orders.value))
}

// Prendre en charge une commande
const takeOrder = async (orderCode: string) => {
  isloading.value = true
  try {
    await updateOrder({
      Code: orderCode,
      StatusCode: 'IN PROGRESS'
    })
    
    // Mise à jour locale
    const order = orders.value.find(o => o.Code === orderCode)
    if (order) {
      order.StatusCode = 'IN PROGRESS'
      order.showStatus = true
    }
    
    saveState()
    
    EventBus.emit('showToast', {
      type: 'success',
      message: `Commande ${orderCode} prise en charge`
    })
  } catch (error) {
    console.error('Error taking order:', error)
    EventBus.emit('showToast', {
      type: 'error',
      message: 'Erreur lors de la prise en charge'
    })
  } finally {
    isloading.value = false
  }
}

// Mise à jour du statut
const updateStatus = async (orderCode: string, newStatus: 'COMPLETED' | 'CANCELED') => {
  isloading.value = true
  try {
    await updateOrder({
      Code: orderCode,
      StatusCode: newStatus
    })
    
    // Mise à jour locale
    const order = orders.value.find(o => o.Code === orderCode)
    if (order) {
      order.StatusCode = newStatus
    }
    
    saveState()
    
    EventBus.emit('showToast', {
      type: 'success',
      message: `Statut mis à jour pour la commande ${orderCode}`
    })
  } catch (error) {
    console.error('Error updating status:', error)
    EventBus.emit('showToast', {
      type: 'error',
      message: 'Erreur lors de la mise à jour du statut'
    })
  } finally {
   isloading.value = false
  }
}
const draftCount = computed(() => orders.value.filter(o => o.StatusCode === 'DRAFT').length)
const inProgressCount = computed(() => orders.value.filter(o => o.StatusCode === 'IN PROGRESS').length)
const completedCount = computed(() => orders.value.filter(o => o.StatusCode === 'COMPLETED').length)
const canceledCount = computed(() => orders.value.filter(o => o.StatusCode === 'CANCELED').length)
onMounted(async () => {
  loadState()
  try {
    isloading.value = true;
    const result = await fetchOrder()
    // Fusionner avec les données existantes pour garder l'état showStatus
    orders.value = result.map((order:any) => {
      const existing = orders.value.find(o => o.Code === order.Code)
      return existing ? {...order, showStatus: existing.showStatus} : order
    })
    saveState()
  } catch (error) {
    console.error('Error fetching orders:', error)
  }finally {
    isloading.value = false
  }
})
</script>
<template>
  <div class="container mx-auto px-2 sm:px-4 py-2 h-full min-h-screen">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
        title="Commandes en attente" 
        :value="availableOrders.length" 
        icon="⏳" 
        color="bg-orange-100 text-orange-600"
      />
      
      <!-- Commandes en préparation (IN PROGRESS) -->
      <StatCard 
        title="En préparation" 
        :value="takenOrders.length" 
        icon="👨‍🍳" 
        color="bg-blue-100 text-blue-600"
      />
      
      <!-- Commandes terminées (COMPLETED) -->
      <StatCard 
        title="Commandes terminées" 
        :value="orders.filter(o => o.StatusCode === 'COMPLETED').length" 
        icon="✅" 
        color="bg-green-100 text-green-600"
      />
      
      <!-- Commandes annulées (CANCELED) -->
      <StatCard 
        title="Commandes annulées" 
        :value="orders.filter(o => o.StatusCode === 'CANCELED').length" 
        icon="❌" 
        color="bg-red-100 text-red-600"
      />
      </div>
    <h1 class="text-xl md:text-2xl font-bold mb-4 text-center lg:hidden">Gestion des Commandes</h1>
    
    <div class="flex flex-col xl:flex-row gap-4 h-full">
      <!-- Colonne des commandes disponibles -->
      <div class="flex-1 order-2 xl:order-1 min-h-[300px] xl:min-h-[calc(100vh-100px)] overflow-y-auto">
        <div class="bg-white rounded-lg shadow p-3 sm:p-4 h-full">
          <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-orange-600">New orders</h2>
          
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

      <!-- Colonne des commandes en préparation -->
      <div class="flex-1 order-1 xl:order-2 min-h-[300px] xl:min-h-[calc(100vh-100px)] overflow-y-auto">
        <div class="bg-white rounded-lg shadow p-3 sm:p-4 h-full">
          <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-blue-600">Orders in progress</h2>
          
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
                  class="px-2 py-1 text-[10px] sm:text-xs rounded-full font-semibold whitespace-nowrap bg-blue-300 self-start sm:self-auto"
                >
                  {{ statusLabels[order.StatusCode] ?? order.StatusCode }}
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
                  v-html="statusIcons.COMPLETED"
                  class="p-1 sm:p-2 rounded hover:bg-green-100 transition-colors"
                  @click="updateStatus(order.Code, 'COMPLETED')"
                  title="Marquer comme terminé"
                />
                <button
                  v-html="statusIcons.CANCELED"
                  class="p-1 sm:p-2 rounded hover:bg-red-100 transition-colors"
                  @click="updateStatus(order.Code, 'CANCELED')"
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

