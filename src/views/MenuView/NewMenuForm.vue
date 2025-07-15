<script setup lang="ts">
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import SelectGroupSearchable from '@/components/Forms/SelectGroup/SelectGroupSearchable.vue';
    import { createMenu, fetchPlate, formatedDate, generateCode, updateMenu, cloneMenu, updateMenuItem,addMenuItem } from '@/services/database';
    import { defineAsyncComponent, onBeforeMount, ref } from 'vue';
    import InputGroup from '@/components/Forms/InputGroup.vue';
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import TableOne from '@/components/Tables/TableOne.vue';
    import EventBus from '@/EventBus';
    import type PlateOption from '../../components/Utilities/interfaceModel';
    import type { MenuRequest, FormattedDates } from '../../services/serviceInterface';
    import type ToastPayload from '@/types/Toast';
    import { useAuthStore } from '@/stores/auth';

    const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));
    const Spinner = defineAsyncComponent(() => import('@/components/Utilities/Spinner.vue'));


    const storedData = localStorage.getItem('profiles');

    const dataArray = storedData ? JSON.parse(storedData) : [];

    const restaurantCode = dataArray[0]?.RestaurantCode ?? '';

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
    
    const authStore = useAuthStore();
    const _token = authStore.jwt;
    const reloadView = ref(false);
    const plateList = ref<Array<PlateOption>>([])
    const plateListToadd = ref<Array<any>>([])
    const isSaving = ref<Boolean>(false);
    const selectedItem = ref<any>(null);
    const menuInfo = ref<MenuRequest>({
        Code: "",
        Title: "",
        Description: "",
        StartDate: "",
        EndDate: "",
        RestaurantCode: restaurantCode,
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
    const disableStartDate = ref<boolean>(false);
    const disableEndDate = ref<boolean>(false);

    const currentDate = new Date();

    const startDate = new Date(currentDate.getTime());
    startDate.setMinutes(currentDate.getMinutes() + 10);

    const endDate = new Date(currentDate.getTime());
    endDate.setHours(currentDate.getHours() + 6);

    const startTime = ref<string>(`${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`);
    const endTime = ref<string>(`${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`);

    const range = ref<FormattedDates>({
        startDate: "",
        endDate: ""
    });

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
            console.log('props.action', props.action)
            
            if(menuInfo.value.Title){
                code = props.action == "update" ? menuInfo.value.Code : generateCode(menuInfo.value.Title);
            }
            const existingPlates: any[] = [];
            const newPlates: any[] = [];

            plateListToadd.value.forEach(plate => {
                // Vérifie si le plat existe déjà dans la base de données (via plateListToadd)
            const isExisting = props.plats?.some((existingPlate: any) => existingPlate.api === plate.api);
                if (isExisting) {
                    // Plat existant (a un Id)
                    existingPlates.push({
                    PlateCode: plate.api,
                    QuantityAvailable: plate.quantity,
                    MenuCode: code // Inclure le code du menu
                    });
                } else {
                    // Nouveau plat (n'a pas d'Id)
                    // Nouveau plat
                    newPlates.push({
                        PlateCode: plate.api,
                        QuantityAvailable: plate.quantity,
                        MenuCode: code // Inclure le code du menu
                        //RestaurantCode: menuInfo.value.RestaurantCode
                    });
                }
            });

            
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
                "StartDate": menuInfo.value.StartDate + ' ' + startTime.value + ':00',
                "EndDate": menuInfo.value.EndDate + ' ' + endTime.value + ':00',
                "items":plates,
                "RestaurantCode": menuInfo.value.RestaurantCode
            }
            console.log('payload.clone:', payload)
            const validation = validateMenu(payload, props.action);
            console.log('**validation', validation)
            if(validation.isValid){
                let result: any = "";
                let itemResult: any = "";
                if(props.action == "update"){
                    result = await updateMenu(payload, _token);
                    if (existingPlates.length > 0) {
                    itemResult = await updateMenuItem(existingPlates, _token);
                    }

                    // Ajouter les nouveaux plats
                    if (newPlates.length > 0) {
                        itemResult = await addMenuItem(newPlates, _token);
                    }
                } else if(props.action == "clone"){
                    result = await cloneMenu(payload, menuInfo.value.Code, _token);
                    console.log('resultclone', result)
                } else {
                     console.log('payloadcreate', payload)
                    result = await createMenu(payload, _token);

                }
                
                const toastPayload: ToastPayload = {
                    type: "success",
                    message: `Menu ${props.action == "update" ? "Updated" : "Created"} successfully ! 🍕`
                }
                menuInfo.value = {
                    Code: "",
                    Title: "",
                    Description: "",
                    StartDate: "",
                    EndDate: "",
                    RestaurantCode: "",
                };
                plateListToadd.value = [];
                reloadView.value = true;
                EventBus.emit('showToast', toastPayload);
                reloadView.value = true;

            } else {
                throw new Error(validation.message);
            }
            
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
        const result = await fetchPlate(_token);
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
    if (plateList.value.length <= 0 || !selectedItem.value) { return }

    const plateToAdd = {
        ...selectedItem.value,
        quantity: quantity.value
    };

    // Vérifie si le plat existe déjà dans plateListToadd
    const existingPlateIndex = plateListToadd.value.findIndex(plate => plate.api === selectedItem.value.api);


    if (existingPlateIndex !== -1) {
        // Si le plat existe déjà, mettez à jour la quantité
        plateListToadd.value[existingPlateIndex].quantity += quantity.value;
    } else {
        // Sinon, ajoutez le plat à plateListToadd
        plateListToadd.value.push(plateToAdd);
    }

    // Retire le plat ajouté de plateList
    plateList.value = plateList.value.filter(item1 => 
        !plateListToadd.value.some(item2 => item2.api == item1.api)
    );

    // Trie les listes par ordre alphabétique
    plateListToadd.value.sort((a, b) => a.name.localeCompare(b.name));
    plateList.value.sort((a, b) => a.name.localeCompare(b.name));

    // Réinitialise les valeurs
    selectedItem.value = null;
    resetInput.value = !resetInput.value;
    quantity.value = 1;
};

    
    const validateMenu = (payload: any, action: string | undefined): { isValid: boolean, message: string } => {
        const currentDate = new Date();

        const validateDate = (dateString: string, disable: boolean, fieldName: string): { isValid: boolean, message: string } => {
            if (!dateString) return { isValid: true, message: '' };
            const date = new Date(dateString);
            if (disable) return { isValid: true, message: '' };
            if (date < currentDate) return { isValid: false, message: `${fieldName} ne peut pas être dans le passé.` };
            return { isValid: true, message: '' };
        };

        if (action === 'create' || action === 'clone') {
            const startDateValidation = validateDate(payload.StartDate, false, 'Date de début');
            const endDateValidation = validateDate(payload.EndDate, false, 'Date de fin');
            if (!startDateValidation.isValid) return startDateValidation;
            if (!endDateValidation.isValid) return endDateValidation;
            if (new Date(payload.EndDate) < new Date(payload.StartDate)) {
                return { isValid: false, message: 'La date de fin doit être après la date de début.' };
            }
            return { isValid: true, message: '' };
        } else if (action === 'update') {
            const startDateValidation = validateDate(payload.StartDate, disableStartDate.value, 'Date de début');
            const endDateValidation = validateDate(payload.EndDate, disableEndDate.value, 'Date de fin');
            if (!startDateValidation.isValid) return startDateValidation;
            if (!endDateValidation.isValid) return endDateValidation;
            return { isValid: true, message: '' };
        }

        return { isValid: false, message: 'Erreur de validation inconnue.' };
    };



    const updateDisabledDates = (_menuInfo: any): void => {
        console.log('_menuInfo', _menuInfo)
        const currentDate = new Date();

        if (_menuInfo.StartDate) {
            const startDate = new Date(_menuInfo.StartDate);
            disableStartDate.value = startDate < currentDate; // Désactive si date antérieure à maintenant
        } else {
            disableStartDate.value = false; // Réinitialiser si pas de StartDate
        }

        if (_menuInfo.EndDate) {
            const endDate = new Date(_menuInfo.EndDate);
            disableEndDate.value = endDate < currentDate; // Désactive si date antérieure à maintenant
        } else {
            disableEndDate.value = false; // Réinitialiser si pas de EndDate
        }
    };

    onBeforeMount(async () => {
        await getPlate();
        if(props.action == "update" || props.action == "clone"){
            if(props.action == "update"){updateDisabledDates(props.menu);}
            range.value = formatDates(props.menu);
            startTime.value = range.value.startDate;
            endTime.value = range.value.endDate;
            
            if(props.plats){
                plateListToadd.value = props.plats.map((item: any) => {
                    return {
                        name: item.Title,
                        quantity: item.QuantityAvailable,
                        price: item.BasePrice,
                        api: item.api
                    }
                });
                plateList.value = plateList.value.filter(item1 => !plateListToadd.value.some((item2: any) => item2.api == item1.api));
                menuInfo.value = props.menu as MenuRequest;
                if(menuInfo.value.EndDate){
                    let formattedDate = menuInfo.value.EndDate.split(" ")[0]
                    menuInfo.value.EndDate = formattedDate;
                }
            }
        }
        menuInfo.value.EndDate = getDate(menuInfo.value.EndDate);
        menuInfo.value.StartDate = getDate(menuInfo.value.StartDate);
    });

    const getDate = (rawDate: string | undefined) => {
        const res = rawDate!.split(" ");
        return res[0];
    };

    

    const getAction = (act:string | undefined) => {
        switch (act) {
            case "edit":
                return "Update"
            case "clone":
                return "Clone"
            case "create":
                return "Save"
            default:
                return "Update"
        }
    }

    const formatDates = (obj: any): FormattedDates => {
        // Helper function to format time in "HH:mm" format
        const formatTime = (date: Date): string => {
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        };

        // Parse StartDate and EndDate into Date objects
        const startDate = new Date(obj.StartDate);
        const endDate = obj.EndDate ? new Date(obj.EndDate) : null;

        // Format startDate's time
        const formattedStartDate = formatTime(startDate);

        let formattedEndDate: string;

        if (endDate && !isNaN(endDate.getTime())) {
            // If EndDate is valid, format its time
            formattedEndDate = formatTime(endDate);
        } else {
            // Otherwise, calculate EndDate as StartDate + 10 minutes
            const calculatedEndDate = new Date(startDate);
            calculatedEndDate.setMinutes(startDate.getMinutes() + 10);
            formattedEndDate = formatTime(calculatedEndDate);
        }

        return {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
        };
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
                                    customClasses="w-5/6" v-model="menuInfo.StartDate" required :disabled="disableStartDate"/>
                                <input type="time" id="sdtime" name="sdtime" class="h-10" v-model="startTime" :disabled="disableStartDate">
                            </div>
                        </div>
                        <div class="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div class="flex justify-between items-end w-full xl:w-1/2">
                                <input-group label="End Date" type="date" placeholder=""
                                    customClasses="w-5/6" v-model="menuInfo.EndDate" required :disabled="disableEndDate" />
                                <input type="time" id="edtime" name="edtime" class="h-10" v-model="endTime" :disabled="disableEndDate">
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
                                Please add a plate 🍕
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
