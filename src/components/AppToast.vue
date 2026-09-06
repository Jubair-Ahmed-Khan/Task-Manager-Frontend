<script setup>
defineProps({
    show: {
        type: Boolean,
        default: false,
    },

    message: {
        type: String,
        default: '',
    },

    type: {
        type: String,
        default: 'success',
    },
})
</script>

<template>
    <Transition
        enter-active-class="transition duration-300"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <div
            v-if="show"
            class="fixed top-5 right-5 z-10000 w-80"
        >
            <div
                class="rounded-lg shadow-lg px-5 py-4"
                :class="
                    type === 'success'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                "
            >
                <div class="flex items-center gap-3">

                    <div class="font-medium">
                        {{ message }}
                    </div>

                </div>
            </div>
        </div>
    </Transition>
</template>