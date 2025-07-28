<script setup lang="ts">
import { defineAsyncComponent, onBeforeMount, ref, watch } from 'vue';
import ButtonAction from '@/components/Buttons/ButtonAction.vue';
import TableOne from '@/components/Tables/TableOne.vue';
import { fetchPlate } from '@/services/database';
import type { PlateOption } from '@/services/serviceInterface';
import { useConfigStore } from '@/stores/config';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));
const NewPlateForm = defineAsyncComponent(() => import('@/views/PlateView/NewPlateForm.vue'));

const authStore = useAuthStore();
const _token = authStore.jwt;
const restaurantCode = authStore.restaurantCode;
const pageTitle = ref('Plate');
const plateList = ref<Array<PlateOption>>([]);
const rawPlateList = ref([]);
const isloading = ref(false);
const isViewing = ref(true);
const selectedPlate = ref<any>();

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
    { name: 'All', api: '' },
    { name: 'Today', api: 'today' },
    { name: 'This week', api: 'thisweek' },
    { name: 'Last Week', api: 'lastweek' },
]);

const router = useRouter();
const configStore = useConfigStore();

const viewPlate = (ts: any) => {
    isViewing.value = true;
    selectedPlate.value = rawPlateList.value.find((item: any) => item.Code == ts.Code);
    window.location.href = `/plates/${selectedPlate.value.Code}/view`;
};

const getPlate = async () => {
    isloading.value = true;
    const result = await fetchPlate(_token, restaurantCode);
    plateList.value = result.map((item: any) => {
        let img = item.content.find((ctn: any) => ctn.typex.Code == "COVER")?.Body || "";
        return {
            ...item,
            Image: img,
            BasePrice: ` ${item.BasePrice}${item.Currency}`,
            Category: configStore.plateCategories?.find((cat: any) => cat.Code == item.CategoryCode)?.Title,
        }
    });

    plateList.value.sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
    rawPlateList.value = result;
    isloading.value = false;
};

onBeforeMount(async () => {
    isloading.value = true;
    await getPlate();
    if (router.currentRoute.value.query.action==='add') {
        isViewing.value = false;

    }else{
        isViewing.value = true;
    }

});
watch(() => router.currentRoute.value.path, async (newPath) => {
    if (newPath === '/plates') {
        isloading
        await getPlate();
        isViewing.value = true;
    }
});
const cancel = (payload: any) => {
    console.log("cancel", payload);
    isloading.value = true;
    isViewing.value = true;
    getPlate();
    router.push({ path: '/plates' });
};

const handleAddPlate = () => {
    isViewing.value = false;
    router.push({ path: '/plates', query: { action: 'add' } });
};
</script>

<template>
    <div>
        <div class="flex flex-col gap-10" v-if="isViewing">
            <TableOne 
                :items="titles" 
                :datas="plateList" 
                :options="filterOptions" 
                @view="viewPlate"
                :filterable="true" 
                :pagination="true"
            >
                <template v-slot:headerButton>
                    <button-action 
                        @click="handleAddPlate" 
                        custom-classes="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                    >
                        Ajouter un plat
                    </button-action>
                </template>
            </TableOne>
        </div>
        <SpinnerOverPage v-if="isloading" />
        <template v-if="!isViewing">
            <NewPlateForm @cancel="cancel" :action="'add'" />
        </template>
    </div>
</template>