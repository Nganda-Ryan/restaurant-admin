<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { fetchinvoice } from '@/services/database';
import { useAuthStore } from '@/stores/auth';


const props = defineProps(['createdDate', 'code', 'plates', 'status', 'styled','invoice'])
const invoiceData = ref<any>(null);
const isLoading = ref(true);
const authStore = useAuthStore();
const _token = authStore.jwt;

// Formatage des prix
const formatPrice = (price: number) => {
  return price?.toFixed(2) || '0.00';
};


// Récupération de la facture
const fetchInvoice = async () => {
  try {
    isLoading.value = true
    const response = await fetchinvoice(props.code, _token);
    console.log('code:', props.code);
    console.log('Invoice data:', response);
    invoiceData.value = response.data.body; // Accès aux données via data.body
  } catch (error) {
    console.error('Error fetching invoice:', error);
  } finally {
    isLoading.value = false;
  }
};
onMounted(() => {
  isLoading.value = true;
  fetchInvoice();
});
</script>

<template>
  <div
    :class="[
      styled && 'bg-white border border-slate-400 rounded-lg shadow-lg px-8 py-10 max-w-xl mx-auto',
      'print:border print:border-slate-400 print:rounded print:shadow-none print:my-4 print:mx-auto print:px-6 print:py-8'
    ]"
  >
    
    <!-- En-tête -->
    <div class="text-slate-700 flex flex-row w-full py-0.5">
      <h2 class="font-bold">Date:&nbsp;&nbsp;</h2>
      {{ invoiceData?.orderInfo?.orderDate || 'N/A' }}
    </div>
    <div class="text-slate-700 flex flex-row w-full py-0.5">
      <h2 class="font-bold">Invoice Number #:&nbsp;&nbsp;</h2>
      {{ invoiceData?.invoiceNumber || 'N/A' }}
    </div>
    <div class="border-b-2 border-slate-300 pb-4 mb-1 flex py-0.5">
      <h2 class="font-bold">Order #:&nbsp;&nbsp;</h2>
      {{ invoiceData?.orderInfo?.orderCode || 'N/A' }}
    </div>

    <!-- Liste des plats -->
    <table class="w-full text-left mb-5">
      <thead>
        <tr>
          <th class="text-slate-700 font-bold uppercase py-2">Plate</th>
          <th class="text-slate-700 font-bold uppercase py-2">Qty</th>
          <th class="text-slate-700 font-bold uppercase py-2">Price</th>
          <th class="text-slate-700 font-bold uppercase py-2 flex justify-end">Total</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="invoiceData?.items">
          <tr v-for="(item, index) in invoiceData.items" :key="index" class="hover:bg-slate-50">
            <td class="py-1.5 text-slate-700">{{ item.title }}</td>
            <td class="py-1.5 text-slate-700">{{ item.quantity }}</td>
            <td class="py-1.5 text-slate-700">${{ formatPrice(item.unitPrice) }}</td>
            <td class="py-1.5 text-slate-700 flex justify-end">${{ formatPrice(item.unitPrice * item.quantity) }}</td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- Totalisation -->
    <div class="flex flex-col items-end space-y-2 mb-3">
      <div class="flex text-slate-700 w-64 justify-between">
        <span>Subtotal:</span>
        <span>${{ formatPrice(invoiceData?.summary?.subtotal) }}</span>
      </div>
      <div class="flex text-slate-700 w-64 justify-between">
        <span>TVA ({{ (invoiceData?.summary?.taxRate * 100)?.toFixed(0) }}%):</span>
        <span>${{ formatPrice(invoiceData?.summary?.taxAmount) }}</span>
      </div>
      <div class="flex text-green-600 font-bold uppercase w-64 justify-between pt-2 border-t border-slate-300">
        <span>Total:</span>
        <span>${{ formatPrice(invoiceData?.summary?.totalAmount) }}</span>
      </div>
    </div>

    <div>
      <div>
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>