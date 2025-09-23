<template>
  <div class="grid grid-cols-1 gap-12 sm:grid-cols-1">
    <div v-if="isViewing" class="flex flex-col gap-9">
      <DefaultCard cardTitle="list of product releases">
        <template v-slot:button>
          <button class="flex items-center" @click="goBack">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span class="text-nowrap ml-2">Back</span>
          </button>
        </template>
        <template v-slot:header>
          <div class="flex items-center justify-center">
            <button-action @click='handleAddProduct' custom-classes="teal-btn">New Exit</button-action>
          </div>
        </template>

        <div class="p-6.5">
          <div v-if="productlist.length === 0" class="flex flex-col items-center justify-center py-12 px-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none" class="mb-6">
              <rect x="30" y="60" width="100" height="70" rx="4" fill="#E5E7EB" fill-opacity="0.5" stroke="#9CA3AF" stroke-width="1.5"/>
              <path d="M30 60L80 30L130 60" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M50 80H110M50 95H110M50 110H110" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="4 4"/>
              <path d="M80 45V15M80 15L70 25M80 15L90 25" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
              <ellipse cx="80" cy="135" rx="30" ry="5" fill="#000000" fill-opacity="0.05"/>
            </svg>
            <h3 class="text-xl font-medium text-gray-600 mb-2">Aucune sortie enregistrée</h3>
            <p class="text-gray-500 mb-6 text-center max-w-md">
              Vous n'avez effectué aucune sortie de stock pour le moment.
            </p>
            <button-action 
              @click="handleAddProduct" 
              class="text-green-700"
            >
              + New Exit
            </button-action>
          </div>
          
          <div v-for="(stock, index) in productlist" :key="stock.Id" class="mb-6 relative">
            <div class="flex items-center gap-4 w-full"> 
              <div class="flex-1">
                <div v-if="!stock.editing" class="flex flex-col">
                  <span class="text-lg font-semibold text-gray-800">
              <!--       <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" stroke-width="2" />
                      <line x1="12" y1="16" x2="12" y2="12" stroke-width="2" />
                      <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2" />
                    </svg> -->
                    {{ stock.product?.Title || 'Produit sans nom' }}
                  </span>
                  <span class="text-sm text-gray-500">Sorti le: {{ formatDisplayDate(stock.CreatedDate) }}</span>
                </div>
                
                <InputGroup 
                  v-else
                  label=""
                  type="text"
                  v-model="stock.product.Title"
                  customClasses="py-1 h-10"
                  required
                />
              </div>
              
              <div class="w-32">
                <div v-if="!stock.editing" class="text-lg font-medium text-gray-700">
                  {{ stock.Quantity }} {{ stock.product.QuantityUnitCode }}
                </div>
                <InputGroup 
                  v-else
                  label=""
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  v-model="stock.Quantity"
                  customClasses="py-1 h-10"
                  required
                />
              </div>

              <div class="flex gap-2">
                <template v-if="!stock.editing">
                  <button 
                    @click="enableEditing(index.toString())"
                    class="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                    title="Modifier"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    @click="removeProduct(index.toString())"
                    class="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                    title="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </template>
                
                <template v-else>
                  <button 
                    @click="updateProduct(index.toString())"
                    class="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                    title="Valider"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button 
                    @click="cancelEditing(index.toString())"
                    class="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                    title="Annuler"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </DefaultCard>
    </div>
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
import { ref, defineAsyncComponent, onMounted } from 'vue';
import DefaultCard from '@/components/Forms/DefaultCard.vue';
import InputGroup from '@/components/Forms/InputGroup.vue';
import EventBus from '@/EventBus';
import ButtonAction from '@/components/Buttons/ButtonAction.vue';
import router from '@/router';
import { fetchpendingStocks, updateStocksExit, deleteStocksExit } from '@/services/database';
import { useAuthStore } from '@/stores/auth';

interface StockData {
  Id: string;
  ActionCode: string;
  CreatedDate: string;
  Notes: string | null;
  ProductCode: string;
  Quantity: number;
  QuantityUnitCode: string;
  StatusCode: string;
  UpdatedOn: string;
  product: {
    Title: string;
    AvailableQuantity: number;
    CategoryCode: string;
    Code: string;
    Description: string;
    Likes: number;
    QuantityUnitCode: string;
  };
  editing?: boolean;
  original?: any;
}

interface ApiResponse {
  entries: {
    count: number;
    results: StockData[];
  };
}

const NewProductForm = defineAsyncComponent(() => import('@/views/Stocks/NewStocksExit.vue'));

const authstore = useAuthStore();
const isViewing = ref(true);
const created = ref(false);
const isMenuOpen = ref(false);
const _token = authstore.jwt;
const restaurantCode = authstore.restaurantCode;
const emits = defineEmits(['back']);
const productlist = ref<StockData[]>([]);

const formatDisplayDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchStockData = async () => {
  try {
    const response = await fetchpendingStocks(_token, restaurantCode) as ApiResponse;
    
    if (!response?.entries?.results || !Array.isArray(response.entries.results)) {
      throw new Error('Structure de réponse inattendue');
    }

    productlist.value = response.entries.results.map((stock: StockData) => ({
      ...stock,
      editing: false,
      original: {}
    }));
    
    console.log('Stocks chargés:', productlist.value);
  } catch (error) {
    console.error('Erreur lors du chargement des stocks:', error);
    EventBus.emit('showToast', { 
      type: "danger", 
      message: "Erreur lors du chargement des sorties" 
    });
  }
};

const goBack = () => {
  emits('back');
  router.push({ path: '/Stocks-entree' });
};

const enableEditing = (index: string) => {
  const idx = parseInt(index);
  productlist.value[idx].original = {
    ...productlist.value[idx]
  };
  productlist.value[idx].editing = true;
};

const cancelEditing = (index: string) => {
  const idx = parseInt(index);
  if (productlist.value[idx].original) {
    productlist.value[idx] = { ...productlist.value[idx].original };
  }
  productlist.value[idx].editing = false;
  EventBus.emit('showToast', { type: "info", message: "Modifications annulées" });
};

const updateProduct = async (index: string) => {
  const idx = parseInt(index);
  try {
    const stock = productlist.value[idx];
    const payload = {
      Id: String(stock.Id),
      QuantityUnitCode: stock.product.QuantityUnitCode,
      Quantity: stock.Quantity
    };

    console.log('data.send', payload)
    const responseupdate = await updateStocksExit([payload], _token, restaurantCode);
    console.log('update.data', responseupdate)

    stock.editing = false;
    stock.UpdatedOn = new Date().toISOString();
    
    EventBus.emit('showToast', { 
      type: "success", 
      message: "Sortie mise à jour avec succès" 
    });
    
    await fetchStockData();
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    EventBus.emit('showToast', { 
      type: "danger", 
      message: "Échec de la mise à jour de la sortie" 
    });
    cancelEditing(index);
  }
};

const handleCreate = () => {
  created.value = true;
  fetchStockData();
};

const cancel = () => {
  isViewing.value = true;
  if (created.value) {
    created.value = false;
  }
};

const handleAddProduct = () => {
  isViewing.value = false;  
  isMenuOpen.value = false;
};

const removeProduct = async (index: string) => {
  const idx = parseInt(index);
  if (confirm('Voulez-vous vraiment supprimer cette sortie de stock ?')) {
    try {
      const stockId = String(productlist.value[idx].Id);
      const payload2 = {
        Id: stockId
      }

      console.log('id.send', stockId)
      await deleteStocksExit([payload2], _token, restaurantCode);

      productlist.value.splice(idx, 1);
      
      EventBus.emit('showToast', { 
        type: "success", 
        message: "Sortie supprimée avec succès" 
      });
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      EventBus.emit('showToast', { 
        type: "danger", 
        message: "Échec de la suppression de la sortie" 
      });
    }
  }
};

onMounted(async () => {
  await fetchStockData();
});
</script>