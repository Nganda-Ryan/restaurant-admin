<template>
  <div class="restaurant-dashboard p-6 bg-[#f8fafc] dark:bg-slate-800">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-slate-200">{{ t('dashboard.title') }}</h1>
      <div class="text-sm text-gray-500 dark:text-slate-400">
        {{ currentDate }}
      </div>
    </div>

    <!-- Statistics cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        :title="t('dashboard.statistics.revenue')" 
        :value="stats.revenue" 
        icon="💰" 
        color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
      />
      <StatCard 
        :title="t('dashboard.statistics.weekly_orders')" 
        :value="DayCommande.results" 
        icon="🛒" 
        color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
      />
      <StatCard 
        :title="t('dashboard.statistics.menus')" 
        :value="TotalMenu.count" 
        icon="🍽️" 
        color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300"
      />
      <StatCard 
        :title="t('dashboard.statistics.popular_dish')" 
        :value="mostPopularDish?.Title" 
        icon="🍲" 
        color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300"
      />
    </div>

    <!-- Chart and recent orders -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sales chart -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-slate-700/50">
        <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-slate-200">{{ t('dashboard.sales_chart.title') }}</h2>
        <div class="dark:bg-slate-700/30 p-4 rounded">
          <SalesChart :chart-data="chartData" />
        </div>
      </div>

      <!-- Recent orders -->
      <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-slate-700/50">
        <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-slate-200">{{ t('dashboard.recent_orders.title') }}</h2>
        <div class="dark:bg-slate-700/30 p-4 rounded">
          <RecentOrders :orders="recentOrders.slice(0, 5)" />
        </div>
      </div>
    </div>

    <!-- Popular dishes -->
    <div class="mt-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-slate-700/50">
      <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-slate-200">{{ t('dashboard.popular_dishes.title') }}</h2>
      <div class="mt-11 dark:bg-slate-700/30 p-6 rounded-lg">
        <PopularDishes :dishes="topPopularDishes"/>
      </div>
    </div>

    <SpinnerOverPage v-if="isloading" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import StatCard from '@/components/Dashboard/statCards.vue'
import SalesChart from '@/components/Dashboard/SalesChart.vue'
import RecentOrders from '@/components/Dashboard/RecentOrders.vue'
import PopularDishes from '@/components/Dashboard/PopularDishes.vue'
import { fetchTotalMenu, fetchDayCommande, fetchPopularplate, fetchRecentOrder, getUser } from '@/services/database.ts'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'))

// Statistics data
const stats = ref({
  revenue: '2,450 €'
})
const isloading = ref(false)
const TotalMenu = ref({})
const DayCommande = ref({})
const popularplate = ref([])
const recentOrders = ref([])
const authStore = useAuthStore()
const _token = authStore.jwt
const restaurantCode = authStore.restaurantCode

// Computed properties
const mostPopularDish = computed(() => popularplate.value[0] || null)

const topPopularDishes = computed(() => {
  return popularplate.value.slice(0, 5).map(dish => ({
    name: dish.Title,
    Likes: dish.Likes
  }))
})

const chartData = ref({
  labels: [t('weekdays.mon'), t('weekdays.tue'), t('weekdays.wed'), t('weekdays.thu'), t('weekdays.fri'), t('weekdays.sat'), t('weekdays.sun')],
  datasets: [
    {
      label: t('dashboard.sales_chart.label'),
      data: [450, 520, 480, 620, 780, 950, 720],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2
    }
  ]
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

// Data fetching functions
const fetchtotalMenus = async () => {
  try {
    isloading.value = true
    const responsedata = await fetchTotalMenu(_token, restaurantCode)
    TotalMenu.value = responsedata
  } catch(error) {
    console.error('fetchTotalMenu error:', error)
    EventBus.emit('showToast', {
      type: 'error',
      message: t('errors.fetchTotalMenu')
    })
  } finally {
    isloading.value = false
  }
}

const fetchDayCommandes = async () => {
  try {
    isloading.value = true
    const responsedata = await fetchDayCommande(_token, restaurantCode)
    DayCommande.value = responsedata
  } catch(error) {
    console.error('fetchDayCommande error:', error)
    EventBus.emit('showToast', {
      type: 'error',
      message: t('errors.fetchDayCommande')
    })
  } finally {
    isloading.value = false
  }
}

const fetchPopularplates = async () => {
  try {
    isloading.value = true
    const responseData = await fetchPopularplate(_token, restaurantCode)
    popularplate.value = responseData.results.sort((a, b) => b.orderCount - a.orderCount)
  } catch(error) {
    console.error('fetchPopularplate error:', error)
    EventBus.emit('showToast', {
      type: 'error',
      message: t('errors.fetchPopularplate')
    })
  } finally {
    isloading.value = false
  }
}

const fetchRecentOrders = async () => {
  try {
    isloading.value = true
    const responsedata = await fetchRecentOrder(_token, restaurantCode)
    recentOrders.value = responsedata || []
  } catch(error) {
    console.error('fetchRecentOrder error:', error)
    EventBus.emit('showToast', {
      type: 'error',
      message: t('errors.fetchRecentOrder')
    })
  } finally {
    isloading.value = false
  }
}

const fetchUser = async () => {
  try {
    const response = await getUser(_token, restaurantCode)
    const userData = response.user || {}
    const profileData = response.profiles || []
    console.log('Retrieved user data:', userData, profileData)
  } catch(error) {
    console.error('getUser error:', error)
    EventBus.emit('showToast', {
      type: 'error',
      message: t('errors.getUser')
    })
  }
}

// Lifecycle hooks
onMounted(() => {
  isloading.value = true
  fetchtotalMenus()
  fetchDayCommandes()
  fetchPopularplates()
  fetchRecentOrders()
  fetchUser()
})
</script>

<style scoped>

</style>