<template>
  <div class="grid grid-cols-1 gap-12 sm:grid-cols-1">
    <div v-if="isViewing" class="flex flex-col gap-9">
      <DefaultCard cardTitle="Liste des produits">
        <template v-slot:button>
          <button class="flex items-center" @click="goBack">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span class="text-nowrap ml-2">Retour</span>
          </button>
        </template>
        <template v-slot:header>
            <div class="flex items-center justify-center">
                <button-action @click='handleAddProduct'  custom-classes="teal-btn">New Exit</button-action>
            </div>
        </template>

        <div class="p-6.5">
          <div v-for="(product, index) in products" :key="index" class="mb-6 relative">
            <div class="flex items-center gap-4 w-full">
              <!-- Nom du produit -->
              <div class="flex-1">
                <InputGroup 
                  label=""
                  type="text"
                  v-model="product.name"
                  :disabled="!product.editing"
                  customClasses="py-1 h-10"
                  required
                />
              </div>
              
              <!-- Quantité -->
              <div class="w-32">
                <InputGroup 
                  label=""
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  v-model="product.quantity"
                  :disabled="!product.editing"
                  customClasses="py-1 h-10"
                  required
                />
              </div>

              <!-- Boutons d'actions -->
              <div class="flex gap-2">
                <template v-if="!product.editing">
                  <button 
                    @click="enableEditing(index)"
                    class="p-2 text-blue-500 hover:text-blue-700"
                    title="Modifier"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    @click="removeProduct(index)"
                    class="p-2 text-rose-500 hover:text-rose-700"
                    title="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </template>
                
                <template v-else>
                  <button 
                    @click="updateProduct(index)"
                    class="p-2 text-teal-500 hover:text-teal-700"
                    title="Valider"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button 
                    @click="cancelEditing(index)"
                    class="p-2 text-gray-500 hover:text-gray-700"
                    title="Annuler"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
import { ref, defineAsyncComponent } from 'vue';
import DefaultCard from '@/components/Forms/DefaultCard.vue';
import InputGroup from '@/components/Forms/InputGroup.vue';
import EventBus from '@/EventBus';
import ButtonAction from '@/components/Buttons/ButtonAction.vue';


const NewProductForm = defineAsyncComponent(() => import('@/views/Stocks/NewStocksExit.vue'))

const isViewing = ref(true);
const created = ref(false)
const emits = defineEmits(['back']);
const products = ref([
  { id: 1, name: 'Produit 1', quantity: 10, editing: false, original: {} },
  { id: 2, name: 'Produit 2', quantity: 5, editing: false, original: {} },
  { id: 3, name: 'Produit 3', quantity: 8, editing: false, original: {} }
]);

const goBack = () => {
    emits('back');
}

const enableEditing = (index: number) => {
  products.value[index].original = {
    name: products.value[index].name,
    quantity: products.value[index].quantity
  };
  products.value[index].editing = true;
};

const cancelEditing = (index: number) => {
  products.value[index].name = products.value[index].original.name;
  products.value[index].quantity = products.value[index].original.quantity;
  products.value[index].editing = false;
  EventBus.emit('showToast', { type: "info", message: "Modifications annulées" });
};

const updateProduct = async (index: number) => {
  try {
    products.value[index].editing = false;
    EventBus.emit('showToast', { type: "success", message: "Produit mis à jour" });
  } catch (error) {
    EventBus.emit('showToast', { type: "danger", message: "Erreur de mise à jour" });
  }
};

const handleCreate = () => {
    created.value = true
}

const cancel = () => {
    isViewing.value = true
    if (created.value) {
        created.value = false
    }
}
const handleAddProduct = () => {
    isViewing.value = false
}

const removeProduct = (index: number) => {
  if (confirm('Supprimer ce produit ?')) {
    products.value.splice(index, 1);
    EventBus.emit('showToast', { type: "success", message: "Produit supprimé" });
  }
};
</script>