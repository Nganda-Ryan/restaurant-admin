<script setup lang="ts">
    import { onBeforeMount, ref } from 'vue';
    import router from '@/router';
    import { deletePlate } from '@/services/database';
    import { fetchPlate } from '@/services/database';
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import DefaultCardSkeleton from '@/components/Forms/DefaultCardSkeleton.vue';
    import { QuillEditor } from '@vueup/vue-quill';
    const Spinner = defineAsyncComponent(() => import('@/components/Utilities/Spinner.vue'));
    const NewPlateForm = defineAsyncComponent(() => import('./NewPlateForm.vue'));
    import { defineAsyncComponent } from 'vue';
    import type { PlateInfo } from '@/services/serviceInterface';
    const PopupModal = defineAsyncComponent(() => import('@/components/Modals/PopupModal.vue'));
    const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    const InputGroup = defineAsyncComponent(() => import('@/components/Forms/InputGroup.vue'));
     const content = ref<string>('');


    interface Param {
        action: string,
        platecode: string
    }
    const imagePreviews = ref<Array<{ 
    file: File; 
    url: string; 
    name: string;
    type: 'image' | 'video'
    }>>([]);
    const plateCode = ref('');
    const plateInfo = ref<PlateInfo>({
        "Code": "",
        "Title": "",
        "Description": "",
        "BasePrice": 0,
        "Currency": "",
        "CategoryCode": "",
        "Likes": 0,
        "content": []
    });
    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // Styles de texte
        ['blockquote', 'code-block'],                     // Blocs
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],       // En-têtes
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],     // Listes
        [{ 'script': 'sub' }, { 'script': 'super' }],      // Exposant/indice
        [{ 'indent': '-1' }, { 'indent': '+1' }],         // Indentation
        [{ 'direction': 'rtl' }],                         // Sens d'écriture
        [{ 'size': ['small', false, 'large', 'huge'] }],  // Taille police
        [{ 'header': 1 }, { 'header': 2 }],               // En-têtes alternatifs
        [{ 'color': [] }, { 'background': [] }],          // Couleurs
        [{ 'font': [] }],                                 // Polices
        [{ 'align': [] }],                                // Alignement
        ['link'],                                         // Liens (conservé)
        ['clean']                           
    ];
    const isLoading = ref(true);
    const isEditing = ref<Boolean>(false);
    const isModalOpen = ref(false);
    const isDeleting = ref(false);
    const ingredients = ref<any []>([]);

    const fullscreenImage = ref({
    visible: false,
    url: ''
    });

    const showFullscreenImage = (url: string) => {
        fullscreenImage.value = {
            visible: true,
            url: url
        };
    };

    const handleEditPlate = (e: any) => {
        console.log("handleEditPlate", plateInfo.value);
        isEditing.value = true;
    }
    const handleDeletePlate = (e: any) => {
        isModalOpen.value = true;
    }
    const handleCloseModal = () => {
        console.log('handleCloseModal')
        isModalOpen.value = false;
    }
    
    const deleteAction = async () => {
        try {
            console.log('deleteAction')
             isDeleting.value = true;
            await deletePlate([{Code: plateInfo.value.Code}])
            router.push({path: '/plates'})
        } catch (e) {
            console.log("PlateDetails.handleDeletePlate.error", e)
        }
        finally {
            isDeleting.value = false;
        }
    }
    const cancel = () => {
        isEditing.value = false;
        window.location.reload();
    }
    const goBack = () => {
        window.location.href = '/plates';
        window.history.back();
    }




 async function getPlate() {
        const params = router.currentRoute.value.params as unknown as Param;
        plateCode.value = params.platecode;
        
        try {
            const result = await fetchPlate();
            
            console.log('resultinfoplate', result)
            plateInfo.value = result.filter((item: any) => item.Code == params.platecode)[0];
            ingredients.value = plateInfo.value.content
                .filter((item:any) => item.typex.Code == 'ING')
                ?.map((item:any) => item.Body)[0]
                ?.split(/[;]/)
                .map((item:any) => item.trim()) // Nettoyer les espaces
                .filter((item:any) => item !== '') // Supprimer les éléments vides
                .map((item:any) => item.replace(/:$/, '')); // Supprimer les deux points en fin de ligne
           imagePreviews.value = plateInfo.value.content
            .filter((item: any) => item.typex?.Code === 'IMG' || item.typex?.Code === 'VIDEO_DESC')
            .flatMap((item: any) => {
                if (!item.Body) return [];
                return item.Body.split(',')
                    .filter((url: string) => url.trim() !== '')
                    .map((url: string) => ({
                        file: null,
                        url: url.trim(),
                        name: item.typex?.Code === 'IMG' ? 'Image' : 'Video',
                        type: item.typex?.Code === 'IMG' ? 'image' : 'video'
                    }));
            });

             // Récupération du contenu historique
            const histItem = plateInfo.value.content
                .find((item: any) => item.typex?.Code === 'HIST');
            
            if (histItem && histItem.Body) {
                content.value = histItem.Body;
            }

            console.log('param', params);
            console.log('ingredients.value', ingredients.value);
            console.log("Plate", result.filter((item: any) => item.Code == params.platecode))

            isLoading.value = false;
        } catch(error) {
            console.error("Error fetching plate:", error);
        }
    }
    onBeforeMount(async () => {
        try {
        await getPlate();
    } catch (error) {
        console.error("Error during beforeMount:", error);
    }
    })
</script>

<template>
    <div>
        <div class="grid grid-cols-1 gap-12 sm:grid-cols-1">
        <div class="flex flex-col gap-9">
            <!-- Input Fields Start -->
            <template v-if="!isEditing">
                <DefaultCard :cardTitle="`${plateInfo.Title}`" v-if="!isLoading">
                    <template v-slot:button>
                        <button class="flex items-center" @click="goBack">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>&nbsp;&nbsp;
                            <span class="text-nowrap">{{ 'Go back' }}</span>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                        </button>
                    </template>
                    <template v-slot:header>
                        <div class="flex items-center justify-center">
                            <button-action @click='handleEditPlate' custom-classes="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Edit</button-action>
                            <button-action @click="handleDeletePlate" custom-classes="text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Delete</button-action>
                        </div>
                    </template>
                    <form @submit.prevent="">
                        <div class="p-6.5">
                            <div class="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                <input-group label="Title" type="text" customClasses="w-full xl:w-1/2" disabled v-model="plateInfo.Title" />

                                <input-group label="Price" type="text" customClasses="w-full xl:w-1/2" disabled v-model="plateInfo.BasePrice" />
                            </div>
                            <div class="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                <input-group label="Category" type="text" customClasses="w-full xl:w-1/2" disabled v-model="plateInfo.CategoryCode" />

                                <input-group label="Description" type="text" customClasses="w-full xl:w-1/2" disabled v-model="plateInfo.Description" />
                            </div>
                        </div>
                    </form>

                    <div v-if="ingredients" class="w-full px-6 font-bold gap-2.5 py-2 hover:bg-opacity-90 lg:px-6 xl:px-6 text-white bg-gradient-to-r from-olive-800 to-olive-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 text-sm me-2 mb-2">
                        INGREDIENT(S)
                    </div> 
                    <div class="px-6.5 py-2">
                        <ul>
                            <li v-for="item in ingredients" :key="item" class="flex items-center">
                                <svg class="w-3.5 h-3.5 me-2 text-green-500 dark:text-green-400 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                                </svg>
                                {{ item }}
                            </li>
                        </ul>
                    </div>
                    <div v-if="content" class="w-full px-6 font-bold gap-2.5 py-2 mb-10 mt-8 hover:bg-opacity-90 lg:px-6 xl:px-6 text-white bg-gradient-to-r from-olive-800 to-olive-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 text-sm me-2">
                        HISTORIQUE
                    </div>
                    <div v-if="content" class="ql-editor-style" v-html="content"></div>
                    <div v-if="imagePreviews && imagePreviews.length > 0" class="w-full px-6 font-bold gap-2.5 py-2 mb-10 mt-8 hover:bg-opacity-90 lg:px-6 xl:px-6 text-white bg-gradient-to-r from-olive-800 to-olive-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 text-sm me-2">
                        MULTIMEDIA
                    </div>
                    <div v-if="imagePreviews && imagePreviews.length > 0" class="mb-8">
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div v-for="(preview, index) in imagePreviews" :key="index" class="relative group">
                                <!-- Image avec ouverture dans un nouvel onglet -->
                                <template v-if="preview.type === 'image'">
                                    <a :href="preview.url" target="_blank" rel="noopener noreferrer">
                                        <img 
                                            :src="preview.url"
                                            :alt="`Preview ${index + 1}`"
                                            class="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:opacity-90" />
                                    </a>
                                </template>
                                <!-- Vidéo -->
                                <template v-else>
                                    <video
                                        controls
                                        class="w-full h-32 object-cover rounded-lg border-2 border-gray-200">
                                        <source :src="preview.url" :type="preview.file?.type || 'video/mp4'">
                                    </video>
                                </template>
                            </div>
                        </div>
                    </div>
                </DefaultCard>
            </template>
       
            <template v-else-if="isEditing">
                <div>
                <NewPlateForm  @cancel="cancel"  :action="'update'" :plate="plateInfo" @back="cancel"/>
            </div>
            </template>
         
            <DefaultCardSkeleton v-if="isLoading"/>
        </div>

        <PopupModal :message="`Are you sure you want to delete this Plate ? This action cannot be undone.`" :is-open="isModalOpen" v-if="isModalOpen" @close="handleCloseModal" :title="'Plate deletion'">
            <template v-slot:footer>
                <div class="bg-slate-50 px-4 py-2 sm:flex sm:flex-row-reverse sm:px-6">
                    <button @click="deleteAction" type="button" class="h-10 text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 text-center mb-2 flex justify-center items-center flex-nowrap">Delete<span v-if="isDeleting" class="flex items-center justify-center">&nbsp;&nbsp;&nbsp;<spinner/></span></button>
                    <button @click="handleCloseModal" class="h-10 relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-slate-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
                        <span class="h-9 relative px-5 py-2 transition-all ease-in duration-75 bg-white dark:bg-slate-900 rounded-md group-hover:bg-opacity-0">
                            Cancel
                        </span>
                    </button>
                </div>
            </template>
        </PopupModal>
        <SpinnerOverPage v-if="isLoading" />
    </div>
    </div>
</template>
<style scoped>
    .ql-editor-style {
    padding: 16px;
    height: 150px;
    overflow-y: auto;
    text-align: left; /* Pour le centrage */
    font-size: 0.875rem; /* Taille de texte similaire */
    color: #000; /* Texte noir */
    }

    .ql-editor-style >>> p {
        margin-bottom: 0.5rem; /* Espacement entre paragraphes */
        line-height: 1.5; /* Interligne */
    }

    .ql-editor-style >>> img {
        max-width: 100%; /* Pour les images éventuelles */
        height: auto;
        display: inline-block; /* Pour le centrage */
    }
</style>
