<script setup lang="ts">
    import { ref, defineAsyncComponent, computed, onMounted } from 'vue';
    import Spinner from '@/components/Utilities/Spinner.vue';
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import InputGroup from '@/components/Forms/InputGroup.vue';
    import type { Content, Product } from '@/services/serviceInterface';
    import { useConfigStore } from '@/stores/config';
    import type Option from '../../../src/components/Utilities/interfaceModel';
    import { createProduct, generateCode, createContent, updateProduct, uploadContent } from '@/services/database';
    import EventBus from '@/EventBus';
    import type ToastPayload from '@/types/Toast';
    const SelectGroupOne = defineAsyncComponent(() => import('@/components/Forms/SelectGroup/SelectGroupOne.vue'));

    const configStore = useConfigStore();
    const isSaving = ref<Boolean>(false);
    const emits = defineEmits(['cancel', "save", "back", "created"]);
    const props = defineProps({
        action: {
            type: String,
        },
        product: {
            type: Object
        }
    });

    const productInfo = ref<Product>({
        "Code": "",
        "Title": "",
        "Description": "",
        "QuantityUnitCode": "UNIT",
        "AvailableQuantity": 0,
        "CategoryCode": "",
        "Image": "",
        "PrixUnitaire": 0,
        "DateEntrée": new Date().toISOString().split('T')[0]
    });

    const saveProduct = async () => {
       try {
            let result:any = null;
            let result2:any = null;
            
            if(productInfo.value.Title) {
                productInfo.value.Code = props.action == "add" ? generateCode(productInfo.value.Title) : productInfo.value.Code;
            }

            const payload = {
                ...productInfo.value,
                AvailableQuantity: Number(productInfo.value.AvailableQuantity),
                PrixUnitaire: Number(productInfo.value.PrixUnitaire)
            };

            isSaving.value = true;
            
            if(props.action == "add"){
                result = await createProduct(payload);
                if(result[0] && result[0].success == true && productInfo.value.Image){
                    const uploadDedImage = await uploadContent(productInfo.value.Image);
                    if(uploadDedImage){
                        const payload2:Content [] = [{
                            "ProductCode": productInfo.value.Code,
                            "Body": productInfo.value.Description,
                            "TypeCode": "DESC",
                            "DisplayOrder": 1
                        },{
                            "ProductCode": productInfo.value.Code,
                            "Body": uploadDedImage,
                            "TypeCode": "COVER",
                            "DisplayOrder": 2
                        }]
                        result2 = await createContent(payload2);
                    }
                }
            } else if(props.action == "update") {
                result = await updateProduct(payload);
            }
            
            const toastPayload: ToastPayload = {
                type: "success",
                message: `Produit ${props.action == "update" ? "mis à jour" : "créé"} avec succès`
            }
            EventBus.emit('showToast', toastPayload);
            
            emits('created', true);
       } catch (error:any) {
            const errMsg = error.response?.data?.body?.errors?.[0]?.message || "Une erreur s'est produite lors du traitement";
            const payload: ToastPayload = {
                type: "danger",
                message: errMsg
            }
            EventBus.emit('showToast', payload);
       } finally {
            isSaving.value = false;
       }
    }

    const categoryOption = computed(() => {
        return configStore.productCategories.map((prodCat: any) => ({
            name: prodCat.Title,
            api: prodCat.Code
        })) as Option[];
    });
    
    const unitOptions : Option[] = [
        { "name": "Unité", "api": "UNIT" },
        { "name": "Kilogramme", "api": "KG" },
        { "name": "Gramme", "api": "G" },
        { "name": "Litre", "api": "L" },
        { "name": "Pièce", "api": "PC" }
    ];

    const stopAction = () => {
        emits('cancel');
    }

    const getAction = (act:string | undefined) => {
        switch (act) {
            case "edit": return "Mettre à jour";
            case "clone": return "Cloner";
            case "add": return "Save";
            default: return "Mettre à jour";
        }
    }

    const goBack = () => {
        emits('back');
    }

    onMounted(() => {
        if(props.action == "update" && props.product){
            productInfo.value = props.product;
            if (!productInfo.value.DateEntrée) {
                productInfo.value.DateEntrée = new Date().toISOString().split('T')[0];
            }
        } else if (props.action == "add") {
            // Set default date for new entries
            productInfo.value.DateEntrée = new Date().toISOString().split('T')[0];
        }
    });
</script>

<template>
    <div class="grid grid-cols-1 gap-12 sm:grid-cols-1">
        <div class="flex flex-col gap-9">
            <DefaultCard :cardTitle="`${getAction(props.action)} Entry`">
                <template v-slot:button>
                    <button class="flex items-center" @click="goBack">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        <span class="text-nowrap ml-2">Go Back</span>
                    </button>
                </template>
                
                <form @submit.prevent="saveProduct">
                    <div class="p-6.5">
                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row items-start">
                            <input-group 
                                label="Titre" 
                                type="text" 
                                placeholder="Nom du produit"
                                customClasses="w-full xl:w-1/2" 
                                v-model="productInfo.Title" 
                                required 
                            />
                            <select-group-one 
                                label="Catégorie" 
                                :options="categoryOption" 
                                placeholder="Sélectionnez une catégorie"
                                class="w-full xl:w-1/2" 
                                v-model="productInfo.CategoryCode" 
                                required
                            />
                        </div>

                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row items-start">
                            <input-group 
                                label="Quantité" 
                                type="number" 
                                min="0"
                                placeholder="0"
                                customClasses="w-full xl:w-1/3" 
                                v-model="productInfo.AvailableQuantity" 
                                required 
                            />
                            <select-group-one 
                                label="Unité" 
                                :options="unitOptions" 
                                placeholder="Sélectionnez l'unité"
                                class="w-full xl:w-1/3" 
                                v-model="productInfo.QuantityUnitCode" 
                                required
                            />
                            <input-group 
                                label="Prix Unitaire" 
                                type="number" 
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                customClasses="w-full xl:w-1/3" 
                                v-model="productInfo.PrixUnitaire" 
                                required
                            />
                        </div>

                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row items-start">
                            <input-group 
                                label="Date d'entrée" 
                                type="date" 
                                customClasses="w-full xl:w-1/2" 
                                v-model="productInfo.DateEntrée" 
                                required
                            />
                            <input-group 
                                label="Image du produit" 
                                type="file" 
                                accept="image/*"
                                customClasses="w-full xl:w-1/2" 
                                v-model="productInfo.Image" 
                            />
                        </div>
                        <div class="mb-4.5">
                            <input-group 
                                label="Description" 
                                type="textarea" 
                                placeholder="Description du produit"
                                customClasses="w-full" 
                                v-model="productInfo.Description" 
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
                                {{ getAction(props.action) }}
                            </button-action>
                        </div>
                    </div>
                </form>
            </DefaultCard>
        </div>
    </div>
</template>