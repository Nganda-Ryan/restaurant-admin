<script setup lang="ts">
    import { ref, defineAsyncComponent, computed, onMounted } from 'vue';
    import Spinner from '@/components/Utilities/Spinner.vue';
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import InputGroup from '@/components/Forms/InputGroup.vue';
    import type { Content, Product, Stocks} from '@/services/serviceInterface';
    import { useConfigStore } from '@/stores/config';
    import type Option from '../../../src/components/Utilities/interfaceModel';
    import { createstocks, fetchProduct } from '@/services/database';
    import EventBus from '@/EventBus';
    import type ToastPayload from '@/types/Toast';

    const SelectGroupOne = defineAsyncComponent(() => import('@/components/Forms/SelectGroup/SelectGroupOne.vue'));
    const configStore = useConfigStore();
    const isSaving = ref<Boolean>(false);
    const products = ref<Product[]>([]);
    const stocks = ref<Stocks[]>([]);
    
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
            const result = await fetchProduct();
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

    // Données du formulaire stock
    const stockInfo = ref<Stocks>({
        "code": "",
        "quantity": 0,
    });

    // Sauvegarder le stock
const saveStock = async () => {
   try {
        isSaving.value = true;
        let result: any = null;

        const payload = [
            {
                code: stockInfo.value.code,
                quantity: stockInfo.value.quantity,
            }
        ];

        if(props.action == "add") {
            result = await createstocks(payload);
            console.log('data.create', result)
        } else if(props.action == "update") {
            // result = await updateStock(payload);
        }

        EventBus.emit('showToast', {
            type: "success",
            message: `Stock ${props.action == "update" ? "mis à jour" : "ajouté"} avec succès`
        });

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


    const stopAction = () => {
        emits('cancel');
    }

    const getActionLabel = (act: string | undefined) => {
        switch (act) {
            case "edit": return "Mettre à jour";
            case "clone": return "Cloner";
            case "add": return "Enregistrer";
            default: return "Mettre à jour";
        }
    }

    const goBack = () => {
        emits('back');
    }

    onMounted(() => {
        fetchProductsList();
        
        if(props.action == "update" && props.stock) {
            stockInfo.value = props.stock;
        }
    });
</script>

<template>
    <div class="grid grid-cols-1 gap-12 sm:grid-cols-1">
        <div class="flex flex-col gap-9">
            <DefaultCard :cardTitle="`${getActionLabel(props.action)} Stock`">
                <template v-slot:button>
                    <button class="flex items-center" @click="goBack">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        <span class="text-nowrap ml-2">Retour</span>
                    </button>
                </template>
                
                <form @submit.prevent="saveStock">
                    <div class="p-6.5">
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