<script setup lang="ts">
    import { defineAsyncComponent, onBeforeMount, ref } from 'vue'
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import TableOne from '@/components/Tables/TableOne.vue';
    import { fetchPlate } from '@/services/database';
    import type { PlateOption } from '@/services/serviceInterface';
    import { useConfigStore } from '@/stores/config';

    const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));
    const NewPlateForm = defineAsyncComponent(() => import('@/views/PlateView/NewPlateForm.vue'));
    const pageTitle = ref('Plate');
    const plateList = ref<Array<PlateOption>>([]);
    const rawPlateList = ref([]);
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
            // style: "text-nowrap"
        },
        {
            name: 'Description',
            type: "text",
            label: 'Description',
            filterable: false,
        },
        {
            name: 'Category',
            type: "text",
            label: 'Category',
            filterable: false,
            style: "text-nowrap"
        },
        {
            name: 'BasePrice',
            type: "text",
            label: 'Price',
            filterable: false,
            style: "text-nowrap"
        },
    ]);
    const filterOptions = ref([
        {
            name: 'All',
            api: '',
        },
        {
            name: 'Today',
            api: 'today',
        },
        {
            name: 'This week',
            api: 'thisweek',
        },
        {
            name: 'Last Week',
            api: 'lastweek',
        },

    ]);
    const isloading = ref(false);
    const configStore = useConfigStore();
    const isViewing = ref(true)
    const selectedPlate = ref<any>();


    const viewPlate = (ts: any) => {
        isViewing.value = true;
        selectedPlate.value = rawPlateList.value.filter((item:any) => item.Code == ts.Code)[0];
        console.log("selectedPlate", `/plate/${selectedPlate.value.Code}/view`)
        window.location.href = `/plate/${selectedPlate.value.Code}/view`
    }
    const getPlate = async () => {
        isloading.value = true;
        const result = await fetchPlate();
        plateList.value = result.map((item:any) => {
            let img = "";
            item.content.forEach((ctn:any) => {
                if(ctn.typex.Code == "COVER") {
                    img = ctn.Body
                }
            });
            return {
                ... item,
                Image: img,
                BasePrice: `€ ${item.BasePrice}`,
                Category: configStore.plateCategories && configStore.plateCategories.filter((cat: any) => cat.Code == item.CategoryCode)[0]?.Title
            }
        })
        
        plateList.value.sort((a, b) => {
            const titleA = a.Title || '';
            const titleB = b.Title || '';
            return titleA.localeCompare(titleB);
        });

        console.log("plateList", plateList.value)
        console.log("configStore", configStore.plateCategories)

        isloading.value = false;
    }

    onBeforeMount(async () => {
        await getPlate();
    });
    
    const cancel = (payload:any) => {
        console.log("cancel", payload)
        isViewing.value = true;
        
        payload == true && location.reload()

    }
    const handleAddPlate = (e:any) => {
        isViewing.value = false;

    }
</script>

<template>
    <div>
        <div class="flex flex-col gap-10" v-if="isViewing">
            <TableOne :items="titles" :datas="plateList" :options="filterOptions" @view="viewPlate" :filterable="true">
                <template v-slot:headerButton>
                    <button-action @click="handleAddPlate" custom-classes="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
                        Add Plate
                    </button-action>
                </template>
            </TableOne>
        </div>
        <SpinnerOverPage v-if="isloading" />
        <template v-if="!isViewing">
            <NewPlateForm @cancel="cancel" :action="'add'"></NewPlateForm>
        </template>
    </div>
</template>
