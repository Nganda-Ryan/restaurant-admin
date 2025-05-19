<template>
    <div>
        <div class="flex flex-col gap-10" v-if="isViewing">

            <!-- Tableau des produits -->
            <TableOne 
                :items="titles" 
                :datas="element" 
                :options="filterOptions" 
                @view="viewProduct" 
                :filterable="true" 
                :pagination="true"
            >
                <template v-slot:headerButton>
                    <button-action 
                        @click="handleAddProduct" 
                        custom-classes="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                    >
                        Ajouter un Produit
                    </button-action>
                </template>
            </TableOne>
        </div>
            <!-- Carte des mouvements de stock -->
            <div class="mt-8" v-if="isViewing">
                <h3 class="text-xl font-semibold mb-4">Mouvements Recent</h3>
                <div class="bg-white rounded-lg shadow p-4">
                    <div class="space-y-2">
                        <div class="flex justify-end items-center mt-2 my-4 text-black"> 
                            <select 
                                name="" 
                                id="" 
                                class="border border-gray-100 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-1 appearance-none focus:ring-blue-500"
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
                        <template v-for="(product, index) in visibleMovements" :key="product.name">
                            <div class="border-b last:border-b-0 pb-2">
                                <!-- Ligne principale -->
                                <div 
                                    class="flex items-center justify-between p-2 hover:bg-gray-50 mt-2 rounded cursor-pointer"
                                    @click="toggleProduct(product.name)"
                                >
                                    <div class="flex items-center gap-3">
                                        <!-- Flèche style Orange Money -->
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
                                        <div>
                                            <p class="font-medium">{{ product.name }}</p>
                                            <p class="text-xs text-gray-500">
                                                Dernier mouvement: {{ formatDate(getLatestMovement(product.name).date) }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="font-semibold"
                                            :class="getLatestMovement(product.name).type === 'entry' ? 'text-green-600' : 'text-rouge-fonce2'">
                                            {{ getLatestMovement(product.name).type === 'entry' ? '+' : '-' }}{{ getLatestMovement(product.name).quantity }}
                                        </p>
                                        <span class="text-xs text-gray-500 capitalize">
                                            {{ getLatestMovement(product.name).type === 'entry' ? 'Entrée' : 'Sortie' }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Menu déroulant -->
                                <div v-if="expandedProducts.includes(product.name)" class="ml-11 mt-2 space-y-2">
                                    <div 
                                        v-for="movement in product.movements" 
                                        :key="movement.id" 
                                        class="flex items-center justify-between p-0 bg-gray-50 rounded"
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
                                                <p class="text-sm">{{ formatDate(movement.date) }}</p>
                                                <p class="text-xs text-gray-500">{{ movement.type === 'entry' ? 'Entrée' : 'Sortie' }}</p>
                                            </div>
                                        </div>
                                        <p class="text-sm font-medium"
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
                        {{ showAll ? 'Show Less' : `Show All (${groupedMovements.length - 3} more)` }}
                    </button>
                </div>
            </div>
        <SpinnerOverPage v-if="isloading" />
        
        <template v-if="!isViewing">
            <NewProductForm 
                @cancel="cancel" 
                @back="cancel" 
                :action="'add'" 
                :created="handleCreate" 
            />
        </template>
    </div>
</template>

<script setup lang="ts">
    import { defineAsyncComponent, onBeforeMount, ref, computed } from 'vue'
    import ButtonAction from '@/components/Buttons/ButtonAction.vue'
    import TableOne from '@/components/Tables/TableOne.vue'
    import { fetchConfig, fetchProduct } from '@/services/database'
    import router from '@/router'
    import { useConfigStore } from '@/stores/config'
import { all } from 'axios'

    const pageTitle = 'Product'
    const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'))
    const NewProductForm = defineAsyncComponent(() => import('@/views/Stocks/NewsStocks.vue'))

    // Configuration du tableau
    const titles = ref([
    {
        name: 'Title',
        label: 'Title',
        type: 'url',
        event: "view",
        filterable: true,
    },
    {
        name: 'Description',
        type: "text",
        label: 'Description',
    },
    {
        name: 'Category',
        type: "text",
        label: 'Category',
        filterable: true,
    },
    {
        name: 'DateEntrée',
        type: "text",
        label: 'Date Entrée',
        filterable: true,
    },
    {
        name: 'AvailableQuantity',
        type: "text",
        label: 'Quantity',
        filterable: false,
    },
    {
        name: 'PrixUnitaire',
        type: "integer",
        label: 'PrixUnitaire',
        filterable: false,
    },
    {
        name: 'Total',
        type: "integer",
        label: 'Total',
        filterable: false,
    }
    ])

    const filterOptions = ref([
    {
        name: 'All',
        api: '',
    },
    {
        name: 'Name',
        api: 'name',
    },
    {
        name: 'Category',
        api: 'category',
    }
    ])

const filter = ref([
    {
        name: 'All',
        api: ''
            
    },
    {
        name: 'To day',
        api: 'today'
    },
    {
        name: 'Last day',
        api: 'lastday'
    },
    {
        name: 'This week',
        api: 'thisweek'
    },
    {
        name: 'Last week',
        api: 'lastweek'
    },    {
        name: 'This Month',
        api: 'thismonth'
    },    {
        name: 'Last Month',
        api: 'lastmonth'
    }
    ])

    // Données de test
    const element = ref([
    { id: 1, Title: 'tomates', Description: 'Tomates concentrees', Category: 'fruit',DateEntrée:'02-11-2024 10h:25',AvailableQuantity: '10', PrixUnitaire: 2, Total: 20 },
    { id: 2, Title: 'Pommes', Description: 'Pommes de terre', Category: 'fruit',DateEntrée:'24-09-2024 12h:00', AvailableQuantity: '5', PrixUnitaire: 1, Total: 5 },
    { id: 3, Title: 'Bananes', Description: 'Bananes bio', Category: 'fruit',DateEntrée:'25-08-2024 09h:30', AvailableQuantity: '8', PrixUnitaire: 3, Total: 24 },
    { id: 4, Title: 'Oranges', Description: 'Oranges sanguines', Category: 'fruit', DateEntrée:'28-06-2024 11h:20', AvailableQuantity: '12', PrixUnitaire: 4, Total: 48 },
    { id: 5, Title: 'Raisins', Description: 'Raisins secs', Category: 'fruit', DateEntrée:'14-06-2024 11h:00', AvailableQuantity: '15', PrixUnitaire: 2, Total: 30 },
    { id: 6, Title: 'Pastèques', Description: 'Pastèques sucrées', Category: 'fruit', DateEntrée:'25-01-2024 14h:00', AvailableQuantity: '20', PrixUnitaire: 5, Total: 100 }
    ])

    // Données des mouvements de stock
    const stockMovements = ref([
    { id: 1, name: 'tomates', type: 'entry', quantity: 50, date: '2024-11-02T10:25:00' },
    { id: 2, name: 'tomates', type: 'exit', quantity: 20, date: '2024-09-24T12:00:00' },
    { id: 3, name: 'Bananes', type: 'entry', quantity: 30, date: '2024-08-25T09:30:00' },
    { id: 4, name: 'Oranges', type: 'exit', quantity: 15, date: '2024-06-28T11:20:00' },
    { id: 5, name: 'Raisins', type: 'entry', quantity: 25, date: '2024-06-14T11:00:00' },
    { id: 6, name: 'Pastèques', type: 'exit', quantity: 10, date: '2024-01-25T14:00:00' },
    { id: 7, name: 'tomates', type: 'entry', quantity: 25, date: '2024-06-14T11:00:00' },
    { id: 8, name: 'Oranges', type: 'exit', quantity: 10, date: '2024-12-25T14:00:00' }
    ])

    // Gestion des menus déroulants
    const expandedProducts = ref<string[]>([])
    const showAll = ref(false)

    // Mouvements visibles (3 par défaut ou tous si showAll est true)
    const visibleMovements = computed(() => {
    return showAll.value ? groupedMovements.value : groupedMovements.value.slice(0, 3)
    })

    // Fonction pour basculer entre Show All et Show Less
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

    // Grouper les mouvements par produit
    const groupedMovements = computed(() => {
    const groups: Record<string, {name: string, movements: any[]}> = {}

    stockMovements.value.forEach(movement => {
        if (!groups[movement.name]) {
            groups[movement.name] = {
                name: movement.name,
                movements: []
            }
        }
        groups[movement.name].movements.push(movement)
    })

    // Trier les mouvements par date (du plus récent au plus ancien)
    Object.values(groups).forEach(group => {
        group.movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })

    return Object.values(groups)
    })

    // Obtenir le dernier mouvement pour un produit
    const getLatestMovement = (productName: string) => {
    const product = groupedMovements.value.find(p => p.name === productName)
    return product ? product.movements[0] : null
    }

    // Formater la date en français
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

    // Le reste de votre script original...
    const isloading = ref(false)
    const products = ref([])
    const rawProducts = ref([])
    const configStore = useConfigStore()
    const isViewing = ref(true)
    const created = ref(false)
    const selectedProduct = ref<any>()

    const fetProduct = async () => {
    isloading.value = true
    try {
        const result = await fetchProduct()
        const productList = result.map((product: any) => {
            let img = ""
            product.content.forEach((ctn: any) =>{
                if(ctn.typex.Code ==  "COVER"){
                    img = ctn.Body
                }
            })
            
            return {
                ...Object.fromEntries(Object.entries(product).filter(([key]) => key !== "content")),
                Image: img,
                AvailableQuantity: `${product.AvailableQuantity} ${product.QuantityUnitCode}`,
                Category: configStore.productCategories.filter((cat: any) => cat.Code == product.CategoryCode)[0]?.Title
            }
        })
        products.value = productList
        rawProducts.value = result
    } catch (er) {
        console.log('error', er)
    } finally {
        isloading.value = false
    }
    }

    const viewProduct = (ts: any) => {
    isViewing.value = true
    selectedProduct.value = rawProducts.value.filter((item:any) => item.Code == ts.Code)[0]
    window.location.href = `/products/${selectedProduct.value.Code}/view`
    }

    const cancel = () => {
    isViewing.value = true
    if(created.value == true){
        location.reload()
    }
    }

    const handleCreate = () => {
    created.value = true
    }

    const handleAddProduct = (e:any) => {
    isViewing.value = false
    }

    onBeforeMount(async () => {
    await fetProduct()
    })
</script>

<style scoped>
/* Animation pour le menu déroulant */
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

/* Style des flèches */
.arrow-enter {
  transform: rotate(0deg);
}
.arrow-enter-active {
  transition: transform 0.3s ease;
}
.arrow-enter-to {
  transform: rotate(-45deg);
}

/* Transition pour le bouton Show All */
.btn-transition {
    transition: all 0.2s ease;
}

.bg-rouge-clair { background-color:rgba(228, 32, 32, 0.25); }  /* Équivaut à bg-red-100 */
.text-rouge-fonce { color:rgba(232, 60, 60, 0.4); }  
.bg-rouge-clair2 { background-color:rgba(228, 32, 32, 0.14); }     /* Équivaut à text-red-800 */
.text-rouge-fonce2 { color:rgba(239, 17, 17, 0.81); }
</style>