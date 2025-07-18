<script setup lang="ts">
    import { ref, defineAsyncComponent, computed, onMounted, onBeforeMount } from 'vue';
    import router from '@/router';
    import Spinner from '@/components/Utilities/Spinner.vue';
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import { useConfigStore } from '@/stores/config';
    import { useAuthStore } from '@/stores/auth';
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
    import { QuillEditor } from '@vueup/vue-quill';
    import '@vueup/vue-quill/dist/vue-quill.snow.css';

    const fileInput = ref<HTMLInputElement | null>(null)
    const authStore = useAuthStore();
    const _token = authStore.jwt;
    const restaurantCode = authStore.restaurantCode;
    const currency = localStorage.getItem('currency');
    const configStore = useConfigStore();
    const isSaving = ref<Boolean>(false);
    const isProductList = ref<Boolean>(false);
    const content = ref<string>("<p>Éditez-moi !</p>");
    const existingContents = ref<Content[]>([]);
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
    const imagePreviews = ref<Array<{ 
    file: File; 
    url: string; 
    name: string;
    type: 'image' | 'video'
    }>>([]);

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
    const saveContent = ( event: Event) => {
        console.log(content.value);
        event.stopPropagation();
        event.preventDefault();
    };
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
    const errorMessage = ref<string>('');

    function handleFiles(event: Event) {
        const target = event.target as HTMLInputElement;
        const files = Array.from(target.files ?? []);
        
        files.forEach((file) => {
            // Vérifie si c'est une image ou une vidéo
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                EventBus.emit('showToast', {
                    type: 'danger',
                    message: `Le fichier ${file.name} n'est pas une image ou vidéo valide.`
                });
                return;
            }

            if (file.size > 50 * 1024 * 1024) { // Augmentez la limite à 50MB pour les vidéos
                EventBus.emit('showToast', {
                    type: 'danger',
                    message: `Le fichier ${file.name} ne peut pas dépasser 50MB.`
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreviews.value.push({
                    file,
                    url: e.target?.result as string,
                    name: file.name,
                    type: file.type.startsWith('video/') ? 'video' : 'image'
                });
            };
            reader.readAsDataURL(file);
        });

        errorMessage.value = '';
    }

    const removeImage = (index: number, event: Event) => {
        event.stopPropagation();
        event.preventDefault();
        imagePreviews.value.splice(index, 1);
    }

    const savePlate = async () => {
            try {
                isSaving.value = true;

                // Génération ou récupération du code de plat
                if (props.action === "update") {
                    plateInfo.value.Code = props.plate.Code;
                } else if (props.action == "add" && plateInfo.value.Title) {
                    plateInfo.value.Code = generateCode(plateInfo.value.Title);
                }

                const payload = {
                    ...plateInfo.value,
                    Currency: currency ?? ''
                };

                if (props.action == "add") {
                    // Création d'un nouveau plat
                    const result = await createPlate(payload, _token);
                    if (result && result[0].success && plateInfo.value.Code) {
                        // Création des compositions de produits
                        const compositions = productListToadd.value
                            .filter(p1 => rawProduct.value.some(p2 => p1.api === p2.Code))
                            .map(p1 => ({
                                "ProductCode": p1.api,
                                "PlateCode": plateInfo.value.Code ?? '',
                                "QuantityOfConsumption": p1.quantity
                            }));
                        
                        if (compositions.length) await createConsistency(compositions, _token);

                        // Création du contenu INGREDIENTS
                        const ingredients = productListToadd.value
                            .map(p1 => {
                                const product = rawProduct.value.find(p2 => p1.api == p2.Code);
                                return product ? `${product.Title} : ${p1.inputField || ''}` : '';
                            })
                            .filter(Boolean)
                            .join('; ');

                        await createContent([{
                            "PlatCode": plateInfo.value.Code,
                            "Body": ingredients,
                            "DisplayOrder": 1,
                            "TypeCode": "ING"
                        }], _token);

                        // Upload de l'image de couverture si fournie
                        if (plateInfo.value.Image) {
                            const uploadedCtn = await uploadContent(plateInfo.value.Image);
                            if (uploadedCtn) {
                                await createContent([{
                                    "PlatCode": plateInfo.value.Code,
                                    "Body": uploadedCtn,
                                    "DisplayOrder": 1,
                                    "TypeCode": 'COVER'
                                }], _token);
                            }
                        }
                        router.push({ path: '/plates' });
                    }
                } else if (props.action === "update") {
                    // UPDATE LOGIC

                    // 1. Mise à jour des infos de base si modifiées
                    if (plateInfo.value.Title !== props.plate.Title ||
                        plateInfo.value.Description !== props.plate.Description ||
                        plateInfo.value.CategoryCode !== props.plate.CategoryCode ||
                        plateInfo.value.BasePrice !== props.plate.BasePrice) {
                        await updatePlate(plateInfo.value, _token);
                    }

                    // 2. Gestion des produits/compositions
                    if (plateInfo.value.Code) {
                        const updates = {
                            new: [] as Compositions[],
                            existing: [] as composition[],
                            remove: [] as composition[]
                        };

                        productListToadd.value.forEach(p1 => {
                            const match = rawProduct.value.find(p2 => p1.api === p2.Code);
                            if (!match) return;

                            let item: composition;
                            if (p1.Id !== undefined) {
                                item = {
                                    ProductCode: p1.api,
                                    PlateCode: plateInfo.value.Code ?? '',
                                    QuantityOfConsumption: p1.quantity,
                                    Id: p1.Id
                                };
                                if (p1.quantity > 0) updates.existing.push(item);
                                else updates.remove.push(item);
                            } else {
                                item = {
                                    ProductCode: p1.api,
                                    PlateCode: plateInfo.value.Code,
                                    QuantityOfConsumption: p1.quantity
                                } as composition;
                                updates.new.push(item);
                            }
                        });

                        // Exécution en parallèle des opérations
                        await Promise.all([
                            updates.new.length && createConsistency(updates.new, _token),
                            ...updates.existing.map(p => UpdateConsistency(p, _token)),
                            ...updates.remove.map(p => UpdateConsistency({ ...p, QuantityOfConsumption: 0 }, _token))
                        ]);

                        // Nettoyage des produits supprimés
                        productListToadd.value = productListToadd.value.filter(p => 
                            !updates.remove.some(r => r.Id === p.Id)
                        );
                    }

                    // 3. Récupération des contenus existants
                    const existingContent = await fetchContent(plateInfo.value.Code || '', _token);
                    const allContents = existingContent.body.results.flatMap((r: any) => r.content);
                    
                    // 4. Gestion des ingrédients
                    const ingContent = allContents.find((c: any) => c.TypeCode === "ING");
                    const ingredients = productListToadd.value
                        .filter(p => p.quantity > 0)
                        .map(p1 => {
                            const product = rawProduct.value.find(p2 => p1.api == p2.Code);
                            return product ? `${product.Title} : ${p1.inputField || ''}` : '';
                        })
                        .filter(Boolean)
                        .join('; ');

                    if (ingContent) {
                        await updateContent({ ...ingContent, Body: ingredients }, _token);
                    } else if (ingredients) {
                        await createContent([{
                            "PlatCode": plateInfo.value.Code,
                            "Body": ingredients,
                            "DisplayOrder": 1,
                            "TypeCode": "ING"
                        }], _token);
                    }

                    // 5. Gestion des médias (images/vidéos)
                    if (imagePreviews.value.length > 0) {
                        const mediaContent = allContents.find((c: any) => 
                            c.TypeCode === "IMG" || c.TypeCode === "VIDEO_DESC"
                        );

                        const mediaUrls = (await Promise.all(
                            imagePreviews.value.map(preview => uploadContent(preview.file))
                        )).filter(Boolean) as string[];

                        if (mediaUrls.length) {
                            const mediaUpdate = {
                                PlatCode: plateInfo.value.Code,
                                Body: mediaUrls.join(','),
                                DisplayOrder: 2,
                                TypeCode: "IMG"
                            };

                            if (mediaContent) {
                                await updateContent({ ...mediaContent, ...mediaUpdate }, _token);
                            } else {
                                await createContent([mediaUpdate], _token);
                            }
                        }
                    }

                    // 6. Gestion de l'image de couverture
                    if (plateInfo.value.Image && plateInfo.value.Image !== props.plate.Image) {
                        const coverContent = allContents.find((c: any) => c.TypeCode === "COVER");
                        const uploadedCtn = await uploadContent(plateInfo.value.Image);

                        if (uploadedCtn) {
                            const coverUpdate = {
                                PlatCode: plateInfo.value.Code,
                                Body: uploadedCtn,
                                DisplayOrder: 1,
                                TypeCode: "COVER"
                            };

                            if (coverContent) {
                                await updateContent({ ...coverContent, ...coverUpdate }, _token);
                            } else {
                                await createContent([coverUpdate], _token);
                            }
                        }
                    }
                }

                // Succès
                EventBus.emit('showToast', {
                    type: "success",
                    message: `Plate ${props.action == "update" ? "Updated" : "Created"} successfully`
                });

                // Réinitialisation si ajout
                if (props.action === "add") {
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
                }

            } catch (error: any) {
                console.error('Save plate error:', error);
                EventBus.emit('showToast', {
                    type: "danger",
                    message: error?.message || "An error occurred while saving the plate"
                });
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
        const result = await fetchProduct(_token,restaurantCode);
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
        await fetchPlate(_token,restaurantCode)
        if (props.action === "update") {
            if (props.plate) {
                plateInfo.value = {
                    ...props.plate,
                    RestaurantCode: props.plate.RestaurantCode || restaurantCode
                };
                const plateCode = props.plate.Code

                const contentResponse = await fetchContent(plateCode, _token);
                const consistencyResponse: ApiResponse = await getConsistency(plateCode, _token);

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
                        <div v-if = "props.action === 'update'" >
                            <div class="w-full px-6 font-bold gap-2.5 py-2  mb-10 mt-8 hover:bg-opacity-90 lg:px-6 xl:px-6 text-white bg-gradient-to-r from-olive-800 to-olive-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 text-sm me-2">
                                HISTORIQUE
                            </div>
                            <div>
                                <QuillEditor
                                    v-model:content="content"
                                    contentType="html"
                                    theme="snow"
                                    :toolbar="toolbarOptions"
                                     style="height:150px;"  
                                    />
                                <button @click.stop="saveContent($event)">Enregistrer</button>   
                            </div>
                            <div class="w-full px-6 font-bold gap-2.5 py-2  mb-10 mt-8 hover:bg-opacity-90 lg:px-6 xl:px-6 text-white bg-gradient-to-r from-olive-800 to-olive-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 text-sm me-2">
                                MULTIMEDIA
                            </div>
                            <div class="mb-8">
                                <div
                                class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors"
                                >
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    @change="handleFiles"
                                    class="hidden"
                                    ref="fileInput"
                                    id="images-upload"
                                />
                                <div @click="fileInput?.click()" class="cursor-pointer">
                                    <svg
                                    class="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    </svg>
                                    <p class="mt-2 text-sm text-gray-600">click_to_select</p>
                                    <p class="text-xs text-gray-500">multiple_selection - PNG, JPG, GIF, .mp4, .mkv</p>
                                </div>
                                </div>

                                <!-- Prévisualisation des images -->
                                <div v-if="imagePreviews.length > 0" class="mt-6">
                                <h4 class="text-md font-medium text-gray-700 mb-3">
                                    Images sélectionnées ({{ imagePreviews.length }})
                                </h4>
                                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <div v-for="(preview, index) in imagePreviews" :key="index" class="relative group">
                                    <!-- Affiche une image ou une vidéo selon le type -->
                                    <img v-if="preview.type === 'image'" 
                                        :src="preview.url"
                                        :alt="`Preview ${index + 1}`"
                                        class="w-full h-32 object-cover rounded-lg border-2 border-gray-200" />
                                        
                                    <video v-else
                                        controls
                                        class="w-full h-32 object-cover rounded-lg border-2 border-gray-200">
                                        <source :src="preview.url" :type="preview.file.type">
                                    </video>
                                    
                                    <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                        <button
                                            @click.stop="removeImage(index, $event)"
                                            class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                            </svg>
                                        </button>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-1 truncate">{{ preview.name }}</p>
                                </div>
                                </div>
                                </div>
                            </div>
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