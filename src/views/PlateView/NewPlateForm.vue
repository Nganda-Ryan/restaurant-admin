<script setup lang="ts">
    import { ref, defineAsyncComponent, computed, onMounted, onBeforeMount } from 'vue';
    import router from '@/router';
    import Spinner from '@/components/Utilities/Spinner.vue';
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import { useConfigStore } from '@/stores/config';
    import type { PlateOption, Content, Composition, Compositions, ProductOption, ResultItem, ApiResponse, composition, NutritionalOption } from '@/services/serviceInterface';
    import { Cloudinary } from "@cloudinary/url-gen";
    import { AdvancedImage, placeholder } from "@cloudinary/vue";
    import { fill } from "@cloudinary/url-gen/actions/resize";
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import InputGroup from '@/components/Forms/InputGroup.vue';
    import SelectGroupSearchable from '@/components/Forms/SelectGroup/SelectGroupSearchable.vue';
    import type Option from '../../../src/components/Utilities/interfaceModel';
    const SelectGroupOne = defineAsyncComponent(() => import('@/components/Forms/SelectGroup/SelectGroupOne.vue'));
    import { fetchContent, uploadContent, createPlate, generateCode, createContent, fetchProduct, updatePlate, getConsistency, createConsistency, fetchPlate, UpdateConsistency, updateContent } from '@/services/database';
    import type ToastPayload from '@/types/Toast';
    import EventBus from '@/EventBus';
    import TableOne from '@/components/Tables/TableOne.vue';

    

    const storedData = localStorage.getItem('profiles');

    const dataArray = storedData ? JSON.parse(storedData) : [];

    const restaurantCode = dataArray[0]?.RestaurantCode ?? '';
    const currency = localStorage.getItem('currency');
    const configStore = useConfigStore();
    const isSaving = ref<Boolean>(false);
    const isProductList = ref<Boolean>(false);
    const emits = defineEmits(['cancel', "save", "back", "created"]);
    const props = defineProps({
        action: {
            type: String,
        },
        plate: {
            type: Object,
            default: () => ({})
        }
    });

    const plateInfo = ref<PlateOption>({
        "Code": '',
        "Title": '',
        "Description": '',
        "Currency": "",
        "CategoryCode": '',
        "BasePrice": 0,
        Image: "",
        "RestaurantCode": restaurantCode
    });

    const productList = ref<Array<ProductOption>>([]);
    const productListToadd = ref<Array<ProductOption>>([])
    const selectedItem = ref<any>(null);
    const quantity = ref<number>(1);
    const producQuantity = ref<number>(1);
    const resetInput = ref<boolean>(false);
    const reloadView = ref<boolean>(false);
    const rawProduct = ref<any[]>([]);

    const titles = ref([
        {
            label: 'Title',
            name: "name",
            type: 'url',
            event: "view",
            filterable: false,
            inputField: {
                placeholder: 'Enter the value',
                type: 'text'
            }
        },
        {
            name: 'quantity',
            type: "text",
            label: 'Quantity',
            filterable: true,
            class: 'aligned-column'
        },
        {
            name: 'Actions',
            type: 'action',
            label: 'Actions',
            actions: [
                {
                    name: "Increment",
                    icone: `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                        </svg>
                        `,
                    event: 'increment'
                },
                {
                    name: "Decrement",
                    icone: `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                            <path fill-rule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" clip-rule="evenodd" />
                        </svg>
                    `,
                    event: 'decrement'
                },
                {
                    name: "Remove",
                    icone: `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                            <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                        </svg>
                    `,
                    event: 'remove'
                },
            ]
        }
    ]);

    const filterOptions = ref([]);

    const stopAction = () => {
        emits('cancel', reloadView.value);
    }

    const getAction = (act: string | undefined) => {
        switch (act) {
            case "edit":
                return "Update"
            case "add":
                return "Save"
            default:
                return "Update"
        }
    }

    const goBack = () => {
        emits('cancel', false);
    }

    const categoryOption = computed(() => {
        const result = configStore.plateCategories.map((plateCat: any) => {
            return {
                name: plateCat.Title,
                api: plateCat.Code
            }
        }) as Option[]

        return result;
    })

    const savePlate = async () => {
        try {
            isSaving.value = true;

            if (props.action === "update") {
                plateInfo.value.Code = props.plate.Code;
            } else if (props.action == "add" && plateInfo.value.Title) {
                plateInfo.value.Code = generateCode(plateInfo.value.Title);
            }

            const payload = {
                ...plateInfo.value,
                Currency: currency ?? ''
            }
            let result;
            let createdCtn = '';
            let createdCtn2 = '';

            if (props.action == "add") {
                console.log('data.plate', payload)
                result = await createPlate(payload);
                if (result && result[0].success) {
                    if (plateInfo.value.Code != undefined) {
                        const ctnList1: Compositions[] = [];
                        productListToadd.value.forEach(p1 => {
                            rawProduct.value.forEach(p2 => {
                                if (p1.api === p2.Code) {
                                    if (plateInfo.value.Code) {
                                        ctnList1.push({
                                            "ProductCode": p1.api,
                                            "PlateCode": plateInfo.value.Code,
                                            "QuantityOfConsumption": p1.quantity,
                                        });
                                    }
                                }
                            });
                        });

                        createdCtn = await createConsistency(ctnList1);

                        const CtnList2: Content[] = [];
                        let ingredients = '';
                        productListToadd.value.forEach(p1 => {
                            rawProduct.value.forEach(p2 => {
                                if (p1.api == p2.Code) {
                                    const inputFieldValue = p1.inputField || '';
                                    ingredients += (ingredients ? '; ' : '') + `${p2.Title} : ${inputFieldValue}`;
                                }
                            });
                        });
                        CtnList2.push({
                            "PlatCode": plateInfo.value.Code,
                            "Body": ingredients,
                            "DisplayOrder": 1,
                            "TypeCode": "ING"
                        });
                        createdCtn = await createContent(CtnList2);

                        if (plateInfo.value.Image) {
                            const uploadedCtn = await uploadContent(plateInfo.value.Image)
                            if (uploadedCtn) {
                                const ctnList: Content[] = [{
                                    "PlatCode": plateInfo.value.Code,
                                    "Body": uploadedCtn,
                                    "DisplayOrder": 1,
                                    "TypeCode": 'COVER'
                                }]
                                createdCtn2 = await createContent(ctnList);
                            }
                        }
                    }
                    router.push({ path: '/plates' })
                }
            } else if (props.action === "update") {
                if (plateInfo.value.Title !== props.plate.Title ||
                    plateInfo.value.Description !== props.plate.Description ||
                    plateInfo.value.CategoryCode !== props.plate.CategoryCode ||
                    plateInfo.value.BasePrice !== props.plate.BasePrice) {
                    result = await updatePlate(plateInfo.value);
                }

                if (plateInfo.value.Code !== undefined) {
                    const newProducts: Compositions[] = [];
                    const existingProducts: composition[] = [];
                    const productsToRemove: composition[] = [];

                    productListToadd.value.forEach(p1 => {
                        const matchingProduct = rawProduct.value.find(p2 => p1.api === p2.Code);
                        if (matchingProduct) {
                            if (plateInfo.value.Code) {
                                if (p1.Id) {
                                    if (p1.quantity > 0) {
                                        existingProducts.push({
                                            "Id": p1.Id,
                                            "ProductCode": p1.api,
                                            "PlateCode": plateInfo.value.Code,
                                            "QuantityOfConsumption": p1.quantity,
                                        });
                                    } else {
                                        productsToRemove.push({
                                            "Id": p1.Id,
                                            "ProductCode": p1.api,
                                            "PlateCode": plateInfo.value.Code,
                                            "QuantityOfConsumption": 0,
                                        });
                                    }
                                } else {
                                    newProducts.push({
                                        ProductCode: p1.api,
                                        PlateCode: plateInfo.value.Code,
                                        QuantityOfConsumption: p1.quantity,
                                    });
                                }
                            }
                        }
                    });

                    if (newProducts.length > 0) {
                        await createConsistency(newProducts);
                    }

                    if (existingProducts.length > 0) {
                        for (const product of existingProducts) {
                            await UpdateConsistency({
                                Id: product.Id,
                                ProductCode: product.ProductCode,
                                PlateCode: product.PlateCode,
                                QuantityOfConsumption: product.QuantityOfConsumption,
                            });
                        }
                    }

                    if (productsToRemove.length > 0) {
                        for (const product of productsToRemove) {
                            await UpdateConsistency({
                                Id: product.Id,
                                ProductCode: product.ProductCode,
                                PlateCode: product.PlateCode,
                                QuantityOfConsumption: 0,
                            });
                            productListToadd.value = productListToadd.value.filter(p => p.Id !== product.Id);
                        }
                    }
                }

                // Récupérer le contenu ING existant
                const existingContent = await fetchContent(plateInfo.value.Code || '');
                let ingContent = existingContent.body.results.flatMap((r: any) =>
                    r.content.filter((c: any) => c.TypeCode === "ING")
                )[0];

                let ingredients = '';
                const validProducts = productListToadd.value.filter(p => p.quantity > 0);
                
                validProducts.forEach(p1 => {
                    rawProduct.value.forEach(p2 => {
                        if (p1.api == p2.Code) {
                            const inputFieldValue = p1.inputField || '';
                            ingredients += (ingredients ? '; ' : '') + `${p2.Title} : ${inputFieldValue}`;
                        }
                    });
                });

                if (ingContent) {
                    // Mettre à jour le contenu existant
                    await updateContent({
                        ...ingContent,
                        Body: ingredients
                    });
                } else if (ingredients) {
                    // Créer un nouveau contenu seulement si nécessaire
                    const ctnList2: Content[] = [{
                        "PlatCode": plateInfo.value.Code || '',
                        "Body": ingredients,
                        "DisplayOrder": 1,
                        "TypeCode": "ING",
                    }];
                    await createContent(ctnList2);
                }

                if (plateInfo.value.Image) {
                    const uploadDedImage = await uploadContent(plateInfo.value.Image);
                    if (uploadDedImage) {
                        const uploadedCtn = await uploadContent(plateInfo.value.Image)
                        if (uploadedCtn) {
                            const ctnList: Content[] = [{
                                "PlatCode": plateInfo.value.Code,
                                "Body": uploadedCtn,
                                "DisplayOrder": 2,
                                "TypeCode": 'COVER'
                            }]
                            await createContent(ctnList);
                        }
                    }
                }
            }

            const toastPayload: ToastPayload = {
                type: "success",
                message: `Plate ${props.action == "update" ? "Updated" : "Created"} successfully. Happy meal ;P`
            }
            plateInfo.value = {
                "Code": '',
                "Title": '',
                "Description": '',
                "Currency": '',
                "CategoryCode": '',
                "BasePrice": 0,
                Image: "",
                RestaurantCode: restaurantCode
            };
            productListToadd.value = [];
            reloadView.value = true;
            EventBus.emit('showToast', toastPayload);

        } catch (error: any) {
            console.log('error: ', error);
            console.log('Trace', error.stack)
            const errMsg = error ? error : "Oups, something went wrong during the processing";
            const payload: ToastPayload = {
                type: "danger",
                message: errMsg
            }
            EventBus.emit('showToast', payload);
        } finally {
            isSaving.value = false;
        }
    }

    const handleSelection = (item: string) => {
        selectedItem.value = item;
    }

    const handdleAddProduct = () => {
        if (productList.value.length <= 0 || !selectedItem.value) { return }

        const existingProduct = productListToadd.value.find(item => item.api === selectedItem.value.api);

        if (existingProduct) {
            existingProduct.quantity += producQuantity.value;
        } else {
            productListToadd.value.push({
                ...selectedItem.value,
                inputField: '',
                quantity: producQuantity.value,
            });
        }
        selectedItem.value = null;
        isProductList.value = true;
        productList.value = productList.value.filter(item1 => !productListToadd.value.some(item2 => item2.api == item1.api));

        productListToadd.value.sort((a, b) => {
            const nameA = a.name ?? '';
            const nameB = b.name ?? '';
            return nameA.localeCompare(nameB);
        });

        productList.value.sort((a, b) => {
            const nameA = a.name ?? '';
            const nameB = b.name ?? '';
            return nameA.localeCompare(nameB);
        });

        resetInput.value = !resetInput.value;
        producQuantity.value = 1;
    }

    const handleRemovePlace = (ts: any) => {
        const productToAddBack = rawProduct.value.find(p => p.Code === ts.api);
        if (productToAddBack) {
            productList.value.push({
                name: `${productToAddBack.Title} (${productToAddBack.QuantityUnitCode})`,
                api: productToAddBack.Code,
                quantity: productToAddBack.quantity
            });
        }

        productListToadd.value = productListToadd.value.filter(item => item.api !== ts.api);

        productListToadd.value.sort((a, b) => {
            const nameA = a.name ?? '';
            const nameB = b.name ?? '';
            return nameA.localeCompare(nameB);
        });

        productList.value.sort((a, b) => {
            const nameA = a.name ?? '';
            const nameB = b.name ?? '';
            return nameA.localeCompare(nameB);
        });
    }

    const handleIncrement = (ts: any) => {
        productListToadd.value = productListToadd.value.map(item => {
            if (item.api == ts.api) {
                return {
                    ...item,
                    quantity: item.quantity + 1
                }
            }
            return item;
        })
    }

const handleDecrement = (ts: any) => {
    productListToadd.value = productListToadd.value
        .map(item => {
            if (item.api == ts.api) {
                const newQuantity = item.quantity - 1;
                if (newQuantity <= 0) {
                    return null; 
                }
                return {
                    ...item,
                    quantity: newQuantity
                }
            }
            return item;
        })
        .filter((item): item is ProductOption => item !== null); 

    if (ts.quantity <= 1) {
        handleRemovePlace(ts);
    }
}
    const getProduct = async () => {
        const result = await fetchProduct();
        rawProduct.value = result;
        productList.value = result.map((item: any) => {
            return {
                name: `${item.Title} (${item.QuantityUnitCode})`,
                api: item.Code
            }
        })
        productList.value.sort((a, b) => {
            const nameA = a.name ?? '';
            const nameB = b.name ?? '';
            return nameA.localeCompare(nameB);
        });
    }

    onBeforeMount(async () => {
        await getProduct();
        await fetchPlate()
        if (props.action === "update") {
            if (props.plate) {
                plateInfo.value = {
                    ...props.plate,
                    RestaurantCode: props.plate.RestaurantCode || restaurantCode
                };
                const plateCode = props.plate.Code

                const contentResponse = await fetchContent(plateCode);
                const consistencyResponse: ApiResponse = await getConsistency(plateCode);

                const ingredientMap = contentResponse.body.results.flatMap((result: any) =>
                    result.content
                        .filter((item: any) => item.TypeCode === "ING")
                        .map((item: any) => {
                            const bodyParts = item.Body.split(';');
                            return bodyParts.map((part: any) => {
                                const [name, value] = part.split(':').map((p: any) => p.trim());
                                return { name, value: value || '' };
                            });
                        })
                ).flat();

                const ingredientDict = Object.fromEntries(ingredientMap.map((ing: any) => [ing.name, ing.value]));

                if (consistencyResponse.body && consistencyResponse.body.results) {
                    const results: ResultItem[] = consistencyResponse.body.results;
                    if (results.length > 0 && Array.isArray(results[0].composition)) {
                        const uniqueIngredients = new Set();

                        productListToadd.value = results.flatMap(result =>
                            result.composition
                                .filter(item => !uniqueIngredients.has(item.Product.Title))
                                .map((item: Composition) => {
                                    uniqueIngredients.add(item.Product.Title);
                                    const inputFieldValue = ingredientDict[item.Product.Title] || '';
                                    return {
                                        name: `${item.Product.Title} (${item.Product.QuantityUnitCode})`,
                                        api: item.Product.Code,
                                        quantity: item.QuantityOfConsumption,
                                        Id: item.Id,
                                        inputField: inputFieldValue
                                    };
                                })
                        );
                    }
                }

                productList.value = productList.value.filter(item =>
                    !productListToadd.value.some(p => p.api === item.api)
                );
            }
        }
    });
</script>

<template>
    <div class="grid grid-cols-1 gap-12 sm:grid-cols-1">
        <div class="flex flex-col gap-9">
            <DefaultCard :cardTitle="`${getAction(props.action)} Plate`">
                <template v-slot:button>
                    <button class="flex items-center" @click="goBack">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>&nbsp;&nbsp;
                        <span class="text-nowrap">{{ 'Go back' }}</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                    </button>
                </template>

                <form @submit.prevent="savePlate">
                    <div class="p-6.5">
                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row items-start">
                            <input-group label="Title" type="text" placeholder="Enter the product title"
                                customClasses="w-full xl:w-1/2" v-model="plateInfo.Title" required />
                            
                            <div class="w-full xl:w-1/2">
                                <label class="mb-2 block text-black dark:text-white">
                                    Price <span class="text-meta-1">*</span>
                                </label>
                                <input min="1" type="number" v-model="plateInfo.BasePrice" required class="w-full rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 h-[38px] px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50" />
                            </div>
                        </div>

                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row items-start">
                            <select-group-one label="Category" :options="categoryOption" :placeholder="'Select the category'"
                                class="w-full xl:w-1/2" v-model="plateInfo.CategoryCode" required/>
                            <input-group label="Cover" type="file" placeholder=""
                                customClasses="w-full xl:w-1/2" v-model="plateInfo.Image"/> 
                        </div>
                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row items-start">
                            <SelectGroupSearchable customClasses="w-full xl:w-1/2" :items="productList" @item-selected="handleSelection" label="Select a product" placeholder="Select a product ..." :required="false" :resetTrigger="resetInput">
                                <template v-slot:action>
                                    <input min="1" type="number" v-model="producQuantity" required class="w-15 h-10 rounded border-[1.5px] text-black border-stroke bg-transparent ml-2 py-1.5 px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black  dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
                                    <button-action @click='handdleAddProduct' type="button" custom-classes=" mx-2 h-10 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm mr-0 py-2.5 text-center">
                                        add
                                    </button-action>
                                </template>
                            </SelectGroupSearchable>
                            <input-group label="Describe the menu" type="textarea" placeholder="Enter the description of your menu" 
                                customClasses="w-full xl:w-1/2" v-model="plateInfo.Description" required />
                        </div>
            
                        <div class="w-full px-6 font-bold gap-2.5 py-2  mb-10 mt-8 hover:bg-opacity-90 lg:px-6 xl:px-6 text-white bg-gradient-to-r from-olive-800 to-olive-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 text-sm me-2">
                          INGEDIENTS LIST
                        </div>
                        <div v-if="productListToadd.length > 0">
                            <TableOne :items="titles" :datas="productListToadd" :options="filterOptions" :inputField="''" @remove="handleRemovePlace" @increment="handleIncrement" @decrement="handleDecrement" :filterable="false" :pagination="false"/>                          
                        </div>
                        <div v-else class="text-center py-4"> 
                            Please add a plate;
                        </div>

                        <div class="flex justify-end mt-10">
                            <button @click="stopAction" type="button" class="text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
                                {{ 'Cancel' }}
                            </button>
                            <button type="submit" class="flex flex-nowrap text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
                                <spinner v-if="isSaving" /> {{ getAction(props.action)}}
                            </button>
                        </div>
                    </div>
                </form>
            </DefaultCard>
        </div>
    </div>
    <div>
    </div>
</template>

<style>
.aligned-column {
    display: flex;
    align-items: center;
    padding-left: 10px;
}
</style>