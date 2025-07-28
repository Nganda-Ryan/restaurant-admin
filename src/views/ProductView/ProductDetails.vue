<script setup lang="ts">
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import DefaultCardSkeleton from '@/components/Forms/DefaultCardSkeleton.vue';
    const NewProductForm = defineAsyncComponent(() => import('./NewProductForm.vue'));
    const Spinner = defineAsyncComponent(() => import('@/components/Utilities/Spinner.vue'));
    import { computed, defineAsyncComponent, onBeforeMount, ref } from 'vue';
    import router from '@/router';
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    const PopupModal = defineAsyncComponent(() => import('@/components/Modals/PopupModal.vue'));
    import { fetchSingleProduct } from '@/services/database';
    const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));
    const InputGroup = defineAsyncComponent(() => import('@/components/Forms/InputGroup.vue'));
    import type { Content, Product } from '../../services/serviceInterface';
    import { useConfigStore } from '@/stores/config';
    import { useAuthStore } from '@/stores/auth';
    import { deleteProduct } from '@/services/database';

    const configStore = useConfigStore();
    const authStore = useAuthStore();
    const _token = authStore.jwt;
    const restaurantCode = authStore.restaurantCode;
    const emits = defineEmits(['cancel', "go-back"]);

    interface Param {
        action: string,
        productcode: string
    }
    const productCode = ref('');
    const productInfo = ref<Product>({
        "Code": "",
        "Title": "",
        "Description": "",
        "QuantityUnitCode": "",
        "AvailableQuantity": 0,
        "ThresholdQuantity": 0,
        "Image": null,
        Likes:0,
        RestaurantCode: "",
        "CategoryCode": ""
    });
    const contentList = ref<Content []>([])

    const isloading = ref(true);
    const action = ref('view');
    const isEditing = ref<Boolean>(false);
    const isModalOpen = ref(false);
    const isDeleting = ref(false);
    const created = ref(false);

    const handleEditProduct = (e: any) => {
        isEditing.value = true;
    }
    const handleDeleteProduct = (e: any) => {
        isModalOpen.value = true;
    }
    const handleCloseModal = () => {
        console.log('handleCloseModal')
        isModalOpen.value = false;
    }
    const category = computed(() => {
        const cat: any = configStore.productCategories.filter((p:any) => p.Code == productInfo.value.CategoryCode)
        if(cat[0]) {return cat[0].Title}

        return "";
    })
    const quantity = computed(() => {
        if(productInfo.value.AvailableQuantity && productInfo.value.QuantityUnitCode){
            return productInfo.value.AvailableQuantity + ' ' + productInfo.value.QuantityUnitCode;
        }
        return "N/A";
    })
    const cover = computed(() => {
        if(contentList.value.length > 0 && contentList.value.filter((c: any) => c.TypeCode == "COVER")){
            return contentList.value.filter((c: any) => c.TypeCode == "COVER")[0].Body;
        }
        return "N/A";
    })
    
    
    
    const deleteAction = async () => {
        try {
            isDeleting.value = true;
            await deleteProduct([{Code: productInfo.value.Code}], _token);
            router.push({path: '/products'})
        } catch (e) {
            console.log("ProductDetails.handleDeleteProduct.error", e)
        }
         finally {
            isDeleting.value = false;
        }
    }
    const cancel = () => {
        isEditing.value = false;
        if(created.value){
            location. reload()
        }
    }
    const goBack = () => {
        // window.location.href = '/products';
        window.history.back();
    }
    const fetchProduct = async () => {
        isloading.value = true;
        try {
            const params = router.currentRoute.value.params as unknown as Param;
            action.value = params.action;
            productCode.value = params.productcode;

            const result = await fetchSingleProduct(productCode.value, _token, restaurantCode);
            
            productInfo.value = result.filter((p:any) => p.Code === productCode.value)[0];
            contentList.value = result.filter((p:any) => p.Code === productCode.value)[0].content.map((c: any) => {
                return {
                    "ProductCode": productCode.value,
                    "Body": c.Body,
                    "DisplayOrder": 0,
                    "TypeCode": c.typex.Code
                }
            })
            
            // console.log('productInfo', productInfo.value);
            // console.log('contentList', contentList.value);
            // console.log('result', result);
            
            
        } catch (er) {
            console.log('error', er);
        } finally {
            isloading.value = false;
        }
    }

    const handleCreate = () => {
        created.value = true;
    }
    

    onBeforeMount(async () => {
        await fetchProduct();
    });
</script>

<template>
    <div class="grid grid-cols-1 gap-12 sm:grid-cols-1">
        <div class="flex flex-col gap-9">
            <!-- Input Fields Start -->
            <template v-if="!isEditing">
            <DefaultCard :cardTitle="`${productInfo.Title}`" v-if="!isloading">
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
                    <div class="flex items-center justify-between w-full">
                        <img :src="cover" :alt="productInfo.Title" class="mb-1 ml-3 w-11 h-11 object-cover aspect-square rounded-lg">
                        <span>
                            <button-action @click='handleEditProduct' custom-classes="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Edit</button-action>
                            <button-action @click="handleDeleteProduct" custom-classes="text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Delete</button-action>
                        </span>
                    </div>
                </template>
                <form @submit.prevent="">
                    <div class="p-6.5">
                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <input-group label="Product Name" type="text" customClasses="w-full xl:w-1/2" disabled v-model="productInfo.Title" />

                            <input-group label="Product Category" type="text" customClasses="w-full xl:w-1/2" disabled v-model="category" />
                        </div>
                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <input-group label="Available Quantity" type="text" customClasses="w-full xl:w-1/2" disabled v-model="quantity" />

                            <input-group label="Description" type="textarea" customClasses="w-full xl:w-1/2" disabled v-model="productInfo.Description" />
                        </div>
                        
                    </div>
                </form>
            </DefaultCard>
            </template>
        <PopupModal :message="`Are you sure you want to delete this Product ? This action cannot be undone.`" :is-open="isModalOpen" v-if="isModalOpen" @close="handleCloseModal" :title="'Plate deletion'">
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
            
            <template v-else-if="isEditing">
                <NewProductForm  @cancel="cancel"  :action="'update'" :product="productInfo" @back="cancel" :created="handleCreate"/>
            </template>

            <!-- <template v-else-if="isCloning">
                <NewProductForm  @cancel="cancel"  :action="'clone'" :product="productInfo" :plats="plats"/>
            </template> -->
            <DefaultCardSkeleton v-if="isloading"/>
            <!-- Input Fields End -->
        </div>
    </div>
</template>
<style scoped></style>
