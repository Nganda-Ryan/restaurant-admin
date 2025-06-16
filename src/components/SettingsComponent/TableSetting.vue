<template>
  <TableOne 
    :items="titles"  
    :datas="tables"
    :options="filterOptions" 
    @view="viewPlate"
    @generateQR="generateQR"
    :filterable="false" 
    :pagination="false"
  />

<!-- Conteneur principal -->
  <div v-if="showQRModal" class="fixed inset-0 z-99999 overflow-y-auto">
    <!-- Overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-75" @click="showQRModal = false"></div>
    
    <!-- Contenu du modal -->
    <div class="flex items-center  sticky justify-center min-h-screen p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <!-- En-tête -->
        <div class="flex justify-between items-center border-b p-4 sticky top-0 bg-white">
          <h3 class="text-xl font-bold text-gray-800">
            QR Code - Table {{ selectedTable?.numero }}
          </h3>
          <button @click="showQRModal = false" class="text-gray-500 hover:text-red-500">
            <i class="pi pi-times text-xl"></i>
          </button>
        </div>

        <!-- Corps avec overflow automatique -->
        <div class="p-6  flex-1 ">
          <div class="mb-4 mx-auto w-64 h-64 flex items-center justify-center bg-white p-2 rounded border">
            <img :src="qrCodeUrl" alt="QR Code" class="w-full h-full object-contain" />
          </div>
          
          <p class="text-sm text-gray-600 mb-4">
            Scannez ce code avec <strong>l'appareil photo</strong> de votre téléphone
            pour accéder au menu
          </p>
        </div>

        <!-- Pied de page -->
        <div class="border-t p-4 flex justify-end sticky bottom-0 bg-white">
      <button 
        @click="showQRModal = false"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Fermer
      </button>
    </div>
      </div>
    </div>
  </div>


</template>

<script setup>
import { ref } from 'vue'
import QRCode from 'qrcode'
import QRCodeWithLogo from 'qrcode-with-logos'
import TableOne from '@/components/Tables/TableOne.vue';

// Gestion de l'équipe
const tables = ref([
  { id: 1, code: 'Tab1#001', numero: 1, capacite: 6, localisation: 'salle' },
  { id: 2, code: 'Tab2#002', numero: 2, capacite: 10, localisation: 'salle' },
  { id: 3, code: 'Tab3#003', numero: 3, capacite: 4, localisation: 'terrasse' }
])

const titles = ref([
  {
    name: 'numero',
    label: 'Numéro Table',
    type: 'number',
    filterable: true
  },
  {
    name: 'capacite',
    label: 'Nombre de place',
    type: 'number',
    filterable: true
  },
  {
    name: 'localisation',
    label: 'localisation',
    type: 'text',
    filterable: true
  },
  {
    name: 'actions',
    label: 'Actions',
    type: 'action',
    actions: [
      {
        name: 'Voir',
        event: 'view',
        icone: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>`
      },
      {
        name: 'QR Code',
        event: 'generateQR',
        icone: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
        </svg>`
      },
      {
        name: 'Modifier',
        event: 'edit',
        icone: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>`
      },
      {
        name: 'Supprimer',
        event: 'remove',
        icone: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>`
      }
    ]
  }
])

const showQRModal = ref(false);
const selectedTable = ref(null);
const qrCodeUrl = ref('');

const generateQR = async (table) => {
  try {
    // Vous pouvez personnaliser les données encodées dans le QR code
    const qrData = JSON.stringify({
      tableId: table.id,
      tableNumber: table.numero,
      capacity: table.capacite,
      location: table.localisation
    })

     // Créer l'URL avec les paramètres de la table
    //const clientUrl = `https://nwaar-restaurant-client.netlify.app/?tableId=${table.id}&tableNumber=${table.numero}`;
    const clientUrl = `  http://localhost:3000/?tableId=${table.id}&tableNumber=${table.numero}`;
    // Générer le QR code sous forme d'URL de données
    const generaoUrlqrCode = await QRCode.toDataURL(clientUrl, { 
      width: 300, // Taille augmentée pour meilleure détection
      margin: 2,
      color: {
        dark: "#127086",
        light: "#ffffff" // Correction: "ffffff" au lieu de "ffff"
      },
      errorCorrectionLevel: 'H'
    });
    
    window.open(clientUrl, '_blank');
     // Affichez le QR code dans le modal
    showQRModal.value = true;
    selectedTable.value = table;
    qrCodeUrl.value = generaoUrlqrCode;
    
  } catch (err) {
    console.error('Erreur lors de la génération du QR code:', err)
    alert('Erreur lors de la génération du QR code')
  }
} 

defineProps({
  members: Array
})

defineEmits(['edit', 'remove', 'generateQR'])

function statusClasses(status) {
  return {
    'bg-green-100 text-green-800': status === 'active',
    'bg-red-100 text-red-800': status === 'inactive'
  }
}
</script>

<style scoped>
.texte-red {
  color: rgb(238, 14, 14);
}
</style>