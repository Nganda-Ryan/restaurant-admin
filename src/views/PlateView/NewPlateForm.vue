<script setup lang="ts">
    import { ref, defineAsyncComponent, computed, onMounted } from 'vue';
    import Spinner from '@/components/Utilities/Spinner.vue';
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import { useConfigStore } from '@/stores/config';
    import type { PlateOption, Content, Compositions, ProductOption } from '@/services/serviceInterface';
    import { Cloudinary } from "@cloudinary/url-gen";
    import { AdvancedImage } from "@cloudinary/vue";
    import { fill } from "@cloudinary/url-gen/actions/resize";
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import InputGroup from '@/components/Forms/InputGroup.vue';
    import SelectGroupSearchable from '@/components/Forms/SelectGroup/SelectGroupSearchable.vue';
    import type Option from '../../../src/components/Utilities/interfaceModel';
    const SelectGroupOne = defineAsyncComponent(() => import('@/components/Forms/SelectGroup/SelectGroupOne.vue'));
    import { uploadContent, createPlate, generateCode, createContent, fetchProduct } from '@/services/database';
    import type ToastPayload from '@/types/Toast';
    import EventBus from '@/EventBus';
    import TableOne from '@/components/Tables/TableOne.vue';
    

    const configStore = useConfigStore();
    const isSaving = ref<Boolean>(false);
    const emits = defineEmits(['cancel', "save", "back", "created"]);
    const props = defineProps({
        action: {
            type: String,
        },
        plate: {
            type: Object
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
        },
        {
            name: 'quantity',
            type: "text",
            label: 'Quantity',
            filterable: true,
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
            if(plateInfo.value.Title){
                plateInfo.value.Code = generateCode(plateInfo.value.Title);
            }
            const createdPlate = await createPlate(plateInfo.value);
            let createdCtn = '';
            let createdCtn2 = '';

            //Content creation
            if(createdPlate[0].success){
                //Ingredient
                const ctnList1: Content [] = [];
                let ingredient = '';
                productListToadd.value.forEach(p1 => {
                    rawProduct.value.forEach(p2 => {
                        if(p1.api == p2.Code){
                            ingredient = ingredient + ', ' + p2.Title;
                        }
                    });
                });
                ctnList1.push({
                    "PlatCode": plateInfo.value.Code,
                    "Body": ingredient,
                    "DisplayOrder": 0,
                    "TypeCode": "ING"
                })
                createdCtn = await createContent(ctnList1);

                
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

            console.log('createdCtn', createdCtn);
            console.log('createdCtn2', createdCtn2);
            console.log('createdPlate', createdPlate);

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

            console.log("createdPlate", createdPlate)
        } catch(error:any){
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
        //Ajout du produit au plat
        productListToadd.value.push({
            ...selectedItem.value,
            quantity: producQuantity.value
        });
        selectedItem.value = null;
        
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
                    quantity: item.quantity + 1
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

    onMounted(() => {
        getProduct();

        // if(props.action == "update"){
        //     if(props.product){
        //         productInfo.value = props.product
        //     }
        // }
        // console.log('props', props)
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
                            PRODUCT LIST
                        </div>
                        
                        <div v-if="productListToadd.length > 0">
                            <TableOne :items="titles" :datas="productListToadd" :options="filterOptions" @remove="handleRemovePlace" @increment="handleIncrement" @decrement="handleDecrement" :filterable="false" :pagination="false"/>
                        </div>

                        
                        <div v-else class="text-center py-4">
                            Please add a plate ;P
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
