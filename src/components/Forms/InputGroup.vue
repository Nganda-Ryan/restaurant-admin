<script setup lang="ts">
  import { computed, ref, type PropType } from 'vue';

  const props = defineProps({
    label: String,
    type: String,
    placeholder: String,
    customClasses: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: [String, Number, File] as PropType<string | number | File >,
    },
    max: Number
  });

  const emit = defineEmits(['update:modelValue']);
  const base64Data = ref<string | null>(null);

  const isFile = computed(() => {
      return props.modelValue instanceof File;
  });

  // Cette fonction est appelée lorsque l'utilisateur sélectionne un fichier
  const updateValue = (event: Event) => {
    const target = event.target as HTMLInputElement;

    // Si le type est "file", on traite le fichier et on l'émet sous forme de base64
    if (target.type === 'file' && target.files) {
      const file = target.files[0];
      if (file) {
        emit("update:modelValue", file);
        // const reader = new FileReader();

        // reader.onload = () => {
        //   base64Data.value = reader.result as string; // On stocke l'image en base64
        //   emit("update:modelValue", base64Data.value); // On émet la valeur en base64
        // };

        // reader.onerror = (error) => {
        //   console.error("File reading error:", error);
        // };

        // reader.readAsDataURL(file); // On lit le fichier en base64
      }
    } else if (target.type !== 'file') {
      // Pour les autres types d'input (textarea, text, etc.), on met à jour le modèle directement
      emit("update:modelValue", target.value);
    }
  };
</script>

<template>
  <div :class="customClasses">
    <label class="mb-2 block text-black dark:text-white" v-if="label">
      {{ label }}
      <span v-if="required" class="text-meta-1">*</span>
    </label>

    <!-- Gestion du textarea -->
    <template v-if="props.type === 'textarea'">
      <textarea 
        :placeholder="placeholder ?? ''" 
        :disabled="disabled"
        :value="modelValue as string" 
        @input="updateValue" 
        :required="required" 
        :maxlength="max" 
        class="w-full rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" 
      />
    </template>

    <!-- Gestion de l'input file -->
    <template v-if="props.type === 'file'">
      <input 
        type="file" 
        :placeholder="placeholder ?? ''"
        :disabled="disabled" 
        @change="updateValue" 
        :required="required" 
        :maxlength="max" 
        class="w-full rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-5 h-[42px] font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
      />
    </template>

    <!-- Gestion des autres types d'input (text, email, etc.) -->
    <template v-if="props.type !== 'textarea' && props.type !== 'file'">
      <input 
        :type="props.type" 
        :placeholder="placeholder ?? ''" 
        :disabled="disabled" 
        :value="modelValue" 
        @input="updateValue" 
        :required="required" 
        :maxlength="max" 
        class="w-full rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" 
      />
    </template>
  </div>
</template>

<style scoped>
</style>
