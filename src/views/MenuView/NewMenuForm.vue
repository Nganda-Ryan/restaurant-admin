<script setup lang="ts">
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import SelectGroupSearchable from '@/components/Forms/SelectGroup/SelectGroupSearchable.vue';
    import { createMenu, fetchPlate, formatedDate, generateCode, updateMenu, cloneMenu } from '@/services/database';
    import { onBeforeMount, ref } from 'vue';
    import InputGroup from '@/components/Forms/InputGroup.vue';
    import Spinner from '@/components/Utilities/Spinner.vue';
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import TableOne from '@/components/Tables/TableOne.vue';
    import EventBus from '@/EventBus';
    import type PlateOption from '../../components/Utilities/interfaceModel';
    import type { MenuRequest } from '../../services/serviceInterface';
    import type ToastPayload from '@/types/Toast';

    const emits = defineEmits(['cancel', "save"]);
    const props = defineProps({
        action: {
            type: String,
        },
        menu: {
            type: Object
        },
        plats: {
            type: Object
        }
    });
    
    const reloadView = ref(false);
    const plateList = ref<Array<PlateOption>>([])
    const plateListToadd = ref<Array<any>>([])
    const isSaving = ref<Boolean>(false);
    const selectedItem = ref<any>(null)
    const menuInfo = ref<MenuRequest>({
        Code: "",
        Title: "",
        Description: "",
        StartDate: "",
        EndDate: "",
    });
    const quantity = ref<number>(1)
    const titles = ref([
        {
            label: 'Title',
            name: "name",
            type: 'url',
            event: "view",
            filterable: false,
        },
        {
            name: 'price',
            type: "text",
            label: 'Price',
            filterable: true,
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
    const resetInput = ref<boolean>(false);
    const startTime = ref(`${(new Date().getHours()).toString().padStart(2, '0')}:${(new Date().getMinutes() + 10).toString().padStart(2, '0')}`);
    const endTime = ref(`${(new Date().getHours() + 6).toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`);


    const handleSelection = (item: string) => {
        selectedItem.value = item
    }
    const stopAction = () => {
        emits('cancel', reloadView);
    }
    const saveMenu = async () => {
        isSaving.value = true;
        try {
            let code: string | undefined = "";
            console.log("ACTION", props.action)
            if(menuInfo.value.Title){
                code = props.action == "update" ? menuInfo.value.Code : generateCode(menuInfo.value.Title);
            }
            
            const plates = plateListToadd.value.map(i => {
                return {
                    PlateCode: i.api,
                    QuantityAvailable: i.quantity
                }
            });
            

            const payload = {
                "Code": props.action == "update" ? code : code!.replace(/\s+/g, ''),
                "Title": menuInfo.value.Title,
                "Description": menuInfo.value.Description,
                "StartDate": getStartDate(menuInfo.value.StartDate + ' ' + startTime.value + ':00'),
                "EndDate": getEndDate(menuInfo.value.EndDate + ' ' + endTime.value + ':00'),
                "items":plates
            }
            console.log('**Payload', payload)
            let result: any = "";
            if(props.action == "update"){
                result = await updateMenu(payload)
            } else if(props.action == "clone"){
                result = await cloneMenu(payload, menuInfo.value.Code)
            } else {
                result = await createMenu(payload)
            }
            
            const toastPayload: ToastPayload = {
                type: "success",
                message: `Menu ${props.action == "update" ? "Updated" : "Created"} successfully. Happy meal ;P`
            }
            menuInfo.value = {
                Code: "",
                Title: "",
                Description: "",
                StartDate: "",
                EndDate: "",
            };
            plateListToadd.value = [];
            reloadView.value = true;
            EventBus.emit('showToast', toastPayload);
            reloadView.value = true;
        } catch (error:any) {
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
    const getPlate = async () => {
        const result = await fetchPlate();
        plateList.value = result.map((item:any) => {
            return {
                name: item.Title,
                api: item.Code,
                price: item.BasePrice
            }
        })
        plateList.value.sort((a, b) => a.name.localeCompare(b.name));
    }
    const handleRemovePlace = (ts: any) => {
        plateList.value.push(ts);
        
        plateListToadd.value = plateListToadd.value.filter(item => item.api!= ts.api);
        plateList.value.sort((a, b) => a.name.localeCompare(b.name));
        plateListToadd.value.sort((a, b) => a.name.localeCompare(b.name));
    }
    const handleIncrement = (ts: any) => {
        plateListToadd.value = plateListToadd.value.map(item => {
            if(item.api == ts.api){
                return {
                   ...item,
                    quantity: item.quantity + 1
                }
            }
            return item;
        })
        console.log('plateListToadd.value', plateListToadd.value)
    }
    const handleDecrement = (ts: any) => {
        if(ts.quantity <= 1) {
            handleRemovePlace(ts);
        }
        plateListToadd.value = plateListToadd.value.map(item => {
            if(item.api == ts.api && item.quantity > 1){
                return {
                   ...item,
                    quantity: item.quantity - 1
                }
            }
            return item;
        })
    }
    const handdleAddPlate = () => {
        if(plateList.value.length <= 0 || !selectedItem.value){return}

        plateListToadd.value.push({
            ...selectedItem.value,
            quantity: quantity.value
        });
        selectedItem.value = null;
        plateList.value = plateList.value.filter(item1 => !plateListToadd.value.some(item2 => item2.api == item1.api));

        
        plateListToadd.value.sort((a, b) => a.name.localeCompare(b.name));
        plateList.value.sort((a, b) => a.name.localeCompare(b.name));
        resetInput.value = !resetInput.value;
        quantity.value = 1;
    }



    const validDate = (date: string, context: 'start' | 'end'): boolean => {

        if(context == 'start'){
            if(new Date(date) < new Date()){
                throw new Error("The start date should be higher than the current date");
            }
        } else if(context == 'end'){
            if(menuInfo.value.StartDate){
                if(new Date(date) <= new Date(menuInfo.value.StartDate + ' ' + startTime.value + ':00')){
                    throw new Error("The end date should be higher than the start date");
                }
            }
        }
        return true;
    }

    const getStartDate = (_date: string | undefined) => {
        if(_date == undefined) return '';

        console.log('_date', _date)
        let result: string | undefined = '';
        if(validDate(_date, "start")){
            console.log('starIsValid')
            result =  menuInfo.value.StartDate + ' ' + startTime.value + ':00';
        }

        return result;
    }
    const getEndDate = (_date: string | undefined) => {
        if(_date == undefined)
            return '';
        
        let result = '';
        if(menuInfo.value.EndDate){
            if(validDate(_date, "end")){
                result = menuInfo.value.EndDate + ' ' + endTime.value + ':00'
            }
        }

        return result;
    }

    onBeforeMount(() => {
        getPlate();
        if(props.action == "update" || props.action == "clone"){
            if(props.plats){
                plateListToadd.value = props.plats.map((item: any) => {
                    return {
                        name: item.Title,
                        quantity: item.QuantityAvailable,
                        price: item.BasePrice,
                        api: item.api
                    }
                });
                plateList.value = plateList.value.filter(item1 => !plateListToadd.value.some(item2 => item2.api == item1.api));
                menuInfo.value = props.menu as MenuRequest;
                if(menuInfo.value.EndDate){
                    let formattedDate = menuInfo.value.EndDate.split(" ")[0]
                    menuInfo.value.EndDate = formattedDate;
                }
            }
        }
        menuInfo.value.EndDate = formatDate(menuInfo.value.EndDate);
        menuInfo.value.StartDate = formatDate(menuInfo.value.StartDate);
        console.log('menuInfo.value.StartDate', menuInfo.value.StartDate)
    })
    const formatDate = (rawDate: string | undefined) => {
        const res = rawDate!.split(" ");
        return res[0];
    };

    const getAction = (act:string | undefined) => {
        console.log('act', act)
        switch (act) {
            case "edit":
                return "Update"
            case "clone":
                return "Clone"
            case "add":
                return "Save"
            default:
                return "Update"
        }
    }
</script>

<template>
    <!-- ====== Form Elements Section Start -->
    <div class="grid grid-cols-1 gap-12 sm:grid-cols-1">
        <div class="flex flex-col gap-9">
            <!-- Input Fields Start -->
            <DefaultCard :cardTitle="`${getAction(props.action)} Menu`">
                <template v-slot:button>
                    <button class="flex items-center" @click="stopAction">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>&nbsp;&nbsp;
                        <span class="text-nowrap">{{ 'Go back' }}</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                    </button>
                </template>
                <form @submit.prevent="saveMenu">
                    <div class="p-6.5">
                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <input-group label="Title" type="text" placeholder="Enter the menu title" customClasses="w-full xl:w-1/2" v-model="menuInfo.Title" required />
                            <div class="flex justify-between items-end w-full xl:w-1/2">
                                <input-group label="Start Date" type="date" placeholder=""
                                    customClasses="w-5/6" v-model="menuInfo.StartDate" required />
                                <input type="time" id="sdtime" name="sdtime" class="h-10" v-model="startTime">
                            </div>
                        </div>
                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div class="flex justify-between items-end w-full xl:w-1/2">
                                <input-group label="End Date" type="date" placeholder=""
                                    customClasses="w-5/6" v-model="menuInfo.EndDate" required />
                                <input type="time" id="edtime" name="edtime" class="h-10" v-model="endTime">
                            </div>
                            <input-group label="Describe the menu" type="textarea" placeholder="Enter the description of your menu" customClasses="xl:w-1/2" v-model="menuInfo.Description" required />
                        </div>

                        <template v-if="props.action != 'clone'">
                            <div class="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                <SelectGroupSearchable customClasses="w-full xl:w-1/2" :items="plateList" @item-selected="handleSelection" label="Select a plate" placeholder="Select a plate ..." :required="false" :resetTrigger="resetInput">
                                    <template v-slot:action>
                                        <input min="1" type="number" v-model="quantity" required class="w-15 h-10 rounded border-[1.5px] text-black border-stroke bg-transparent ml-2 py-1.5 px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black  dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
                                        <button-action @click='handdleAddPlate' type="button" custom-classes=" mx-2 h-10 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm mr-0 py-2.5 text-center">
                                            add
                                        </button-action>
                                    </template>
                                </SelectGroupSearchable>
                            </div>

                       
                            <div class="w-full px-6 font-bold gap-2.5 py-2  mb-10 mt-8 hover:bg-opacity-90 lg:px-6 xl:px-6 text-white bg-gradient-to-r from-olive-800 to-olive-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 text-sm me-2">
                                PLATE LIST
                            </div>
                            
                            <div v-if="plateListToadd.length > 0">
                                <TableOne :items="titles" :datas="plateListToadd" :options="filterOptions" @remove="handleRemovePlace" @increment="handleIncrement" @decrement="handleDecrement" :filterable="false" :pagination="false"/>
                            </div>
                            <div v-else class="text-center py-4">
                                Please add a plate ;P
                            </div>
                        </template>

                        <div class="flex justify-end mt-10">
                            <button @click="stopAction" type="button" class="text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
                                Cancel
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
    <!-- ====== Form Elements Section End -->
</template>
