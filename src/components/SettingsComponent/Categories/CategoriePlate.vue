<script setup lang="ts">
    import { defineAsyncComponent, onBeforeMount, ref } from 'vue'
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import TableOne from '@/components/Tables/TableOne.vue';
    import { fetchConfig, fetchCategoriePlate, deleteCategoriePlat } from '@/services/database'; 
    import type { Categorieplat } from '@/services/serviceInterface';
    import router from '@/router';
    import { useConfigStore } from '@/stores/config';
    import { useRoute, useRouter } from 'vue-router';
    import Spinner from '@/components/Utilities/Spinner.vue';
    import { useI18n } from 'vue-i18n'

    const PopupModal = defineAsyncComponent(() => import('@/components/Modals/PopupModal.vue'));
    
    const pageTitle = 'Plate Category';
    const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));
    const NewCategorieForm = defineAsyncComponent(() => import('@/components/SettingsComponent/Categories/NewCategoriesPlat.vue'));
    const { t } = useI18n()

    const isEditing = ref<Boolean>(false);
    const isModalOpen = ref(false);
    const isDeleting = ref(false);
    const storedData = localStorage.getItem('profiles');

    const dataArray = storedData ? JSON.parse(storedData) : [];

    const restaurantCode = dataArray[0]?.RestaurantCode ?? '';
    
    const titles = ref([
        {
            name: 'Title',
            label: t('tables.title'),
            type: 'text',
            filterable: true,
        },
        {
            name: 'Status',
            type: "text",
            label: t('tables.Status'),
        },
        {
        name: 'actions',
        label: t('tables.Actions'),
        type: 'action',
        actions: [
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
    const isloading = ref(false);
    const Categories = ref<any[]>([]);
    const rawCategories = ref([]);
    const configStore = useConfigStore();
    const categorieplateCode = ref(' ')

    interface Param {
        action: string,
        categorieplateCode: string
    }

    const CategorieplateInfo = ref<Categorieplat>({
        "Code": '',
        "Title": '',
        "IsActive":false ,
        "RestaurantCode": restaurantCode
    });

    const handleEditPlate = (categorie: Categorieplat) => {
        CategorieplateInfo.value = { ...categorie };
        console.log("After assignment:", CategorieplateInfo.value);

        isViewing.value = false;
        isEditing.value = true;
    }
    const handleDeletePlate = (categorie: Categorieplat) => {
    console.log("handleEditPlate", CategorieplateInfo.value);
        CategorieplateInfo.value = categorie;
        isModalOpen.value = true;
    }
    const handleCloseModal = () => {
        console.log('handleCloseModal')
        isModalOpen.value = false;
    }
    const fetCategoriePlate = async () => {
        isloading.value = true;
        const params = router.currentRoute.value.params as unknown as Param;
        categorieplateCode.value = params.categorieplateCode;
        try {
            
            const result = await fetchCategoriePlate();
            rawCategories.value = result; // Stocke les données brutes
        Categories.value = result.map((categorie: Categorieplat) => ({
            ...categorie, // Inclut TOUS les champs (dont Code)
            Status: categorie.IsActive ? 'Active' : 'Inactive',
        }));
        console.log('Categories:', Categories.value);
    } catch (er) {
        console.error('Erreur:', er);
    } finally {
        isloading.value = false;
    }
    }
    const isViewing = ref(true)
    const created = ref(false)
    const selectedProduct = ref<any>();

    const cancel = () => {
        console.log("cancelled")
        isViewing.value = true;
        isEditing.value = false;
        window.location.reload();
        if(created.value == true){
            console.log('reload')
            location.reload()
        }
    }
    const deleteAction = async () => {
        try {
            console.log('deleteAction')
             isDeleting.value = true;
            await deleteCategoriePlat([{Code: CategorieplateInfo.value.Code}])
            router.push({path: '/settings'})
        } catch (e) {
            console.log("PlateDetails.handleDeletePlate.error", e)
        }
        finally {
            isDeleting.value = false;
            isModalOpen.value = false
        }
    }
    const goBack = () => {
        //window.location.href = '/settings';
        window.history.back();
        //window.history.replaceState;
    }
    const handleCreate = () => {
        created.value = true;
    }
    const handleAddCategory = (e:any) => {
        isViewing.value = false;
        isEditing.value = false; // Ajoutez cette ligne
    }
    onBeforeMount(async () => {
    
        try {
            await fetCategoriePlate();
    } catch (error) {
        console.error("Error during beforeMount:", error);
    }
    });
</script>

<template>
    <div>
        <div class="flex flex-col gap-10" v-if="isViewing">
            <TableOne :items="titles" :datas="Categories" :options="filterOptions" :filterable="true" :pagination="true" @edit="handleEditPlate"
                @remove="handleDeletePlate" >
                <template v-slot:headerButton>
                    <button-action @click="handleAddCategory" custom-classes="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
                        {{ $t('AddCategory')}}
                    </button-action>
                </template>
            </TableOne>
        </div>
        <template v-else-if="isEditing">
            <div>
                <NewCategorieForm @cancel="cancel"  :action="'update'" :plate="CategorieplateInfo"  @back="goBack" :created="handleCreate"/>
            </div>
        </template>

        <template v-if="!isViewing && !isEditing">
            <NewCategorieForm @cancel="cancel" @back="cancel" :action="'add'" :created="handleCreate"></NewCategorieForm>
        </template>


        <SpinnerOverPage v-if="isloading"/>
        <PopupModal :message="`Are you sure you want to delete this Plate ? This action cannot be undone.`" :is-open="isModalOpen" v-if="isModalOpen" @close="handleCloseModal" :title="'Plate deletion'">
            <template v-slot:footer>
                <div class="bg-slate-50 px-4 py-2 sm:flex sm:flex-row-reverse sm:px-6">
                    <button @click="deleteAction" type="button" class="h-10 text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 text-center mb-2 flex justify-center items-center flex-nowrap">Delete<span v-if="isDeleting" class="flex items-center justify-center">&nbsp;&nbsp;&nbsp;<spinner/></span></button>
                    <button @click="handleCloseModal" class="h-10 relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-slate-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
                        <span class="h-9 relative px-5 py-2 transition-all ease-in duration-75 bg-white dark:bg-slate-900 rounded-md group-hover:bg-opacity-0">
                            {{ $t('Cancel')}}
                        </span>
                    </button>
                </div>
            </template>
        </PopupModal>

    </div>
</template>