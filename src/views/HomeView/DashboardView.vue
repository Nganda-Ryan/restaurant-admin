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
          :value="DayCommande.count" 
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
          title="Plats populaires" 
          :value="popularplate.Title" 
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
          <RecentOrders :orders="recentOrders" />
        </div>
      </div>
  
      <!-- Plats populaires -->
      <div class="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Plats les plus populaires</h2>
        <PopularDishes :dishes="popularDishes" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import StatCard from '@/components/Dashboard/StatCard.vue'
  import SalesChart from '@/components/Dashboard/SalesChart.vue'
  import RecentOrders from '@/components/Dashboard/RecentOrders.vue'
  import PopularDishes from '@/components/Dashboard/PopularDishes.vue'
  import { fetchTotalMenu, fetchDayCommande, fetchPopularplate, fetchRecentOrder,getUser} from '@/services/database.ts'
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { currentToken, decodedToken } = storeToRefs(authStore);

// Pour forcer l'affichage dans la console
console.log('TOKEN COMPLET:', currentToken.value);
console.log('TOKEN DÉCODÉ:', decodedToken.value);
  
  // Données statistiques
  const stats = ref({
    revenue: '2,450 €',
  })

  const TotalMenu= ref({})
  const DayCommande = ref({})
  const popularplate = ref({})
  const recentOrders = ref({})

  const fetchtotalMenus = async () =>{
  try{
    const responsedata = await fetchTotalMenu()
    TotalMenu.value = responsedata
    console.log('totalMenu:', TotalMenu)
  }catch(error){
    console.log('fetchtotalmenu', error)
  }
 }

 const fetchDayCommandes = async () =>{
  try{
    const responsedata = await fetchDayCommande()
    DayCommande.value = responsedata
    console.log('totalMenu:', TotalMenu)
  }catch(error){
    console.log('fetchtotalmenu', error)
  }
 }

  const popularplates = async () =>{
  try{
    const responsedata = await fetchPopularplate()
    popularplate.value = responsedata
    console.log('popularplate:', popularplates)
  }catch(error){
    console.log('fetchpopularPlate', error)
  }
 }
  
  const recentOder = async () =>{
  try{
    const responsedata = await fetchRecentOrder()
    recentOrders.value = responsedata
    console.log('recentOrders:', recentOrders)
  }catch(error){
    console.log('recentOrders', error)
  }
 }
  // Plats populaires
  const popularDishes = ref([
    { name: 'Poulet rôti', orders: 24, revenue: '288 €' },
    { name: 'Pizza Margherita', orders: 18, revenue: '216 €' },
    { name: 'Salade César', orders: 15, revenue: '120 €' },
    { name: 'Pâtes Carbonara', orders: 12, revenue: '144 €' },
    { name: 'Tiramisu', orders: 10, revenue: '60 €' }
  ])
  
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

  const fetchuser = async () =>{
    try{
      const response = await getUser()
      console.log('-->getuser:',response)
    }catch(error){
      console.log('getuser', error)
    }
  }
  
  // Date actuelle formatée
  const currentDate = computed(() => {
    return new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  })

onMounted(() => {
  fetchtotalMenus()
  fetchDayCommandes()
  popularplates()
  recentOder()
  fetchuser()
})
  </script>
  
  <style scoped>
  .restaurant-dashboard {
    background-color: #f8fafc;
    min-height: 100vh;
  }
  </style>