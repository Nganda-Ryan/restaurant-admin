<script setup lang="ts">
import { ref, defineAsyncComponent, computed, onMounted, onBeforeMount } from 'vue';
import router from '@/router';
import Spinner from '@/components/Utilities/Spinner.vue';
import DefaultCard from '@/components/Forms/DefaultCard.vue';
import { useConfigStore } from '@/stores/config';
import { useAuthStore } from '@/stores/auth';
import type { PlateOption, Content, Composition, Compositions, ProductOption, ResultItem, ApiResponse, composition, Categorieplat } from '@/services/serviceInterface';
import ButtonAction from '@/components/Buttons/ButtonAction.vue';
import InputGroup from '@/components/Forms/InputGroup.vue';
import SelectGroupSearchable from '@/components/Forms/SelectGroup/SelectGroupSearchable.vue';
import type Option from '../../Utilities/interfaceModel';
const SelectGroupOne = defineAsyncComponent(() => import('@/components/Forms/SelectGroup/SelectGroupOne.vue'));
import { createCategoriePlate, generateCode, updateCategoriePlat, fetchCategoriePlate } from '@/services/database';
import type ToastPayload from '@/types/Toast';
import EventBus from '@/EventBus';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const configStore = useConfigStore();
const authStore = useAuthStore();
const _token = authStore.jwt;   
const isSaving = ref<boolean>(false);
const emits = defineEmits(['cancel', "save", "back", "created"]);
const storedData = localStorage.getItem('profiles');

const dataArray = storedData ? JSON.parse(storedData) : [];

const restaurantCode = dataArray[0]?.RestaurantCode ?? '';

const props = defineProps({
    action: {
        type: String,
        required: true
    },
    plate: {
        type: Object as () => Partial<Categorieplat>,
        default: () => ({})
    }
});

// Utilisation d'un tableau pour gérer plusieurs formulaires
const categoryForms = ref<Categorieplat[]>([{
    Code: '',
    Title: '',
    IsActive: false,
    RestaurantCode: restaurantCode
}]);
console.log('categoryForms', categoryForms.value);

const status = ref([
    { label: 'Inactive', value: false },
    { label: 'Active', value: true }
]);

// Ajouter un nouveau formulaire de catégorie
const addCategoryForm = () => {
    categoryForms.value.push({
        Code: '',
        Title: '',
        IsActive: false,
        RestaurantCode: restaurantCode
    });
}

// Supprimer un formulaire de catégorie
const removeCategoryForm = (index: number) => {
    if (categoryForms.value.length > 1) {
        categoryForms.value.splice(index, 1);
    } else {
        EventBus.emit('showToast', {
            type: "warning",
            message: t('phrase6') // "You must have at least one category form"
        });
    }
}

// Réinitialiser les formulaires
const resetForms = () => {
    categoryForms.value = [{
        Code: '',
        Title: '',
        IsActive: false,
        RestaurantCode: ''
    }];
}

const stopAction = () => {
    resetForms();
    emits('cancel');
}

const getActionLabel = (act: string | undefined) => {
    switch (act) {
        case "edit": return t('Mtjour'); // "To update"
        case "add": return t('save'); // "Save"
        default: return t('save'); // "Save"
    }
};

const goBack = () => {
    emits('back');
};

const saveCategories = async () => {
    try {
        isSaving.value = true;

        const payload = categoryForms.value.map(form => {
            // Générer le code pour les nouvelles catégories
            if (props.action === "add" && form.Title) {
                form.Code = generateCode(form.Title);
            }
            return {
                Code: form.Code,
                Title: form.Title,
                IsActive: form.IsActive,
                RestaurantCode: restaurantCode
            };
        });
        console.log('payload.categorieplate', payload);
        if (props.action === "add") {
            console.log('payload', payload);
            const result = await createCategoriePlate(payload, _token);
            console.log('createdCategories', result);
        } else if (props.action === "update") {
            // Pour l'update, on suppose qu'on ne gère qu'un seul formulaire
            const result = await updateCategoriePlat(payload[0], _token);
            console.log('updateCategorieplate', result);
        }

        EventBus.emit('showToast', {
            type: "success",
            message: `Categorie${payload.length > 1 ? 's' : ''} ${props.action === "update" ? "mise à jour" : "créée"} avec succès`
        });

        resetForms();
        emits('created', true);

    } catch (error: any) {
        console.error('Error:', error);
        const errMsg = error.response?.data?.body?.errors?.[0]?.message || "Une erreur s'est produite lors de l'opération";
        EventBus.emit('showToast', {
            type: "danger",
            message: errMsg
        });
    } finally {
        isSaving.value = false;
    }
};

onBeforeMount(() => {
    if (props.action === "update" && props.plate) {
        // Pour l'update, on ne montre qu'un seul formulaire avec les données existantes
        categoryForms.value = [{
            Code: props.plate.Code || '',
            Title: props.plate.Title || '',
            IsActive: props.plate.IsActive? true : false,
        }];
    }
});
</script>

<template>
    <div class="grid grid-cols-1 gap-12 sm:grid-cols-1">
        <div class="flex flex-col gap-9">
            <DefaultCard :cardTitle="`${getActionLabel(props.action)} Catégorie${categoryForms.length > 1 ? 's' : ''}`">
                <template v-slot:button>
                    <button class="flex items-center" @click="goBack">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        <span class="text-nowrap ml-2">{{ $t('back') }}</span>
                    </button>
                </template>

                <form @submit.prevent="saveCategories">
                    <div class="p-6.5">
                        <div v-for="(category, index) in categoryForms" :key="index" class="mb-8 relative">
                            <div class="mb-4.5 flex flex-col gap-6 xl:flex-row items-start">
                                <InputGroup 
                                    :label="$t('tables.title')"
                                    type="text" 
                                    :placeholder="$t('phrase7')"
                                    class="w-full xl:w-1/2" 
                                    v-model="category.Title" 
                                    required 
                                />
                                
                                <div class="w-full xl:w-1/2">
                                    <label class="mb-2 block text-black dark:text-white">
                                        {{ $t('tables.Status') }}<span class="text-meta-1">*</span>
                                    </label>
                                    <select 
                                        v-model="category.IsActive"
                                        required 
                                        class="w-full rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 h-[38px] px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50"
                                    >
                                        <option v-for="(item, index) in status" :key="index" :value="item.value">
                                            {{ item.label }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Bouton pour supprimer le formulaire -->
                            <button 
                                v-if="categoryForms.length > 1"
                                @click="removeCategoryForm(index)"
                                type="button"
                                class="absolute -right-2 -top-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                                title="Supprimer cette catégorie"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                                </svg>
                            </button>
                        </div>

                        <!-- Bouton pour ajouter un nouveau formulaire -->
                        <button 
                            v-if="props.action === 'add'"
                            @click="addCategoryForm"
                            type="button"
                            class="flex items-center text-blue-500 hover:text-blue-700 mb-6"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            {{ $t('phrase8') }}
                        </button>

                        <div class="flex justify-end mt-10 gap-4">
                            <button-action 
                                @click="stopAction" 
                                custom-classes="text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                                {{ $t('Cancel') }}
                            </button-action>
                            <button-action 
                                type="submit" 
                                custom-classes="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                                <spinner v-if="isSaving" /> 
                                {{ getActionLabel(props.action) }}
                            </button-action>
                        </div>
                    </div>
                </form>
            </DefaultCard>
        </div>
    </div>
</template>

<style scoped>
.aligned-column {
    display: flex;
    align-items: center;
    padding-left: 10px;
}
</style>