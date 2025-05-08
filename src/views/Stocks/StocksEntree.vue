<script setup lang="ts">
    import { defineAsyncComponent, onBeforeMount, ref } from 'vue'
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import TableOne from '@/components/Tables/TableOne.vue';
    import { fetchConfig, fetchProduct } from '@/services/database';
    import router from '@/router';
    import { useConfigStore } from '@/stores/config';
    import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/vue/24/solid';

    const pageTitle = 'Product';
    const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));
    const NewProductForm = defineAsyncComponent(() => import('@/views/Stocks/NewsStocks.vue'));
    
    // Table configuration
    const titles = ref([
        {
            name: 'Image',
            label: 'image',
            type: 'image',
            event: "view",
        },
        {
            name: 'Title',
            label: 'Title',
            type: 'url',
            event: "view",
            filterable: true,
        },
        {
            name: 'Description',
            type: "text",
            label: 'Description',
        },
        {
            name: 'Category',
            type: "text",
            label: 'Category',
            filterable: true,
        },
        {
            name: 'DateEntrée',
            type: "text",
            label: 'Date Entrée',
            filterable: true,
        },
        {
            name: 'AvailableQuantity',
            type: "text",
            label: 'Quantity',
            filterable: false,
        },
        {
            name: 'PrixUnitaire',
            type: "integer",
            label: 'PrixUnitaire',
            filterable: false,
        },
        {
            name: 'Total',
            type: "integer",
            label: 'Total',
            filterable: false,
        }
    ]);

    const filterOptions = ref([
        {
            name: 'All',
            api: '',
        },
        {
            name: 'Name',
            api: 'name',
        },
        {
            name: 'Category',
            api: 'category',
        }
    ]);

    // Sample data
    const element = ref([
        { id: 1, Image: '🎉', Title: 'tomates', Description: 'Tomates concentrees', Category: 'fruit',DateEntrée:'02-11-2024 10h:25',AvailableQuantity: '10', PrixUnitaire: 2, Total: 20 },
        { id: 2, Image: '🍎', Title: 'Pommes', Description: 'Pommes de terre', Category: 'fruit',DateEntrée:'24-09-2024 12h:00', AvailableQuantity: '5', PrixUnitaire: 1, Total: 5 },
        { id: 3, Image: '🍌', Title: 'Bananes', Description: 'Bananes bio', Category: 'fruit',DateEntrée:'25-08-2024 09h:30', AvailableQuantity: '8', PrixUnitaire: 3, Total: 24 },
        { id: 4, Image: '🍊', Title: 'Oranges', Description: 'Oranges sanguines', Category: 'fruit', DateEntrée:'28-06-2024 11h:20', AvailableQuantity: '12', PrixUnitaire: 4, Total: 48 },
        { id: 5, Image: '🍇', Title: 'Raisins', Description: 'Raisins secs', Category: 'fruit', DateEntrée:'14-06-2024 11h:00', AvailableQuantity: '15', PrixUnitaire: 2, Total: 30 },
        { id: 6, Image: '🍉', Title: 'Pastèques', Description: 'Pastèques sucrées', Category: 'fruit', DateEntrée:'25-01-2024 14h:00', AvailableQuantity: '20', PrixUnitaire: 5, Total: 100 }
    ]);

    // Stock movements data
    const stockMovements = ref([
        { id: 1, productName: 'tomates', type: 'entry', quantity: 50, date: '02-11-2024 10h:25' },
        { id: 2, productName: 'Pommes', type: 'exit', quantity: 20, date: '24-09-2024 12h:00' },
        { id: 3, productName: 'Bananes', type: 'entry', quantity: 30, date: '25-08-2024 09h:30' },
        { id: 4, productName: 'Oranges', type: 'exit', quantity: 15, date: '28-06-2024 11h:20' },
    ]);

    // Component state
    const isloading = ref(false);
    const products = ref([]);
    const rawProducts = ref([]);
    const configStore = useConfigStore();
    const isViewing = ref(true);
    const created = ref(false);
    const selectedProduct = ref<any>();

    // Methods
    const fetProduct = async () => {
        isloading.value = true;
        try {
            const result = await fetchProduct();
            const productList = result.map((product: any) => {
                let img = "";
                product.content.forEach((ctn: any) =>{
                    if(ctn.typex.Code ==  "COVER"){
                        img = ctn.Body
                    }
                });
                
                return {
                    ...Object.fromEntries(Object.entries(product).filter(([key]) => key !== "content")),
                    Image: img,
                    AvailableQuantity: `${product.AvailableQuantity} ${product.QuantityUnitCode}`,
                    Category: configStore.productCategories.filter((cat: any) => cat.Code == product.CategoryCode)[0]?.Title
                }
            });
            products.value = productList;
            rawProducts.value = result;
        } catch (er) {
            console.log('error', er);
        } finally {
            isloading.value = false
        }
    };

    const viewProduct = (ts: any) => {
        isViewing.value = true;
        selectedProduct.value = rawProducts.value.filter((item:any) => item.Code == ts.Code)[0];
        window.location.href = `/products/${selectedProduct.value.Code}/view`;
    };

    const cancel = () => {
        isViewing.value = true;
        if(created.value == true){
            location.reload();
        }
    };

    const handleCreate = () => {
        created.value = true;
    };

    const handleAddProduct = (e:any) => {
        isViewing.value = false;
    };

    // Lifecycle hooks
    onBeforeMount(async () => {
        await fetProduct();
    });
</script>

<template>
    <div>
        <div class="flex flex-col gap-10" v-if="isViewing">

                        <!-- Stock Movements Cards -->
            <div class="mt-8">
                <h3 class="text-xl font-semibold mb-4">Recent Stock Movements</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div 
                        v-for="movement in stockMovements" 
                        :key="movement.id"
                        class="bg-white rounded-lg shadow p-4 border-l-4"
                        :class="{
                            'border-green-500': movement.type === 'entry',
                            'border-red-500': movement.type === 'exit'
                        }"
                    >
                        <div class="flex items-center justify-between">
                            <h4 class="font-medium">{{ movement.productName }}</h4>
                            <span 
                                class="p-1 rounded-full"
                                :class="{
                                    'bg-green-100 text-green-600': movement.type === 'entry',
                                    'bg-red-100 text-red-600': movement.type === 'exit'
                                }"
                            >
                                <ArrowUpIcon v-if="movement.type === 'entry'" class="h-5 w-5" />
                                <ArrowDownIcon v-else class="h-5 w-5" />
                            </span>
                        </div>
                        <div class="mt-2 text-sm text-gray-600">
                            <p>Quantity: {{ movement.quantity }}</p>
                            <p>Date: {{ movement.date }}</p>
                            <p class="capitalize mt-1">
                                <span 
                                    :class="{
                                        'text-green-600': movement.type === 'entry',
                                        'text-red-600': movement.type === 'exit'
                                    }"
                                >
                                    {{ movement.type === 'entry' ? 'New Entry' : 'New Exit' }}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Products Table -->
            <TableOne 
                :items="titles" 
                :datas="element" 
                :options="filterOptions" 
                @view="viewProduct" 
                :filterable="true" 
                :pagination="true"
            >
                <template v-slot:headerButton>
                    <button-action 
                        @click="handleAddProduct" 
                        custom-classes="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                    >
                        Add New Entry
                    </button-action>
                </template>
            </TableOne>
        </div>

        <SpinnerOverPage v-if="isloading" />
        
        <template v-if="!isViewing">
            <NewProductForm 
                @cancel="cancel" 
                @back="cancel" 
                :action="'add'" 
                :created="handleCreate" 
            />
        </template>
    </div>
</template>

<style scoped>
/* Add any custom styles here if needed */
</style>