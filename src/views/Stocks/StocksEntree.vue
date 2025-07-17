<template>
    <div class="mt-8">
        <!-- Cartes des produits avec quantités -->
        <div v-if="isViewing" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
            <div 
                v-for="(product) in visibleProducts" 
                :key="product.name"
                class="rounded-lg shadow py-2 px-3 max-w-full border-l-4"
                :class="{
                    'bg-red-100 text-red-600': product.quantity <= 10,
                    'bg-orange-100 text-orange-600': product.quantity > 10 && product.quantity <= 30
                }"
            >
                <div class="flex items-center justify-between">
                    <h4 class="font-medium text-sm sm:text-base truncate">{{ product.name }}</h4>
                </div>
                <div class="text-xs sm:text-sm text-gray-600">
                    <p>Quantité: {{ product.quantity }}</p>
                </div>
            </div>
        </div>

        <!-- Bouton pour afficher/masquer les produits supplémentaires -->
        <div v-if="filteredProducts.length > 7 && isViewing" class="flex justify-center mt-4">
            <button 
                @click="toggleShowAllProducts"
                class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
                {{ showAllProducts ? 'Afficher moins' : `Tout afficher` }}
            </button>
        </div>

        <!-- Carte des mouvements de stock -->
        <div class="mt-8" v-if="isViewing">
            <h3 class="text-lg sm:text-xl font-semibold mb-4">Mouvements Récents</h3>
            <div class="bg-white rounded-lg shadow p-2 sm:p-4">
                <div class="space-y-2">
                    <div class="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center gap-3 mt-2 my-4 text-black">
                        <!-- Select Filter - maintenant en premier dans l'ordre mobile -->
                        <div class="w-full sm:w-auto">
                            <select 
                                v-model="selectedFilter"
                                class="w-full border appearance-none border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm sm:text-base"
                            >
                                <option 
                                    v-for="filt in filter" 
                                    :key="filt.api" 
                                    :value="filt.api"
                                >
                                    {{ filt.name }}
                                </option>
                            </select>
                        </div>

                        <!-- Menu Actions - maintenant en second dans l'ordre mobile -->
                        <div class="w-full sm:w-auto relative inline-block text-left">
                            <button-action 
                                @click="toggleMenu"
                                custom-classes="teal-btn"
                                class="flex items-center justify-between gap-2 w-full sm:w-auto"
                            >
                                <span>Actions</span>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200" 
                                    :class="{'transform rotate-180': isMenuOpen}" 
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </button-action>

                            <!-- Menu déroulant amélioré -->
                            <transition
                                enter-active-class="transition duration-100 ease-out"
                                enter-from-class="transform scale-95 opacity-0"
                                enter-to-class="transform scale-100 opacity-100"
                                leave-active-class="transition duration-75 ease-in"
                                leave-from-class="transform scale-100 opacity-100"
                                leave-to-class="transform scale-95 opacity-0"
                            >
                                <div 
                                    v-if="isMenuOpen"
                                    class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-gray-200 focus:outline-none z-10 overflow-hidden"
                                    v-click-outside="() => isMenuOpen = false"
                                >
                                    <div class="py-1 space-y-1">
                                        <button 
                                            @click="handleAddProduct"
                                            class="flex items-center w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors text-teal-600 hover:text-teal-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Ajouter une entrée
                                        </button>
                                        <RouterLink 
                                            to="/Stocks-exit" 
                                            class="flex items-center px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors text-rose-600 hover:text-rose-800"
                                            @click="isMenuOpen = false"
                                        >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="red" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 12h16" />
                                        </svg>
                                            Voir les sorties
                                        </RouterLink>
                                    </div>
                                </div>
                            </transition>
                        </div>
                    </div>
                    
                    <template v-for="product in filteredMovements" :key="product.name">
                        <div class="border-b last:border-b-0 pb-2">
                            <!-- Ligne principale -->
                            <div 
                                class="flex items-center justify-between p-2 hover:bg-gray-50 mt-2 rounded cursor-pointer"
                                @click="toggleProduct(product.name)"
                            >
                                <div class="flex items-center gap-3">
                                    <!-- Icône d'entrée/sortie -->
                                    <div class="h-8 w-8 rounded-full flex items-center justify-center"
                                        :class="getLatestMovement(product.name).type === 'entry' ? 'bg-green-100' : 'bg-rouge-clair'">
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            viewBox="0 0 20 20" 
                                            fill="currentColor"
                                            class="w-5 h-5"
                                            :class="getLatestMovement(product.name).type === 'entry' ? 'text-green-600 transform rotate-90' : 'text-rouge-fonce transform -rotate-90'"
                                        >
                                            <path fill-rule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <div class="min-w-0">
                                        <p class="font-medium truncate text-sm sm:text-base">{{ product.name }}</p>
                                        <p class="text-xs text-gray-500">
                                            Dernier mouvement: {{ formatDate(getLatestMovement(product.name).date) }}
                                        </p>
                                    </div>
                                </div>
                                <div class="text-right min-w-[70px]">
                                    <p class="font-semibold text-sm sm:text-base"
                                        :class="getLatestMovement(product.name).type === 'entry' ? 'text-green-600' : 'text-rouge-fonce2'">
                                        {{ getLatestMovement(product.name).type === 'entry' ? '+' : '-' }}{{ getLatestMovement(product.name).quantity }}
                                    </p>
                                    <span class="text-xs text-gray-500 capitalize">
                                        {{ getLatestMovement(product.name).type === 'entry' ? 'Entrée' : 'Sortie' }}
                                    </span>
                                </div>
                            </div>

                            <!-- Détails des mouvements -->
                            <div v-if="expandedProducts.includes(product.name)" class="ml-11 mt-2 space-y-2">
                                <div 
                                    v-for="movement in product.movements" 
                                    :key="movement.id" 
                                    class="flex items-center justify-between p-2 bg-gray-50 rounded"
                                >
                                    <div class="flex items-center gap-3">
                                        <div class="h-6 w-6 rounded-full flex items-center justify-center"
                                            :class="movement.type === 'entry' ? 'bg-green-50' : 'bg-rouge-clair2'">
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                viewBox="0 0 20 20" 
                                                fill="currentColor"
                                                class="w-4 h-4"
                                                :class="movement.type === 'entry' ? 'text-green-500 transform rotate-90' : 'text-rouge-fonce transform -rotate-90'"
                                            >
                                                <path fill-rule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clip-rule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-xs sm:text-sm">{{ formatDate(movement.date) }}</p>
                                            <p class="text-xs text-gray-500">{{ movement.type === 'entry' ? 'Entrée' : 'Sortie' }}</p>
                                        </div>
                                    </div>
                                    <p class="text-xs sm:text-sm font-medium"
                                        :class="movement.type === 'entry' ? 'text-green-600' : 'text-rouge-fonce2'">
                                        {{ movement.type === 'entry' ? '+' : '-' }}{{ movement.quantity }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
                
                <!-- Bouton Show All/Show Less -->
                <button 
                    v-if="groupedMovements.length > 3"
                    @click="toggleShowAll"
                    class="w-full mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium text-center transition-colors duration-200"
                >
                    {{ showAll ? 'Voir moins' : `Voir plus` }}
                </button>
            </div>
        </div>

        <SpinnerOverPage v-if="isloading" />
        
        <!-- Formulaire d'ajout -->
        <template v-if="!isViewing">
            <NewProductForm 
                @cancel="cancel" 
                @back="cancel" 
                :action="'add'" 
                @created="handleCreate" 
            />
        </template>
    </div>
</template>


<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref, computed } from 'vue'
import ButtonAction from '@/components/Buttons/ButtonAction.vue'
import { fetchStocks } from '@/services/database'
import { useConfigStore } from '@/stores/config'

const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'))
const NewProductForm = defineAsyncComponent(() => import('@/views/Stocks/NewsStocks.vue'))

// Store et état
const configStore = useConfigStore()
const isloading = ref(false)
const isViewing = ref(true)
const created = ref(false)
const expandedProducts = ref<string[]>([])
const showAll = ref(false)
const selectedFilter = ref('')
const stockData = ref<any>({})
const showAllProducts = ref(false)
const maxVisibleProducts = ref(7)



// Filtres
const filter = ref([
    { name: 'ALL', api: '' },
    { name: 'Today', api: 'today' },
    { name: 'Lastday', api: 'lastday' },
    { name: 'Thisweek', api: 'thisweek' },
    { name: 'lastweek', api: 'lastweek' },
    { name: 'Thismonth', api: 'thismonth' },
    { name: 'lastmonth', api: 'lastmonth'}
])

// Produits filtrés (quantité <= 30)
const filteredProducts = computed(() => {
    if (!stockData.value.dashboard?.results) return []
    
    return stockData.value.dashboard.results
        .map((product: any) => ({
            name: product.Title,
            quantity: product.AvailableQuantity
        }))
        .filter((p: any) => p.quantity !== undefined && p.quantity <= 30)
        .sort((a:any, b:any) => a.quantity - b.quantity)
})

// Produits visibles (limités à 7 par défaut)
const visibleProducts = computed(() => {
    return showAllProducts.value 
        ? filteredProducts.value 
        : filteredProducts.value.slice(0, 7)
})

// Basculer l'affichage de tous les produits
const toggleShowAllProducts = () => {
    showAllProducts.value = !showAllProducts.value
}

// Mouvements de stock groupés par produit
const groupedMovements = computed(() => {
    if (!stockData.value.entries?.results) return []
    
    const groups: Record<string, {name: string, movements: any[]}> = {}

    stockData.value.entries.results.forEach((movement: any) => {
        const productName = movement.product.Title || movement.ProductCode
        
        if (!groups[productName]) {
            groups[productName] = {
                name: productName,
                movements: []
            }
        }
        
        groups[productName].movements.push({
            id: movement.Id,
            date: movement.UpdatedOn,
            type: movement.ActionCode === 'ADD' ? 'entry' : 'exit',
            quantity: movement.Quantity,
            productCode: movement.ProductCode
        })
    })

    // Trier les mouvements par date
    Object.values(groups).forEach(group => {
        group.movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })

    return Object.values(groups)
})

// Mouvements filtrés
const filteredMovements = computed(() => {
    const movements = showAll.value ? groupedMovements.value : groupedMovements.value.slice(0, 6)
    
    if (!selectedFilter.value) return movements
    
    const now = new Date()
    let fromDate = new Date()
    
    switch (selectedFilter.value) {
        case 'today':
            fromDate.setHours(0, 0, 0, 0)
            break
        case 'lastday': {
            fromDate.setDate(fromDate.getDate() - 1)
            fromDate.setHours(0, 0, 0, 0)
            const toDate = new Date(fromDate)
            toDate.setHours(23, 59, 59, 999)
            return filterByDateRange(fromDate, toDate)
        }
        case 'thisweek':
            fromDate.setDate(fromDate.getDate() - fromDate.getDay())
            fromDate.setHours(0, 0, 0, 0)
            break
        case 'lastweek': {
            fromDate.setDate(fromDate.getDate() - 7 - fromDate.getDay())
            fromDate.setHours(0, 0, 0, 0)
            const toDateLastWeek = new Date(fromDate)
            toDateLastWeek.setDate(toDateLastWeek.getDate() + 6)
            toDateLastWeek.setHours(23, 59, 59, 999)
            return filterByDateRange(fromDate, toDateLastWeek)
        }
        case 'thismonth':
            fromDate.setDate(1)
            fromDate.setHours(0, 0, 0, 0)
            break
        case 'lastmonth': {
            fromDate.setMonth(fromDate.getMonth() - 1, 1)
            fromDate.setHours(0, 0, 0, 0)
            const toDateLastMonth = new Date(fromDate)
            toDateLastMonth.setMonth(toDateLastMonth.getMonth() + 1, 0)
            toDateLastMonth.setHours(23, 59, 59, 999)
            return filterByDateRange(fromDate, toDateLastMonth)
        }
    }
    
    return movements.filter(product => 
        product.movements.some((m: any) => new Date(m.date) >= fromDate)
)})

function filterByDateRange(from: Date, to: Date) {
    return groupedMovements.value.map(product => {
        const filteredMovements = product.movements.filter((m: any) => {
            const date = new Date(m.date)
            return date >= from && date <= to
        })
        return { ...product, movements: filteredMovements }
    }).filter(product => product.movements.length > 0)
}

// Obtenir le dernier mouvement pour un produit
const getLatestMovement = (productName: string) => {
    const product = groupedMovements.value.find(p => p.name === productName)
    return product?.movements?.[0] || { 
        date: new Date().toISOString(), 
        type: 'entry', 
        quantity: 0 
    }
}

// Formater la date
const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('fr-FR', options)
}

// Interactions
const toggleShowAll = () => {
    showAll.value = !showAll.value
}

const toggleProduct = (productName: string) => {
    const index = expandedProducts.value.indexOf(productName)
    if (index > -1) {
        expandedProducts.value.splice(index, 1)
    } else {
        expandedProducts.value.push(productName)
    }
}

// Chargement des données
const fetchStockData = async () => {
    isloading.value = true
    try {
        const result = await fetchStocks()
        stockData.value = result
        console.log('Stock data fetched:', stockData.value)
    } catch (error) {
        console.error('Erreur lors du chargement des stocks:', error)
    } finally {
        isloading.value = false
    }
}

// Gestion du formulaire
const handleAddProduct = () => {
    isViewing.value = false
    isMenuOpen.value = false
}
// Ajoutez cette variable pour gérer l'état du menu
const isMenuOpen = ref(false)

// Ajoutez cette fonction pour basculer le menu
const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
}
const cancel = () => {
    isViewing.value = true
    if (created.value) {
        fetchStockData()
        created.value = false
    }
}

const handleCreate = () => {
    created.value = true
}

onMounted(async () => {
    isloading.value = true;
    await fetchStockData()
})
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.bg-rouge-clair { background-color: rgba(228, 32, 32, 0.25); }
.text-rouge-fonce { color: rgba(232, 60, 60, 0.4); }  
.bg-rouge-clair2 { background-color: rgba(228, 32, 32, 0.14); }
.text-rouge-fonce2 { color: rgba(239, 17, 17, 0.81); }

.origin-top-right {
    transform-origin: top right;
}

/* Style pour les icônes */
svg {
    flex-shrink: 0;
}
</style>