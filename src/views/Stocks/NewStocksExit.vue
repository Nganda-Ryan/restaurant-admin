<script setup lang="ts">
    import { ref, defineAsyncComponent, computed, onMounted } from 'vue';
    import Spinner from '@/components/Utilities/Spinner.vue';
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import InputGroup from '@/components/Forms/InputGroup.vue';
    import type { Content, Product, Stocks} from '@/services/serviceInterface';
    import { useConfigStore } from '@/stores/config';
    import { useAuthStore } from '@/stores/auth';
    import type Option from '../../../src/components/Utilities/interfaceModel';
    import { createstocks, fetchProduct } from '@/services/database';
    import EventBus from '@/EventBus';
    import type ToastPayload from '@/types/Toast';

    const SelectGroupOne = defineAsyncComponent(() => import('@/components/Forms/SelectGroup/SelectGroupOne.vue'));
    const configStore = useConfigStore();
    const authStore = useAuthStore();
    const isSaving = ref<Boolean>(false);
    const products = ref<Product[]>([]);
    const _token = authStore.jwt;
    const restaurantCode = authStore.restaurantCode;
    const stockForms = ref<Stocks[]>([{
        "code": "",
        "quantity": 0,
    }]);
    
    const emits = defineEmits(['cancel', "save", "back", "created"]);
    const props = defineProps({
        action: {
            type: String,
        },
        stock: {
            type: Object as () => Stocks
        }
    });

    // Récupérer la liste des produits pour le select
    const fetchProductsList = async() => {
        try {
            const result = await fetchProduct(_token, restaurantCode);
            products.value = Array.isArray(result) ? result : [result];
        } catch(error) {
            console.error('error.fetchProducts', error);
            EventBus.emit('showToast', {
                type: "danger",
                message: "Erreur lors du chargement des produits"
            });
        }
    }

    // Options pour le select des produits
    const productOptions = computed<Option[]>(() => {
        return products.value.map(item => ({
            name: item.Title,
            api: item.Code
        })); 
    });

    // Ajouter un nouveau formulaire de stock
    const addStockForm = () => {
        stockForms.value.push({
            "code": "",
            "quantity": 0,
        });
    }

        const resetForms = () => {
        stockForms.value = [{
            "code": "",
            "quantity": 0,
        }];
    }
    // Supprimer un formulaire de stock
    const removeStockForm = (index: number) => {
        if (stockForms.value.length > 1) {
            stockForms.value.splice(index, 1);
        } else {
            EventBus.emit('showToast', {
                type: "warning",
                message: "Vous devez avoir au moins un formulaire de stock"
            });
        }
    }

    // Sauvegarder les stocks
/*     const saveStock = async () => {
       try {
            isSaving.value = true;
            let result: any = null;

            const payload = stockForms.value.map(form => ({
                code: form.code,
                quantity: form.quantity,
            }));

            if(props.action == "add") {
                result = await createstocks(payload, _token);
                console.log('data.create', result)
            } else if(props.action == "update") {
                // result = await updateStock(payload);
            }

            EventBus.emit('showToast', {
                type: "success",
                message: `Stock${payload.length > 1 ? 's' : ''} ${props.action == "update" ? "mis à jour" : "ajouté"} avec succès`
            });
            resetForms();
            emits('created', true);
       } catch (error: any) {
            const errMsg = error.response?.data?.body?.errors?.[0]?.message || "Une erreur s'est produite lors de l'opération";
            EventBus.emit('showToast', {
                type: "danger",
                message: errMsg
            });
       } finally {
            isSaving.value = false;
       }
    }
 */
    const stopAction = () => {
        resetForms();
        emits('cancel');
    }

    const getActionLabel = (act: string | undefined) => {
        switch (act) {
            case "edit": return "Mettre à jour";
            case "clone": return "Cloner";
            case "add": return "Save ";
            default: return "Mettre à jour";
        }
    }

    const goBack = () => {
        emits('back');
    }

    onMounted(() => {
        fetchProductsList();
        
        if(props.action == "update" && props.stock) {
            stockForms.value = [props.stock];
        }
    });
</script>

<template>
    <div class="grid grid-cols-1 gap-12 sm:grid-cols-1">
        <div class="flex flex-col gap-9">
            <DefaultCard :cardTitle="`${getActionLabel(props.action)} Exit${stockForms.length > 1 ? 's' : ''}`">
                <template v-slot:button>
                    <button class="flex items-center" @click="goBack">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        <span class="text-nowrap ml-2">Retour</span>
                    </button>
                </template>
                
                <form @submit.prevent="">
                    <div class="p-6.5">
                        <div v-for="(stockInfo, index) in stockForms" :key="index" class="mb-8 relative">
                            <div class="mb-4.5 flex flex-col gap-6 xl:flex-row items-start">
                                <select-group-one 
                                    label="Produit" 
                                    :options="productOptions" 
                                    placeholder="Sélectionnez un produit"
                                    class="w-full xl:w-1/2" 
                                    v-model="stockInfo.code" 
                                    required
                                />
                                <input-group 
                                    label="Quantité" 
                                    type="number" 
                                    min="0"
                                    step="1"
                                    placeholder="0"
                                    customClasses="w-full xl:w-1/2" 
                                    v-model="stockInfo.quantity" 
                                    required
                                />
                            </div>
                            
                            <!-- Bouton pour supprimer le formulaire -->
                            <button 
                                v-if="stockForms.length > 1"
                                @click="removeStockForm(index)"
                                type="button"
                                class="absolute -right-2 -top-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                                title="Supprimer ce stock"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                                </svg>
                            </button>
                        </div>

                        <!-- Bouton pour ajouter un nouveau formulaire -->
                        <button 
                            @click="addStockForm"
                            type="button"
                            class="flex items-center text-blue-500 hover:text-blue-700 mb-6"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                             New Exit
                        </button>

                        <div class="flex justify-end mt-10 gap-4">
                            <button-action 
                                @click="stopAction" 
                                custom-classes="text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                                Annuler
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