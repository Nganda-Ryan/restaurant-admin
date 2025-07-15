<script setup lang="ts">
    import { defineAsyncComponent,ref, onBeforeMount } from 'vue'
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import TableOne from '@/components/Tables/TableOne.vue';
    import type { Table } from '@/services/serviceInterface'
    import { deleteTable } from '@/services/database'
    import Spinner from '@/components/Utilities/Spinner.vue'
    import { fetchResto } from '@/services/database';
    import QRCode from 'qrcode'
    import router from '@/router';
    import { useRoute } from 'vue-router';
    import { useI18n } from 'vue-i18n';
    import { useAuthStore } from '@/stores/auth';

    const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));
    const PopupModal = defineAsyncComponent(() => import('@/components/Modals/PopupModal.vue'));
    const NewTableForm = defineAsyncComponent(() => import('@/components/SettingsComponent/Tables/NewTables.vue'));
    const authStore = useAuthStore();
    const _token = authStore.jwt;

    // États du composant
    const isEditing = ref<Boolean>(false);
    const isModalOpen = ref(false);
    const isDeleting = ref(false);
    const isViewing = ref(true);
    const isloading = ref(false);
    const showQRModal = ref(false);
    const { t } = useI18n()

  const profilesString = localStorage.getItem('profiles');
    let restaurantCode = null;

    if (profilesString) {
  try {
    const profiles = JSON.parse(profilesString);
    // Si profiles est un tableau, prends le premier élément
    if (Array.isArray(profiles) && profiles.length > 0) {
      restaurantCode = profiles[0].RestaurantCode;
    } else if (profiles && profiles.RestaurantCode) {
      // Si c'est un objet unique
      restaurantCode = profiles.RestaurantCode;
    }
  } catch (e) {
    console.error('Erreur de parsing du localStorage profiles', e);
  }
}

console.log('RestaurantCode:', restaurantCode);
    // Données des tables
    const tables = ref<any[]>([]);
    
    const selectedTable = ref<Table>({
        Code: '',
        Title: '',
        Description: '',
    });
    const qrCodeUrl = ref('');
    
    // Configuration du tableau
    const titles = ref([
        {
            name: 'Title',
            label: t('tables.title'),
            type: 'text',
            filterable: true
        },
        {
            name: 'Description',
            label: t('tables.Description'),
            type: 'text',
            filterable: true
        },
        {
            name: 'IsActive',
            label: t('tables.Status'),
            type: 'boolean',
            filterable: true
        },
        {
            name: 'actions',
            label:t('tables.Actions'),
            type: 'action',
            actions: [
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
    ]);

     const filterOptions = ref([
        {
            name: t('tables.All'),
            api: '',
        },
        {
            name: t('tables.Status'),
            api: 'status',
        },
    ]);

    const TableInfo = ref<Table>({
        "Code": '',
        "Title": '',
        "Description":""
    });

    // Chargement des données des tables
const fetchTables = async () => {
    isloading.value = true;
    try {
        const response = await fetchResto(_token);
        // Accéder directement au tableau des tables
         if (response?.tables && Array.isArray(response.tables)) {
            tables.value = response.tables.map((table:Table) => ({
                Code: table.Code,
                Title: table.Title,
                Description: table.Description,
                IsActive: table.IsActive ? true : false,
            }));
            console.log('statut', response.tables)
        } else {
            console.warn('Structure de réponse inattendue:', response);
            tables.value = [];
        }
    } catch (error) {
        console.error('Erreur lors du chargement des tables:', error);
    } finally {
        isloading.value = false;
    }
};
    // Gestion des QR Codes
    const generateQR = async (table:any) => {
        try {
            const clientUrl = `https://nwaar-restaurant-client.netlify.app/?c=${table.Code}&tt=${table.Title}&rc=${restaurantCode}`;
            const generaoUrlqrCode = await QRCode.toDataURL(clientUrl, { 
                width: 300,
                margin: 2,
                color: {
                    dark: "#127086",
                    light: "#ffffff"
                },
                errorCorrectionLevel: 'H'
            });
            showQRModal.value = true;
            selectedTable.value = table;
            qrCodeUrl.value = generaoUrlqrCode;
            
        } catch (err) {
            console.error('Erreur lors de la génération du QR code:', err);
            alert('Erreur lors de la génération du QR code');
        }
    };

    const handleEditTable = (table:any) => {
        TableInfo.value = { ...table };
        isViewing.value = false;
        isEditing.value = true;
    };

    const handleDeleteTable = (table:Table) => {
        TableInfo.value = table;
        isModalOpen.value = true;
    };

    const handleCloseModal = () => {
        isModalOpen.value = false;
    };

    const deleteAction = async () => {

        try {
            isDeleting.value = true;
            const response = await deleteTable([{Code: TableInfo.value.Code}], _token);
            console.log('delete.response', TableInfo.value.Code)
            router.push({path: '/settings'});
        } catch (e) {
            console.log("TableDetails.handleDeleteTable.error", e);
        } finally {
            isDeleting.value = false;
            isModalOpen.value = false;
        }
    };

    const goBack = () => {
        window.history.back();
    };

    const handleAddTable = () => {
        isViewing.value = false;
        isEditing.value = false;
    };

    const cancel = () => {
        isViewing.value = true;
        isEditing.value = false;
        window.location.reload();
    };

    onBeforeMount(async () => {
        try {
            await fetchTables();
        } catch (error) {
            console.error("Error during beforeMount:", error);
        }
    });
</script>

<template>
    <div>
        <!-- Vue tableau -->
        <div class="flex flex-col gap-10" v-if="isViewing">
            <TableOne 
                :items="titles" 
                :datas="tables"
                @edit="handleEditTable"
                @remove="handleDeleteTable"
                @generateQR="generateQR"
                :filterable="true"
                :pagination="true"
                :options="filterOptions"

            >
                <template v-slot:headerButton>
                    <button-action 
                        @click="handleAddTable" 
                        custom-classes="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                    >
                        {{ $t('AddTable') }}
                    </button-action>
                </template>
            </TableOne>
        </div>

        <!-- Formulaire d'édition -->
        <template v-else-if="isEditing">
            <div>
                <NewTableForm  
                    @cancel="cancel"  
                    :action="'update'" 
                    :table="TableInfo"  
                    @back="goBack"
                />
            </div>
        </template>

        <!-- Formulaire de création -->
        <template v-if="!isViewing && !isEditing">
            <NewTableForm 
                @cancel="cancel" 
                @back="cancel" 
                :action="'add'"
            />
        </template>

        <!-- Spinner de chargement -->
        <SpinnerOverPage v-if="isloading"/>

        <!-- Modal de confirmation de suppression -->
        <PopupModal 
            :message="`Êtes-vous sûr de vouloir supprimer cette table ? Cette action est irréversible.`" 
            :is-open="isModalOpen" 
            v-if="isModalOpen" 
            @close="handleCloseModal" 
            :title="'Suppression de table'"
        >
            <template v-slot:footer>
                <div class="bg-slate-50 px-4 py-2 sm:flex sm:flex-row-reverse sm:px-6">
                    <button 
                        @click="deleteAction" 
                        type="button" 
                        class="h-10 text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 text-center mb-2 flex justify-center items-center flex-nowrap"
                    >
                        {{ $t('Delete')}}
                        <span v-if="isDeleting" class="flex items-center justify-center">
                            &nbsp;&nbsp;&nbsp;<spinner/>
                        </span>
                    </button>
                    <button 
                        @click="handleCloseModal" 
                        class="h-10 relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-slate-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                    >
                        <span class="h-9 relative px-5 py-2 transition-all ease-in duration-75 bg-white dark:bg-slate-900 rounded-md group-hover:bg-opacity-0">
                            {{ $t('Cancel')}}
                        </span>
                    </button>
                </div>
            </template>
        </PopupModal>

        <!-- Modal QR Code -->
        <div v-if="showQRModal" class="fixed inset-0 z-99999 overflow-y-auto">
            <div class="fixed inset-0 bg-black bg-opacity-75" @click="showQRModal = false"></div>
            
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-md sticky max-h-[90vh] flex flex-col">
                    <div class="flex justify-between items-center border-b p-4 sticky top-0 bg-white">
                        <h3 class="text-xl font-bold text-gray-800">
                            QR Code - {{ selectedTable?.Title || 'Inconnue' }}
                        </h3>
                        <button @click="showQRModal = false" class="text-gray-500 hover:text-red-500">
                            <i class="pi pi-times text-xl"></i>
                        </button>
                    </div>

                    <div class="p-6 flex-1 ">
                        <div class="mb-4 mx-auto w-64 h-64 flex items-center justify-center  bg-white p-2 rounded border">
                            <img :src="qrCodeUrl" alt="QR Code" class="w-full h-full object-contain" />
                        </div>
                        
                        <p class="text-sm text-gray-600 mb-4">
                            {{ $t('infoQrcode') }}
                        </p>
                    </div>

<!--                     <div class="border-t p-4 flex justify-end sticky bottom-0 bg-white">
                        <button 
                            @click="showQRModal = false"
                            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                            Fermer
                        </button>
                    </div> -->
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.texte-red {
    color: rgb(238, 14, 14);
}
</style>