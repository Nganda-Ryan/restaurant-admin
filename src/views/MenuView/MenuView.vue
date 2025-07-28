<script setup lang="ts">
    import { defineAsyncComponent, onBeforeMount, ref } from 'vue'
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import TableOne from '@/components/Tables/TableOne.vue';
    import { fetchMenu } from '@/services/database';
    import { useAuthStore } from '@/stores/auth';


    const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));
    const NewMenuForm = defineAsyncComponent(() => import('@/views/MenuView/NewMenuForm.vue'));


    const authStore = useAuthStore();
    const _token = authStore.jwt;
    const restaurantCode = authStore.restaurantCode;

    const pageTitle = ref('Menus');
    const titles = ref([
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
            name: 'StartDate',
            type: "text",
            label: 'Start Date',
            filterable: false,
        },
        {
            name: 'EndDate',
            type: "text",
            label: 'End Date',
            filterable: false,
        }
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
    const menus = ref([]);
    const rawMenus = ref([]);

    const fetMenu = async () => {
        isloading.value = true;
        try {
            const result = await fetchMenu(_token, restaurantCode);
            // console.log('resultresult', result)
            const menuList = result.map((menu: any) => {
                return Object.fromEntries(Object.entries(menu).filter(([key]) => key !== "items"))
            });
            
            menus.value = menuList;
            rawMenus.value = result;
        } catch (er) {
            console.log('error', er);
        } finally {
            isloading.value = false
        }
    }
    const isViewing = ref(true)
    const selectedMenu = ref<any>();
    const viewMenu = (ts: any) => {
        isViewing.value = true;
        selectedMenu.value = rawMenus.value.filter((item:any) => item.Code == ts.Code)[0];
        console.log("selectedMenu", `/menus/${selectedMenu.value.Code}/view`)
        window.location.href = `/menus/${selectedMenu.value.Code}/view`
    }
    onBeforeMount(async () => {
        await fetMenu();
    });
    const cancel = (payload: any) => {
        isViewing.value = true;
        location.reload()

    }
    const handleAddMenu = (e:any) => {
        isViewing.value = false;

    }
</script>

<template>
    <div>
        <div class="flex flex-col gap-10" v-if="isViewing">
            <TableOne :items="titles" :datas="menus" :options="filterOptions" @view="viewMenu" :filterable="true" :pagination="true">
                <template v-slot:headerButton>
                    <button-action @click="handleAddMenu" custom-classes="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
                        Add Menu
                    </button-action>
                </template>
            </TableOne>
        </div>
        <SpinnerOverPage v-if="isloading" />
        <template v-if="!isViewing">
            <new-menu-form @cancel="cancel" :action="'create'"></new-menu-form>
        </template>
    </div>
</template>
