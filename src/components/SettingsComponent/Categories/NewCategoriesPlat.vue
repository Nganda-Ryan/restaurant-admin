<script setup lang="ts">
    import { ref, defineAsyncComponent, computed, onMounted, onBeforeMount } from 'vue';
    import router from '@/router';
    import Spinner from '@/components/Utilities/Spinner.vue';
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import { useConfigStore } from '@/stores/config';
    import type { PlateOption, Content, Composition,Compositions, ProductOption , ResultItem, ApiResponse, composition, Categorieplat } from '@/services/serviceInterface';
    import { Cloudinary } from "@cloudinary/url-gen";
    import { AdvancedImage, placeholder } from "@cloudinary/vue";
    import { fill } from "@cloudinary/url-gen/actions/resize";
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import InputGroup from '@/components/Forms/InputGroup.vue';
    import SelectGroupSearchable from '@/components/Forms/SelectGroup/SelectGroupSearchable.vue';
    import type Option from '../../Utilities/interfaceModel';
    const SelectGroupOne = defineAsyncComponent(() => import('@/components/Forms/SelectGroup/SelectGroupOne.vue'));
    import { createCategoriePlate, generateCode,  updateCategoriePlat, fetchCategoriePlate} from '@/services/database';
    import type ToastPayload from '@/types/Toast';
    import EventBus from '@/EventBus';
    import TableOne from '@/components/Tables/TableOne.vue';
    

    const configStore = useConfigStore();
    const isSaving = ref<Boolean>(false);
    const isProductList= ref<Boolean>(false);
    const emits = defineEmits(['cancel', "save", "back", "created"]);
    const props = defineProps({
        action: {
            type: String,
        },
        plate: {
            type: Object,
            default: () => ({}) // Fournit un objet vide par défaut
        }
    });
    
    const CategorieplateInfo = ref<Categorieplat>({
        "Code": '',
        "Title": '',
        "IsActive":false 
    });

    const selectedItem = ref<any>(null);
    const quantity = ref<number>(1);
    const resetInput = ref<boolean>(false);
    const reloadView = ref<boolean>(false);

    const filterOptions = ref([]);
    const rawProduct = ref<any []>([]);

    const status = ref([
        { label: 'Inactive', value: 0 },
        { label:'Active', value: 0 }
        ])

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

const savePlate = async () => {

    try {
        isSaving.value = true;

        // Déterminer le code du plat
        if (props.action === "update") {
            console.log('props.plate', props.plate)
            CategorieplateInfo.value.Code = props.plate.Code; // Gardez le code existant ou une chaîne vide
        } else if (props.action == "add" && CategorieplateInfo.value.Title) {
            CategorieplateInfo.value.Code = generateCode(CategorieplateInfo.value.Title); // Générer un nouveau code pour un nouvel ajout
        }

        //Content creation
        if (props.action == "add") {
            const resultadd = await createCategoriePlate(CategorieplateInfo.value); // Création d'un nouveau plat
            console.log('createdPlate', resultadd);
        } else if (props.action === "update") {
            const resultupdate = await updateCategoriePlat(CategorieplateInfo.value); // Mise à jour du plat

            console.log('updateCategorieplate', resultupdate)
        }


        const toastPayload: ToastPayload = {
            type: "success",
            message: `Plate ${props.action == "update" ? "Updated" : "Created"} successfully. Happy meal ;P`
        }
        CategorieplateInfo.value = {
            "Code": '',
            "Title": '',
            "IsActive": false
        }

        EventBus.emit('showToast', toastPayload);


    } catch (error: any) {
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

    onBeforeMount(async () => {
        if (props.action === "update") {
            if (props.plate) {
                CategorieplateInfo.value = props.plate

            }
        }
    });
</script>

<template>
    <!-- ====== Form Elements Section Start -->
    <div class="grid grid-cols-1 gap-12 sm:grid-cols-1">
        <div class="flex flex-col gap-9">
            <!-- Input Fields Start -->
            <DefaultCard :cardTitle="`${getAction(props.action)} Category`">
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
                                customClasses="w-full xl:w-1/2" v-model="CategorieplateInfo.Title" required />
                            
                            <div class="w-full xl:w-1/2">
                                <label class="mb-2 block text-black dark:text-white">
                                    Status <span class="text-meta-1">*</span>
                                </label>
                                <select name="" id="" required class="w-full rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 h-[38px] px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50" >
                                    <option v-for="index in status" :key="index.value" :value="index.value"> {{ index.label }}</option>
                                </select>
                            </div>
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
<style>
.aligned-column {
    display: flex; /* Utiliser flexbox pour aligner le contenu */
    align-items: center; /* Centrer le contenu verticalement */
    padding-left: 10px; /* Ajuster le padding selon vos besoins */
}
</style>