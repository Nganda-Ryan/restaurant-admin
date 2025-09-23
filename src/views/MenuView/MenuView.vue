<script setup lang="ts">
    import { defineAsyncComponent, onBeforeMount, ref } from 'vue'
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import TableOne from '@/components/Tables/TableOne.vue';
    import { fetchMenu } from '@/services/database';
    import { useAuthStore } from '@/stores/auth';
    import { useI18n } from 'vue-i18n';
    import EventBus from '@/EventBus';

    const { t } = useI18n();
    const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));
    const NewMenuForm = defineAsyncComponent(() => import('@/views/MenuView/NewMenuForm.vue'));

    const authStore = useAuthStore();
    const _token = authStore.jwt;
    const restaurantCode = authStore.restaurantCode;

    const pageTitle = ref(t('menu.page_title'));
    const titles = ref([
        {
            name: 'Title',
            label: t('menu.table.headers.title'),
            type: 'url',
            event: "view",
            filterable: true,
        },
        {
            name: 'Description',
            type: "text",
            label: t('menu.table.headers.description'),
            filterable: false,
        },
        {
            name: 'StartDate',
            type: "text",
            label: t('menu.form.start_date'),
            filterable: false,
        },
        {
            name: 'EndDate',
            type: "text",
            label: t('menu.form.end_date'),
            filterable: false,
        }
    ]);
    const filterOptions = ref([
        {
            name: t('filters.all'),
            api: '',
        },
        {
            name: t('filters.today'),
            api: 'today',
        },
        {
            name: t('filters.this_week'),
            api: 'thisweek',
        },
        {
            name: t('filters.last_week'),
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
            const menuList = result.map((menu: any) => {
                return Object.fromEntries(Object.entries(menu).filter(([key]) => key !== "items"))
            });
            
            menus.value = menuList;
            rawMenus.value = result;
        } catch (er) {
            console.error(t('errors.fetch_menu'), er);
            EventBus.emit('showToast', {
                type: 'error',
                message: t('errors.fetch_menu_message')
            });
        } finally {
            isloading.value = false
        }
    }
    const isViewing = ref(true)
    const selectedMenu = ref<any>();
    const viewMenu = (ts: any) => {
        isViewing.value = true;
        selectedMenu.value = rawMenus.value.filter((item:any) => item.Code == ts.Code)[0];
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
                        {{ t('menu.actions.add') }}
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