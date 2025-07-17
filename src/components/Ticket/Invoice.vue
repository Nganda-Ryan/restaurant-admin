<template>
  <div 
    ref="receipt" 
    class="relative w-[80mm] min-h-[200mm] mx-auto p-2 font-sans text-xs text-black"
  > 
        <div class="relative">
            <!-- En-tête -->
            <div class="flex items-start justify-center my-1">
                <!-- Informations du restaurant à gauche -->
                <div class="text-left">
                <div class="text-base font-bold mb-1">LE PETIT BISTRO</div>
                <div>RUE BONOMOUSADI</div>
                <div>+237675571286/692814847</div>
                </div>
                
                <!-- Image du restaurant à droite -->
<!--                 <div class="w-16 h-16 flex-shrink-0">
                    <img 
                        :src="logoresto" 
                        alt="Logo Restaurant"
                        class="w-full h-full object-contain grayscale"
                    >
                </div> -->
            </div>
      
        
            <!-- Titre -->
            <!-- <div class="text-sm my-1 uppercase font-bold text-center">
            TICKET COMMANDE
            </div> -->
            
            <!-- Infos commande -->
            <div class="my-2 py-1 border-t border-b border-dashed border-black">
            <div><strong>Invoice Number #:&nbsp;&nbsp;</strong>{{ invoiceData?.invoiceNumber || 'N/A' }}</div>
            <div><strong>Date:&nbsp;&nbsp;</strong> {{ invoiceData?.orderInfo?.orderDate || 'N/A' }}</div>
            <div><strong>Order #:&nbsp;&nbsp;</strong> {{ invoiceData?.orderInfo?.orderCode || 'N/A' }}</div>
            <!-- <div v-if="order.waiter"><strong>Serveur:</strong> {{ order.waiter }}</div> -->
            </div>
        
            <!-- Articles -->
            <table class="w-full my-2 border-collapse">
            <thead>
                <tr>
                <th class="text-left py-1 border-b border-black">Plat</th>
                <th class="text-right py-1 border-b border-black">Qty</th>
                <th class="text-right py-1 border-b border-black">Prix U.</th>
                <th class="text-right py-1 border-b border-black">Total</th>
                </tr>
            </thead>
            <tbody>
                <template v-if="invoiceData?.items">
                <tr v-for="(item, index) in invoiceData.items" :key="index" class="hover:bg-slate-50">
                    <td class="py-1.5 text-slate-700">{{ item.title }}</td>
                    <td class="py-1.5 text-slate-700">{{ item.quantity }}</td>
                    <td class="py-1.5 text-slate-700" >${{ formatPrice(item.unitPrice) }}</td>
                    <td class="py-1.5 text-slate-700 flex justify-end">${{ formatPrice(item.unitPrice * item.quantity) }}</td>
                </tr>
                </template>
            </tbody>
            </table>
            <!-- Totaux -->
            <div 
            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    pointer-events-none z-10 w-[100%] h-[100%] max-w-none"
            >
            <img
                :src="logoresto" 
                alt="Filigrane" 
                class="opacity-20 grayscale contrast-200 w-full h-full object-contain min-w-full min-h-full"
            >
            </div>

            <!-- Totaux -->
            <div class="text-right">
            <div class="py-1 border-t border-black">Total HT: ${{ formatPrice(invoiceData?.summary?.subtotal) }}</div>
            <div class="py-1">TVA ({{ (invoiceData?.summary?.taxRate * 100)?.toFixed(0) }}%): ${{ formatPrice(invoiceData?.summary?.taxAmount) }}</div>
            <div class="py-1 font-bold border-t-2 border-b-2 border-double border-black">
                TOTAL TTC: ${{ formatPrice(invoiceData?.summary?.totalAmount) }}
            </div>
            </div>
        
            <!-- Paiement -->
            <div class="my-2 py-1 border-t border-b border-dashed border-black">
            <!--  <div><strong>Montant perçu:</strong> {{ formatPrice(payment.received) }}</div>
            <div><strong>Monnaie à rendre:</strong> {{ formatPrice(change) }}</div>
            <div><strong>Moyen de paiement:</strong> {{ payment.method }}</div>
            </div> -->
                <div><strong>Amount received:</strong> N/A</div>
            <!-- <div><strong>Monnaie à rendre:</strong> N/A</div> -->
            <div><strong>Payment method:</strong> espece</div>
            </div>
            <!-- Pied de page -->
            <div class="text-center mt-4">
            <div>Merci pour votre visite !</div>
            <!-- <div v-if="restaurant.footerNote">{{ restaurant.footerNote }}</div> -->
            </div>
        </div> 
  </div>
</template>
<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue';
    import type { CSSProperties } from 'vue';
    import { fetchinvoice } from '@/services/database';
    import { useAuthStore } from '@/stores/auth';
    import logoRestaurant from '@/assets/images/logo/restaurant-logo.png';

    const logoresto = computed(() => localStorage.getItem('logoresto') || logoRestaurant);
    const props = defineProps(['createdDate', 'code', 'plates', 'status', 'styled','invoice'])
    const invoiceData = ref<any>(null);
    const isLoading = ref(true);
    const authStore = useAuthStore();
    const _token = authStore.jwt;

    // Formatage des prix
    const formatPrice = (price: number) => {
    return price?.toFixed(2) || '0.00';
    };
    const watermarkStyle: CSSProperties = {
        transform: 'rotate(0)',
        opacity: 0.5,
        color: '#999999', // Gris plus visible
        fontSize: '4rem', // Taille augmentée
        fontWeight: 'bold',
        width: '100%',
        textAlign: 'center',
        zIndex: 10
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

<style scoped>
</style>