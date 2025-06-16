<script setup lang="ts">
    import { ref, defineAsyncComponent, computed, onMounted, onBeforeMount } from 'vue';
    import router from '@/router';
    import Spinner from '@/components/Utilities/Spinner.vue';
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import { useConfigStore } from '@/stores/config';
    import type { PlateOption, Content, Composition,Compositions, ProductOption , ResultItem, ApiResponse, composition } from '@/services/serviceInterface';
    import { Cloudinary } from "@cloudinary/url-gen";
    import { AdvancedImage, placeholder } from "@cloudinary/vue";
    import { fill } from "@cloudinary/url-gen/actions/resize";
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import InputGroup from '@/components/Forms/InputGroup.vue';
    import SelectGroupSearchable from '@/components/Forms/SelectGroup/SelectGroupSearchable.vue';
    import type Option from '../../../src/components/Utilities/interfaceModel';
    const SelectGroupOne = defineAsyncComponent(() => import('@/components/Forms/SelectGroup/SelectGroupOne.vue'));
    import { fetchContent ,uploadContent, createPlate, generateCode, createContent, fetchProduct, updatePlate, getConsistency,createConsistency, fetchPlate, UpdateConsistency, updateContent} from '@/services/database';
    import type ToastPayload from '@/types/Toast';
    import EventBus from '@/EventBus';
    import TableOne from '@/components/Tables/TableOne.vue';
    

    const configStore = useConfigStore();
    const isSaving = ref<Boolean>(false);
    const isProductList= ref<Boolean>(false);
    const emits = defineEmits(['cancel', "save", "back", "created"]);
    const props = defineProps({
        action: {
            type: String,
        },
        plate: {
            type: Object,
            default: () => ({}) // Fournit un objet vide par défaut
        }
    });
    const plateInfo = ref<PlateOption>({
        "Code": '',
        "Title": '',
        "Description": '',
        "Currency": '',
        "CategoryCode": '',
        "BasePrice": 0,
        Image: ""
    });
    const productList = ref<Array<ProductOption>>([]);
    const productListToadd = ref<Array<ProductOption>>([])
    const selectedItem = ref<any>(null);
    const quantity = ref<number>(1);
    const producQuantity = ref<number>(1);
    const resetInput = ref<boolean>(false);
    const reloadView = ref<boolean>(false);
    const titles = ref([
        {
            label: 'Title',
            name: "name",
            type: 'url',
            event: "view",
            filterable: false,
            inputField: {
                placeholder: 'Enter the value',
                type:'text'
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
    const rawProduct = ref<any []>([]);

    const origin = ref<Option[]>([
    {
        name: 'Adamaoua',
        api: 'adamoua', // ou un code approprié
    },
        {
            name:'Centre',
            api: 'centre'
        },
        {
            name:'Est',
            api: 'est'
        },
        {
            name:'Extrême-Nord',
            api:'extreme-nord'
        },
        {
            name:'Littoral',
            api:'littoral'
        },
        {
            name:'Nord',
            api:'nord'
        },
        {
            name:'Nord-Ouest',
            api:'nordouest'
        },
        {
            name:'Ouest',
            api:'ouest'
        },
        {
            name:'Sud',
            api:'sud'
        },
        {
            name:'Sud-Ouest',
            api:'sudouest'
        },
        
        
    ])
    const stopAction = () => {
        emits('cancel', reloadView.value);
    }
    const getAction = (act:string | undefined) => {
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
        }) as Option []

        return result;
    })
    
    
    const savePlate = async () => {
        
        try {
            isSaving.value = true;
            
            // Déterminer le code du plat
            if (props.action === "update") {
                console.log('props.plate', props.plate)
                plateInfo.value.Code = props.plate.Code; // Gardez le code existant ou une chaîne vide
            } else if (props.action == "add" && plateInfo.value.Title) {
                plateInfo.value.Code = generateCode(plateInfo.value.Title); // Générer un nouveau code pour un nouvel ajout
            }

            let result;
     
            let createdCtn = '';
            let createdCtn2 = '';

            //Content creation
            if(props.action == "add"){
                result = await createPlate(plateInfo.value); // Création d'un nouveau plat
                if(result && result[0].success){
                    //Composition
                    if(plateInfo.value.Code != undefined){
                        const ctnList1: Compositions[] = [];
                    productListToadd.value.forEach(p1 => {
                        rawProduct.value.forEach(p2 => {
                            if(p1.api === p2.Code){
                                if(plateInfo.value.Code){
                                    ctnList1.push({
                                        "ProductCode": p1.api,
                                        "PlateCode": plateInfo.value.Code,
                                        "QuantityOfConsumption": p1.quantity,

                                    });
                                } else {
                                    throw new Error('Plate code is missing');
                                }
                            }
                        });
                    });
                 
                    createdCtn = await createConsistency(ctnList1);

                    //Content de type ING
                    const CtnList2: Content [] = [];
                    let ingredients = '';
                    productListToadd.value.forEach(p1 => {
                        rawProduct.value.forEach(p2 => {
                           
                            if(p1.api == p2.Code){
                                const inputFieldValue = p1.inputField || ''; // Utilisation du placeholder
                                ingredients += (ingredients ? '; ' : '') + `${p2.Title} : ${inputFieldValue}`; // Ajouter le produit et la quantité
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
                    //Cover Image
                    const uploadDedImage = await uploadContent(plateInfo.value.Image);
                    if(uploadDedImage){
                        const uploadedCtn = await uploadContent(plateInfo.value.Image)
                        if(uploadedCtn){
                            const ctnList: Content [] = [];
                            ctnList.push({
                                "PlatCode": plateInfo.value.Code,
                                "Body": uploadedCtn,
                                "DisplayOrder": 1,
                                "TypeCode": 'COVER'
                            })
                            createdCtn2 = await createContent(ctnList);
                        }
                    }
                    }
                    router.push({path: '/plates'})
                }
            }else if(props.action === "update"){
                 // Mise à jour du plat (si des champs ont été modifiés)
                if (plateInfo.value.Title !== props.plate.Title || 
                    plateInfo.value.Description !== props.plate.Description || 
                    plateInfo.value.CategoryCode !== props.plate.CategoryCode ||
                    plateInfo.value.BasePrice !== props.plate.BasePrice) {
                    result = await updatePlate(plateInfo.value); // Mise à jour du plat
                }
               // Séparer les produits en deux listes
            const newProducts: Compositions[] = [];
            const existingProducts: composition[] = [];
               // Vérifiez que le code du plat est défini
            if (plateInfo.value.Code !== undefined) {

                
                productListToadd.value.forEach(p1 => {
                const matchingProduct = rawProduct.value.find(p2 => p1.api === p2.Code);
                if (matchingProduct) {
                    if (plateInfo.value.Code) {
                        // Vérifier si le produit existe déjà dans la liste des produits associés au plat
                        if (p1.Id) { // Utilisez Id au lieu de compositionId
                            // Ajouter le produit à la liste des produits existants()
                            if(p1.quantity > 0){
                                existingProducts.push({
                                    "Id": p1.Id, // Utilisez Id
                                    "ProductCode": p1.api,
                                    "PlateCode": plateInfo.value.Code,
                                    "QuantityOfConsumption": p1.quantity,
                                });
                            }else{
                                // Supprimer le produit de la liste des produits existants
                                existingProducts.push({
                                    "Id": p1.Id, // Utilisez Id
                                    "ProductCode": p1.api,
                                    "PlateCode": plateInfo.value.Code,
                                    "QuantityOfConsumption": 0,
                                });
                            }
                            existingProducts.push({
                                "Id": p1.Id, // Utilisez Id
                                "ProductCode": p1.api,
                                "PlateCode": plateInfo.value.Code,
                                "QuantityOfConsumption": p1.quantity,
                            });
                        } else {
                            // Ajouter le produit à la liste des nouveaux produits
                            newProducts.push({
                                ProductCode: p1.api,
                                PlateCode: plateInfo.value.Code,
                                QuantityOfConsumption: p1.quantity,
                            });
                        }
                    } else {
                        throw new Error('Plate code is missing');
                    }
                }
            });

            // Utiliser createConsistency pour les nouveaux produits
            if (newProducts.length > 0) {
                await createConsistency(newProducts);
            }

            // Utiliser UpdateConsistency pour les produits existants
            if (existingProducts.length > 0) {
                for (const product of existingProducts) {
                await UpdateConsistency({
                    Id: product.Id, // Assurez-vous que Id est présent
                    ProductCode: product.ProductCode,
                    PlateCode: product.PlateCode,
                    QuantityOfConsumption: product.QuantityOfConsumption,
                });
    }
            }

            }
                //Ingredient
                const ctnList2: Content [] = [];
                let ingredients = '';
                productListToadd.value.forEach(p1 => {
                    rawProduct.value.forEach(p2 => {
                        if(p1.api == p2.Code){
                            const inputFieldValue = p1.inputField || ''; // Utilisation du placeholder
                            ingredients += (ingredients ? '; ' : '') + `${p2.Title} : ${inputFieldValue}`; // Ajouter le produit et la quantité
                        }
                    });
                });
                if (ingredients) {
                    ctnList2.push({
                        "PlatCode": plateInfo.value.Code,
                        "Body": ingredients,
                        "DisplayOrder": 1,
                        "TypeCode": "ING",  
                    });
                    createdCtn = await createContent(ctnList2);
                    console.log('createdCtn', createdCtn);
                }
                    //Cover Image
                    const uploadDedImage = await uploadContent(plateInfo.value.Image);
                if(uploadDedImage){
                    const uploadedCtn = await uploadContent(plateInfo.value.Image)
                    if(uploadedCtn){
                        const ctnList: Content [] = [];
                        ctnList.push({
                            "PlatCode": plateInfo.value.Code,
                            "Body": uploadedCtn,
                            "DisplayOrder": 2,
                            "TypeCode": 'COVER'
                        })
                        createdCtn2 = await createContent(ctnList);
                    }
                }
            }

            console.log('createdCtn', createdCtn);
            console.log('createdCtn2', createdCtn2);
            console.log('createdPlate', result);

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
                Image: ""
            };
            productListToadd.value = [];
            reloadView.value = true;
            EventBus.emit('showToast', toastPayload);

            console.log("createdPlate", result)
        }catch(error:any){
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
        if(productList.value.length <= 0 || !selectedItem.value){return}

        const existingProduct = productListToadd.value.find(item => item.api === selectedItem.value.api);

      if (existingProduct) {
        // Mettre à jour la quantité du produit existant
        existingProduct.quantity += producQuantity.value;
    } else {
        // Ajouter le produit au plat
        productListToadd.value.push({
            ...selectedItem.value,
            inputField: '',
            quantity: producQuantity.value,
        });
    }
        selectedItem.value = null;
        isProductList.value = true;
        //retrait du produit ajouté de la liste des produits.
        productList.value = productList.value.filter(item1 => !productListToadd.value.some(item2 => item2.api == item1.api));

        
        //trie par ordre alphabétique
        productListToadd.value.sort((a, b) => {
            const nameA = a.name ?? '';
            const nameB = b.name ?? '';
            return nameA.localeCompare(nameB);
        });

        //trie par ordre alphabétique
        productList.value.sort((a, b) => {
            const nameA = a.name ?? '';
            const nameB = b.name ?? '';
            return nameA.localeCompare(nameB);
        });


        resetInput.value = !resetInput.value;
        producQuantity.value = 1;
    }

    const handleRemovePlace = (ts: any) => {
        productList.value.push(ts);
        
        productListToadd.value = productListToadd.value.filter(item => item.api!= ts.api);
          
        //trie par ordre alphabétique
        productListToadd.value.sort((a, b) => {
            const nameA = a.name ?? '';
            const nameB = b.name ?? '';
            return nameA.localeCompare(nameB);
        });

        //trie par ordre alphabétique
        productList.value.sort((a, b) => {
            const nameA = a.name ?? '';
            const nameB = b.name ?? '';
            return nameA.localeCompare(nameB);
        });
    }
    const handleIncrement = (ts: any) => {
        productListToadd.value = productListToadd.value.map(item => {
            if(item.api == ts.api){
                return {
                    ...item,
                    quantity: item.quantity + 1  // Incrémente la quantité
                }
            }
            return item;
        })
        console.log('productListToadd.value', productListToadd.value)
    }
    const handleDecrement = (ts: any) => {
        if(ts.quantity <= 1) {
            handleRemovePlace(ts);
        }
        productListToadd.value = productListToadd.value.map(item => {
            if(item.api == ts.api && item.quantity > 1){
                return {
                   ...item,
                    quantity: item.quantity - 1
                }
            }
            return item;
        })
    }


    //SPECIAL
    // const getImage = (payload:any) => {
    //     console.log('** getImage.payload - ', payload , ' -')
    // }

    // const cld = new Cloudinary({
    //     cloud: {
    //         cloudName: "demo",
    //     },
    // });
    // const myImg = cld.image('docs/models').resize(fill().width(250).height(250));


    const getProduct = async () => {
        const result = await fetchProduct();
        rawProduct.value = result;
        console.log('result: ', result)
        productList.value = result.map((item:any) => {
            return {
                name: `${item.Title} (${item.QuantityUnitCode})`,
                api: item.Code,
                price: item.BasePrice
            }
        })
        productList.value.sort((a, b) => {
            const nameA = a.name ?? '';
            const nameB = b.name ?? '';
            return nameA.localeCompare(nameB);
        });
    }

    onBeforeMount(async () => {
    await getProduct(); // Récupérer la liste des produits disponibles
    await fetchPlate()
    if (props.action === "update") {
        if (props.plate) {
            plateInfo.value = { ...props.plate };
            const plateCode = props.plate.Code

            // Utiliser getConsistency pour récupérer les produits associés au plat
                // Récupérer le contenu du plat
            const contentResponse = await fetchContent(plateCode);
            const consistencyResponse: ApiResponse = await getConsistency(plateCode);	
            console.log('Consistency Response:', consistencyResponse); // Vérifiez la réponse

            const ingredientMap = contentResponse.body.results.flatMap((result: any) => 
            result.content
                    .filter((item: any) => item.TypeCode === "ING")
                    .map((item: any) => {
                        const bodyParts = item.Body.split(';'); // On suppose que les ingrédients sont séparés par des `;`
                        return bodyParts.map((part: any) => {
                            const [name, value] = part.split(':').map((p:any) => p.trim()); // Extraire nom et valeur
                            return { name, value: value || '' }; // Si pas de valeur, on met une chaîne vide
                        });
                    })
            ).flat();
                        // Construire un dictionnaire pour accès rapide
                const ingredientDict = Object.fromEntries(ingredientMap.map((ing: any )=> [ing.name, ing.value]));
            if (consistencyResponse.body && consistencyResponse.body.results) {
                const results: ResultItem[] = consistencyResponse.body.results;
                // Extraire les produits de la réponse
                if (results.length > 0 && Array.isArray(results[0].composition)) {
                    const uniqueIngredients = new Set(); // Set pour stocker les ingrédients uniques

                    productListToadd.value = results.flatMap(result => 
                    result.composition.map((item: Composition) =>{
                        const productName = item.Product.Title;
                        if (!uniqueIngredients.has(productName)) { // Vérifier si l'ingrédient est déjà ajouté
                    uniqueIngredients.add(productName); // Ajouter l'ingrédient au Set

                    const inputFieldValue = ingredientDict[productName] || ''; // Récupérer la valeur ou chaîne vide si non trouvée
                    return {
                        name: `${item.Product.Title} (${item.Product.QuantityUnitCode})`,
                        api: item.Product.Code,
                        quantity: item.QuantityOfConsumption,
                        Id: item.Id,
                        inputField: inputFieldValue // Afficher l'ingrédient ou une chaîne vide
                    };
                }
                return null; // Retourner null pour les ingrédients en double
            }).filter(item => item !== null) // Filtrer les valeurs null
        );
            } else {
                console.error('composition is not an array or is empty');
                productListToadd.value = [];
            }
            } else {
                // Gérer le cas où la récupération échoue
                productListToadd.value = [];
            }

            // Mettre à jour la liste des produits disponibles
            productList.value = productList.value.filter(item => 
                !productListToadd.value.some(p => p.api === item.api)
            );
        }
    }
    });
</script>

<template>
    <!-- ====== Form Elements Section Start -->
    <div class="grid grid-cols-1 gap-12 sm:grid-cols-1">
        <div class="flex flex-col gap-9">
            <!-- Input Fields Start -->
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
                            <select-group-one label="
                                Origin of the dish" :options="origin" :placeholder="'--Select plate Origin--'"
                                class="w-full xl:w-1/2" v-model="plateInfo.CategoryCode" required/>
                            <select-group-one label="
                                Nutritional Value" :options="origin" :placeholder="'--Select plate Origin--'"
                                class="w-full xl:w-1/2" v-model="plateInfo.CategoryCode" :multiple="true"  required/>
                        </div>
                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row items-start">
                            <select-group-one label="Quategory" :options="categoryOption" :placeholder="'Select the category'"
                                class="w-full xl:w-1/2" v-model="plateInfo.CategoryCode" required/>
                            <input-group label="Cover" type="file" placeholder=""
                                customClasses="w-full xl:w-1/2" v-model="plateInfo.Image"/> 
                        </div>
                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row items-start">
                            
                            <SelectGroupSearchable customClasses="w-full xl:w-1/2" :items="productList" @item-selected="handleSelection" label="Select a plate" placeholder="Select a plate ..." :required="false" :resetTrigger="resetInput">
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
            <!-- Input Fields End -->
        </div>
    </div>
    <div>
        <!-- <AdvancedImage :cldImg="myImg" /> -->
    </div>
    <!-- ====== Form Elements Section End -->
</template>
<style>
.aligned-column {
    display: flex; /* Utiliser flexbox pour aligner le contenu */
    align-items: center; /* Centrer le contenu verticalement */
    padding-left: 10px; /* Ajuster le padding selon vos besoins */
}
</style>