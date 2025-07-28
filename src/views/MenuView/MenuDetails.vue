<script setup lang="ts">
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import DefaultCardSkeleton from '@/components/Forms/DefaultCardSkeleton.vue';
    const NewMenuForm = defineAsyncComponent(() => import('./NewMenuForm.vue'));
    const Spinner = defineAsyncComponent(() => import('@/components/Utilities/Spinner.vue'));
    import { defineAsyncComponent, onBeforeMount, ref } from 'vue';
    import TableOne from '@/components/Tables/TableOne.vue';
    import router from '@/router';
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    const PopupModal = defineAsyncComponent(() => import('@/components/Modals/PopupModal.vue'));
    import { fetchSingleMenu, deleteMenu, deleteMenuItem } from '@/services/database';
    const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));
    const InputGroup = defineAsyncComponent(() => import('@/components/Forms/InputGroup.vue'));
    import type { MenuRequest, Plat } from '../../services/serviceInterface';
    import { isExpiry } from '@/components/Utilities/UtilitiesFunction';
    import type ToastPayload from '@/types/Toast';
    import EventBus from '@/EventBus';
    import { useAuthStore } from '@/stores/auth';




    const authStore = useAuthStore();
    const _token = authStore.jwt;
    const restaurantCode = authStore.restaurantCode;


    const emits = defineEmits(['cancel', "go-back"]);

    interface Param {
        action: string,
        menucode: string
    }
    const menuCode = ref('');
    const menuInfo = ref<MenuRequest>({
        Code: "",
        Title: "",
        Description: "",
        StartDate: "",
        EndDate: "",
        RestaurantCode: restaurantCode,
    });
    const titles = ref([
        {
            label: 'Title',
            name: "Title",
            type: 'url',
            event: "view",
            filterable: false,
        },
        {
            name: 'BasePrice',
            type: "text",
            label: 'Price',
            filterable: true,
        },
        {
            name: 'QuantityAvailable',
            type: "text",
            label: 'Quantity',
            filterable: true,
        },
        {
            name: 'description',
            type: "text-rich",
            label: 'Description',
            filterable: true,
        },
        {
            name: 'Actions',
            type: 'action',
            label: 'Actions',
            actions: [
                {
                    name: "View",
                    icone: `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                            <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clip-rule="evenodd" />
                        </svg>
                    `,
                    event: 'view'

                },
                {
                    name: "Delete",
                    icone: `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                            <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                        </svg>
                    `,
                    event: 'delete'
                },
            ]
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
    const isloading = ref(true);
    const action = ref('view');
    const isEditing = ref<Boolean>(false);
    const isCloning = ref<Boolean>(false);
    const isModalOpen = ref(false);
    const isDeleting = ref(false);
    const plats = ref<Plat[]>([{
        Code: "",
        BasePrice: 0,
        CategoryCode: "",
        content: [],
        Currency: "",
        Likes: 0,
        Title: "",
    }]);
    
    
    const viewPlat = (ts: any) => {
        console.log("** viewPlat", ts);
        window.location.href = `/plates/${ts.api}/view`
    }
    const deleteItemAction = async (ts: any) => {
        try {
            isDeleting.value = true;
            await deleteMenuItem([{
                "PlateCode": ts.Code,
                "MenuCode": menuInfo.value.Code
            }], _token);

            const toastPayload: ToastPayload = {
                type: "success",
                message: `Item ${ts.Title} deleted successfully ! 🍕`
            }
            EventBus.emit('showToast', toastPayload);
            await fetchMenu();
        } catch (e) {
            console.log("MenuDetails.deleteItemAction.error", e)
            const toastPayload: ToastPayload = {
                type: "danger",
                message: `Something went wrong during the process ! 🍕`
            }
            EventBus.emit('showToast', toastPayload);
        }
        finally {
            isDeleting.value = false;
        }
    }
    const handleEditMenu = (e: any) => {
        console.log("handleEditMenu", menuInfo.value);
        isEditing.value = true;
        isCloning.value = false;
    }
    const handleDeleteMenu = (e: any) => {
        isModalOpen.value = true;
    }
    const handleCloneMenu = (e: any) => {
        isCloning.value = true;
        isEditing.value = false;
    }
    const handleCloseModal = () => {
        console.log('handleCloseModal')
        isModalOpen.value = false;
    }
    
    const deleteAction = async () => {
        try {
            isDeleting.value = true;
            console.log('menuifa.code', menuInfo.value.Code)
            await deleteMenu([{Code: menuInfo.value.Code}], _token, restaurantCode);
    
            router.push({path: '/menus'})
        } catch (e) {
            console.log("MenuDetails.handleDeleteMenu.error", e)
        }
        finally {
            isDeleting.value = false;
        }
    }
    const cancel = () => {
        isEditing.value = false;
        isCloning.value = false;
        window.location.reload();
    }
    const goBack = () => {
        // window.location.href = '/menus';
        window.history.back();
    }
    const fetchMenu = async () => {
        isloading.value = true;
        try {
            const params = router.currentRoute.value.params as unknown as Param;
            action.value = params.action;
            menuCode.value = params.menucode;

            const result = await fetchSingleMenu(menuCode.value, _token, restaurantCode);
            console.log('result', result)
            menuInfo.value = result[0].Menu;
            console.log('result[0].Menu', result[0].Menu)
            plats.value = result.map((item:any) => {
                let temp = {
                    ...item.Plat,
                    QuantityAvailable: item.QuantityAvailable,
                    description: item.Plat.Description,
                    api: item.PlateCode
                }
                return temp
            });
        } catch (er) {
            console.log('error', er);
        } finally {
            isloading.value = false;
        }
    }


    onBeforeMount(async () => {
        await fetchMenu();
    });
</script>

<template>
    <!-- ====== Form Elements Section Start -->
    <div class="grid grid-cols-1 gap-12 sm:grid-cols-1">
        <div class="flex flex-col gap-9">
            <!-- Input Fields Start -->
            <template v-if="!isEditing && !isCloning">
            <DefaultCard :cardTitle="`${menuInfo.Title}`" v-if="!isloading">
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
                    <div class="flex items-center justify-center">
                        <button-action v-if="!isExpiry(menuInfo.EndDate)" @click='handleEditMenu' custom-classes="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Edit</button-action>
                        <button-action @click="handleCloneMenu" custom-classes="text-slate-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Clone</button-action>
                        <button-action @click="handleDeleteMenu" custom-classes="text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Delete</button-action>
                    </div>
                </template>
                <form @submit.prevent="">
                    <div class="p-6.5">
                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <input-group label="Menu Code" type="text" customClasses="w-full xl:w-1/2" disabled v-model="menuInfo.Code" />

                            <input-group label="Title" type="text" customClasses="w-full xl:w-1/2" disabled v-model="menuInfo.Title" />
                        </div>
                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <input-group label="Start Date" type="text" customClasses="w-full xl:w-1/2" disabled v-model="menuInfo.StartDate" />

                            <input-group label="End Date" type="text" customClasses="w-full xl:w-1/2" disabled v-model="menuInfo.EndDate" />
                        </div>
                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row pr-5">
                            <input-group label="Description" type="textarea" customClasses="w-full xl:w-1/2" disabled v-model="menuInfo.Description" />
                        </div>
                    </div>
                </form>

                <div class="w-full px-6 font-bold gap-2.5 py-2 hover:bg-opacity-90 lg:px-6 xl:px-6 text-white bg-gradient-to-r from-olive-800 to-olive-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 text-sm me-2 mb-2">
                    PLATE LIST
                </div>
                <div>
                    <TableOne :items="titles" :datas="plats" :options="filterOptions" @view="viewPlat" @delete="deleteItemAction" :filterable="false"/>
                </div>
            </DefaultCard>
            </template>
            <template v-else-if="isEditing">
                <NewMenuForm  @cancel="cancel"  :action="'update'" :menu="menuInfo" :plats="plats"/>
            </template>
            <template v-else-if="isCloning">
            <NewMenuForm  @cancel="cancel"  :action="'clone'" :menu="menuInfo" :plats="plats"/>
            </template>
            <DefaultCardSkeleton v-if="isloading"/>
            <!-- Input Fields End -->
        </div>

        <PopupModal :message="`Are you sure you want to delete this Menu ? This action cannot be undone.`" :is-open="isModalOpen" v-if="isModalOpen" @close="handleCloseModal" :title="'Menu deletion'">
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
        <SpinnerOverPage v-if="isloading" />
    </div>
    <!-- ====== Form Elements Section End -->
</template>
<style scoped></style>
