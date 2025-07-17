    <script setup lang="ts">
    import { ref, defineAsyncComponent, onBeforeMount } from 'vue';
    import router from '@/router';
    import Spinner from '@/components/Utilities/Spinner.vue';
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import { useConfigStore } from '@/stores/config';
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import InputGroup from '@/components/Forms/InputGroup.vue';
    import {  createTable, updateTable,generateCode } from '@/services/database';
    import type ToastPayload from '@/types/Toast';
    import EventBus from '@/EventBus';
    import type { Table } from '@/services/serviceInterface';
    import { useAuthStore } from '@/stores/auth';


    const _authStore = useAuthStore();
    const _token = _authStore.jwt;
    const codeRestaurant = _authStore.restaurantCode;
    const configStore = useConfigStore();
    const isSaving = ref<boolean>(false);
    const emits = defineEmits(['cancel', "save", "back", "created"]);

    const props = defineProps({
        action: {
            type: String,
            required: true,
            validator: (value: string) => ['add', 'update'].includes(value)
        },
        table: {
            type: Object as () => Partial<Table>,
            default: () => ({})
        }
    });

    const tableForm = ref<Table>({
        Code: '',
        Title: '',
        Description: '',
    });

    const status = ref([
        { label: 'Inactive', value: false },
        { label: 'Active', value: true }
    ]);

    const getActionLabel = () => {
        return props.action === "add" ? "Enregistrer" : "Mettre à jour";
    };

    const goBack = () => {
        emits('back');
    };

    const resetForm = () => {
        tableForm.value = {
            Code: '',
            Title: '',
            Description: ''
        };
    };

    const stopAction = () => {
        resetForm();
        emits('cancel');
    };

    const saveTable = async () => {
        try {
            isSaving.value = true;
            // Générer le code pour les nouvelles tables
            if (props.action === "add" && tableForm.value.Title) {
                tableForm.value.Code = generateCode(tableForm.value.Title);
            }

            const payload = {
                Title: tableForm.value.Title,
                Description: tableForm.value.Description,
                Code: tableForm.value.Code,
                IsActive:true
            };

            if (props.action === "add") {
                const result = await createTable(payload, _token, codeRestaurant);
                console.log('updateTable', result);
            } else if (props.action === "update") {
                console.log('props.table', payload);
                const result = await updateTable(payload,_token, codeRestaurant);
                console.log('updatedTable', result);
            }

            EventBus.emit('showToast', {
                type: "success",
                message: `Table ${props.action === "update" ? "mise à jour" : "créée"} avec succès`
            });

            resetForm();
            emits('created', true);

        } catch (error: any) {
            console.error('Error:', error);
            const errMsg = error.response?.data?.body?.errors?.[0]?.message || "Une erreur s'est produite lors de l'opération";
            EventBus.emit('showToast', {
                type: "danger",
                message: errMsg
            });
        } finally {
            isSaving.value = false;
        }
    };

    onBeforeMount(() => {
        if (props.action === "update" && props.table) {
            tableForm.value = {
                Code: props.table.Code || '',
                Title: props.table.Title ,
                Description: props.table.Description || '',
                IsActive: props.table.IsActive ? true : false
            }
            console.log('tableForm', tableForm.value);
        }
    });
    </script>

    <template>
        <div class="grid grid-cols-1 gap-12 sm:grid-cols-1">
            <div class="flex flex-col gap-9">
                <DefaultCard :cardTitle="`${getActionLabel()} Table`">
                    <template v-slot:button>
                        <button class="flex items-center" @click="goBack">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            <span class="text-nowrap ml-2">{{ $t('back') }}</span>
                        </button>
                    </template>

                    <form @submit.prevent="saveTable">
                        <div class="p-6.5">
                            <div class="mb-4.5 flex flex-col gap-6">
                                <InputGroup 
                                    :label="$t('tables.title')" 
                                    type="text" 
                                    placeholder="Ex: Table #001"
                                    class="w-full" 
                                    v-model="tableForm.Title" 
                                    required 
                                />
                                
                                <InputGroup 
                                    :label="$t('Description')" 
                                    type="text" 
                                    :placeholder="$t('Table description')"
                                    class="w-full" 
                                    v-model="tableForm.Description" 
                                />

                                 <div class="w-full" v-if="props.action === 'update'">
                                    <label class="mb-2 block text-black dark:text-white">
                                        {{ $t('Status') }} <span class="text-meta-1">*</span>
                                    </label>
                                    <select 
                                        v-model="tableForm.IsActive"
                                        required 
                                        class="w-full rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 h-[38px] px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50"
                                    >
                                        <option v-for="(item, index) in status" :key="index" :value="item.value">
                                            {{ item.label }}
                                        </option>
                                    </select>
                                </div> 
                            </div>

                            <div class="flex justify-end mt-10 gap-4">
                                <button-action 
                                    @click="stopAction" 
                                    custom-classes="text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                    {{ $t('Cancel')}}
                                </button-action>
                                <button-action 
                                    type="submit" 
                                    custom-classes="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                    <spinner v-if="isSaving" /> 
                                    {{ getActionLabel() }}
                                </button-action>
                            </div>
                        </div>
                    </form>
                </DefaultCard>
            </div>
        </div>
    </template>

    <style scoped>
    .aligned-column {
        display: flex;
        align-items: center;
        padding-left: 10px;
    }
    </style>