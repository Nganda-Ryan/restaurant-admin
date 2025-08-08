    <script setup lang="ts">
    import { ref, defineAsyncComponent, onBeforeMount, computed } from 'vue';
    import router from '@/router';
    import Spinner from '@/components/Utilities/Spinner.vue';
    import DefaultCard from '@/components/Forms/DefaultCard.vue';
    import { useConfigStore } from '@/stores/config';
    import ButtonAction from '@/components/Buttons/ButtonAction.vue';
    import InputGroup from '@/components/Forms/InputGroup.vue';
    import SelectGroupOne from '@/components/Forms/SelectGroup/SelectGroupOne.vue';
    import {  createTable, updateTable,generateCode, createTeam} from '@/services/database';
    import type ToastPayload from '@/types/Toast';
    import type Option from '@/components/Utilities/interfaceModel'
    import EventBus from '@/EventBus';
    import type { Team } from '@/services/serviceInterface';
    import { useAuthStore } from '@/stores/auth';

    const configStore = useConfigStore();
    const isSaving = ref<boolean>(false);
    const emits = defineEmits(['cancel', "save", "back", "created"]);
    const authStore = useAuthStore();


    const restaurantCode = authStore.restaurantCode;

    const props = defineProps({
        action: {
            type: String,
            required: true,
            validator: (value: string) => ['add', 'update'].includes(value)
        },
        team: {
            type: Object as () => Partial<Team>,
            default: () => ({})
        },
        role: {
            type: Array as () => Array<{name: string, api: string}>,
            required: true,
            default: () => []
        }
        });

    const teamForm = ref<Team>({
        external_id: '',
        first_name:'',
        last_name:'',
        phone_number: '',
        restaurantCode:'',
        email: '',
        password:'',
        roleCode: '',
        adress: '',
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
        teamForm.value = {
        external_id: '',
        first_name:'',
        last_name:'',
        phone_number: '',
        restaurantCode:'',
        email: '',
        password:'',
        roleCode: '',
        adress: '',
        };
    };

    const stopAction = () => {
        resetForm();
        emits('cancel');
    };

const roleOptions = computed(() => {
    return props.role.map(role => ({
        name: role.name,
        api: role.api
    }));
});
    const saveForm = async () => {
        try {
            isSaving.value = true;
            // Générer le code pour les nouvelles table
            const usetoken = authStore.jwt;
            const payload = {
                contact: {
                    external_id: teamForm.value.external_id,
                    first_name: teamForm.value.first_name,
                    last_name: teamForm.value.last_name,
                    phone_number: teamForm.value.phone_number,
                    email: teamForm.value.email,
                    adress: teamForm.value.adress || '',
                },
                credentials: {
                    username: teamForm.value.email,
                    password: teamForm.value.password,
                },
                restaurantCode: restaurantCode,
                roleCode: teamForm.value.roleCode,
            };

            if (props.action === "add") {
                console.log('payload.team', payload)
                const result = await createTeam(payload, usetoken);
                console.log('updateTable', result);
            } else if (props.action === "update") {
                console.log('props.table', payload);
                //const result = await updateTeam(payload);
                //console.log('updatedTable', result);
            }

            EventBus.emit('showToast', {
                type: "success",
                message: `User ${props.action === "update" ? "mise à jour" : "créée"} avec succès`
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
        if (props.action === "update" && props.team) {
            teamForm.value = {
                first_name: props.team.first_name || '',
                last_name:props.team.last_name || '',
                phone_number: props.team.phone_number || '',
                restaurantCode:props.team.restaurantCode || '',
                email: props.team.email || '',
                password:props.team.password || '',
                roleCode: props.team.roleCode || '',
                adress: props.team.adress || '',
            }
            console.log('teamForm', teamForm.value);
        }
        console.log('role.data-->', props.role)
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
                            <span class="text-nowrap ml-2">Retour</span>
                        </button>
                    </template>

                    <form @submit.prevent="saveForm">
                    <div class="p-6.5">
                        <div class="mb-4.5 flex flex-col md:flex-row gap-6">
                            <InputGroup 
                            label="Nom" 
                            type="text" 
                            placeholder="Ex: Dupont"
                            customClasses="w-full xl:w-1/2"
                            v-model="teamForm.last_name"
                            required
                            />
                            <InputGroup 
                            label="Prénom" 
                            type="text" 
                            placeholder="Ex: Jean"
                            customClasses="w-full xl:w-1/2"
                            v-model="teamForm.first_name"
                            required
                            />
                        </div>
                        
                        <div class="mb-4.5 flex flex-col md:flex-row gap-6">
                            <InputGroup 
                            label="Email" 
                            type="email" 
                            placeholder="Ex: jean.dupont@example.com"
                            customClasses="w-full xl:w-1/2"
                            v-model="teamForm.email"
                            required
                            />
                            <InputGroup 
                            label="Téléphone " 
                            type="text" 
                            placeholder="+237655123189"
                            customClasses="w-full xl:w-1/2"
                            v-model="teamForm.phone_number"
                            />
                        
                        </div>
   
                        <div class="mb-4.5 flex flex-col md:flex-row gap-6">
                            <InputGroup 
                            label="Adresse" 
                            type="text" 
                            placeholder="Adresse complète"
                            customClasses="w-full xl:w-1/2"
                            v-model="teamForm.adress"
                            />
                            <InputGroup 
                            v-if="props.action === 'add'"
                            label="Mot de passe" 
                            type="password" 
                            placeholder="••••••••"
                            customClasses="w-full xl:w-1/2"
                            v-model="teamForm.password"
                            required
                            />
                        </div>
                        
                        <div class="mb-4.5 flex flex-col md:flex-row gap-6">
                        <SelectGroupOne 
                        label="Rôle"
                        :options="roleOptions"
                        :placeholder="'--Select Role--'"
                        v-model="teamForm.roleCode"
                         customClasses="w-full"
                        />
                        </div>

                        <div class="flex justify-end mt-10 gap-4">
                        <button-action 
                            @click="stopAction" 
                            custom-classes="text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        >
                            Annuler
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