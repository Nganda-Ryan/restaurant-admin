
<script lang="ts" setup>
    import { computed, ref } from "vue";
    const emits = defineEmits(['close']);
    const props = defineProps({
        title: {
            type: String,
            default: "",
        },
        header: {
            type: String,
            required: false,
            default: "",
        },
        width: {
            type: String,
            default: "full",
            validator: (value: string) => ["xs", "sm", "md", "lg", "full"].indexOf(value) !== -1,
        },
        isOpen: {
            type: Boolean,
            default: false,
        }
    });
    
    const close = () => {
        emits('close');
    }
    const maxWidth = computed(() => {
    switch (props.width) {
        case "xs":
            return "w-2/12";
        case "sm":
            return "w-3/12";
        case "md":
            return "w-6/12";
        case "lg":
            return "w-9/12";
        case "full":
            return "w-full";
        default:
            return null;
    }
});

</script>

<template>
    <div class="fixed w-full h-full top-0 left-0 flex items-center justify-center z-99999 overflow-auto" v-if="isOpen">
        <div class="absolute w-full h-full inset-0 bg-black bg-opacity-75 transition-opacity" @click="close"></div>

        <div class="absolute max-h-full w-6/12 shadow-lg drop-shadow-lg" :class="maxWidth">
            <div class="container bg-white overflow-hidden rounded-lg">
                <div class="px-4 py-2 leading-none flex justify-between items-center font-semibold text-md bg-slate-100 border-b select-none">
                    <h3>{{ title }}</h3>
                    <div @click="close" class="text-2xl hover:text-slate-600 cursor-pointer">
                        &#215;
                    </div>
                </div>

                <!-- Body -->
                <div class="max-h-full px-4 py-4 mb-5">
                    <slot name="body"></slot>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </div>
</template>