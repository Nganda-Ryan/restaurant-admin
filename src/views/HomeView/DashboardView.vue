<template>
    <div class="restaurant-dashboard p-6">
      <!-- En-tête -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Restaurant Dashboard</h1>
        <div class="text-sm text-gray-500">
          {{ currentDate }}
        </div>
      </div>
  
      <!-- Cartes de statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Chiffre d'affaires" 
          :value="stats.revenue" 
          icon="💰" 
          color="bg-blue-100 text-blue-600"
        />
        <StatCard 
          title="Commandes de la semaine" 
          :value="DayCommande.results" 
          icon="🛒" 
          color="bg-green-100 text-green-600"
        />
        
        <StatCard 
          title="Menus" 
          :value="TotalMenu.count" 
          icon="🍽️" 
          color="bg-purple-100 text-purple-600"
        />
        <StatCard 
          title="Plat le plus populaire" 
          :value="mostPopularDish?.Title" 
          icon="🍲" 
          color="bg-orange-100 text-orange-600"
        />
      </div>
  
      <!-- Graphique et commandes récentes -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Graphique des ventes -->
        <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Ventes des 7 derniers jours</h2>
          <SalesChart :chart-data="chartData" />
        </div>
  
        <!-- Commandes récentes -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Commandes récentes</h2>
          <RecentOrders :orders="recentOrders.slice(0, 5)" />
        </div>
      </div>
  
      <!-- Plats populaires -->
      <div class="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Top 5 des plats populaires</h2>
        <div class="mt-11">
          <PopularDishes :dishes="topPopularDishes"/>
        </div>
      </div>
      <SpinnerOverPage v-if="isloading" />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted,  defineAsyncComponent } from 'vue'
  import StatCard from '@/components/Dashboard/statCards.vue'
  import SalesChart from '@/components/Dashboard/SalesChart.vue'
  import RecentOrders from '@/components/Dashboard/RecentOrders.vue'
  import PopularDishes from '@/components/Dashboard/PopularDishes.vue'
  import { fetchTotalMenu, fetchDayCommande, fetchPopularplate, fetchRecentOrder, getUser } from '@/services/database.ts'
  import { useAuthStore } from '@/stores/auth';


  const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));


  // Données statistiques
  const stats = ref({
    revenue: '2,450 €',
  })
  const isloading = ref(false)
  const TotalMenu = ref({})
  const DayCommande = ref({})
  const popularplate = ref([])
  const recentOrders = ref([])
  const authStore = useAuthStore()

  // Récupère le plat le plus populaire
  const mostPopularDish = computed(() => {
    return popularplate.value[0] || null
  })

  // Récupère le top 5 des plats populaires
  const topPopularDishes = computed(() => {
    return popularplate.value.slice(0, 5).map(dish => ({
      name: dish.Title,
      Likes:dish.Likes,
    }))
  })

  // Données pour le graphique
  const chartData = ref({
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Ventes (€)',
        data: [450, 520, 480, 620, 780, 950, 720],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      }
    ]
  })

  // Date actuelle formatée
  const currentDate = computed(() => {
    return new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  })

  // Fonctions de récupération des données
  const fetchtotalMenus = async () => {
    try {
      isloading.value = true
      const responsedata = await fetchTotalMenu()
      TotalMenu.value = responsedata
    } catch(error) {
      console.error('Erreur fetchTotalMenu:', error)
    }finally{
      isloading.value = false
    }
  }

  const fetchDayCommandes = async () => {
    try {
      isloading.value = true
      const responsedata = await fetchDayCommande()
      DayCommande.value = responsedata
      console.log('Commandes du jour:', DayCommande.value)
    } catch(error) {
      console.error('Erreur fetchDayCommande:', error)
    }finally{
      isloading.value = false
    }
  }

  const fetchPopularplates = async () => {
    try {
      isloading.value = true
      const responseData = await fetchPopularplate()
      console.log('Popular plates:', responseData)
      // Trie les plats par nombre de commandes (ordre décroissant)
      popularplate.value = responseData.results.sort((a, b) => b.orderCount - a.orderCount)
    } catch(error) {
      console.error('Erreur fetchPopularplate:', error)
    }finally{
      isloading.value = false
    }
  }
  
  const fetchRecentOrders = async () => {
    try {
      isloading.value = true
      const responsedata = await fetchRecentOrder()
      console.log('Recent orders:', responsedata)
      recentOrders.value = responsedata || []
      console.log('Commandes récentes:', recentOrders.value)
    } catch(error) {
      console.error('Erreur fetchRecentOrder:', error)
    }finally{
      isloading.value = false
    }
  }

  const fetchUser = async () => {
    try {
      const response = await getUser()
      const userData = response.user || {}
      const profileData = response.profiles || []
      // Stocke les données utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("profiles", JSON.stringify(profileData))
      console.log('Données utilisateur récupérées:', userData, profileData)
      console.log('Utilisateur:', response)
    } catch(error) {
      console.error('Erreur getUser:', error)
    }
  }
  const users = JSON.parse(localStorage.getItem("user")) || null
  const profile = JSON.parse(localStorage.getItem("profiles")) || null
  onMounted(() => {
    isloading.value = true;
    console.log('Utilisateur récupéré:', users, profile)
    fetchtotalMenus()
    fetchDayCommandes()
    fetchPopularplates()
    fetchRecentOrders()
    fetchUser()
  })
  </script>
  
  <style scoped>
  .restaurant-dashboard {
    background-color: #f8fafc;
    min-height: 100vh;
  }
  </style>