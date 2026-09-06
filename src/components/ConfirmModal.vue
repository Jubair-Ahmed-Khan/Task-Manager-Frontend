<script setup>
defineProps({
    show: {
        type: Boolean,
        default: false,
    },

    title: {
        type: String,
        default: 'Confirm Action',
    },

    message: {
        type: String,
        default: 'Are you sure?',
    },
})

const emit = defineEmits([
    'confirm',
    'cancel',
])
</script>

<template>
    <Teleport to="body">

        <div
            v-if="show"
            class="fixed inset-0 z-10001 flex items-center justify-center p-4"
        >

            <!-- Backdrop -->
            <div
                class="absolute inset-0 bg-black/50"
                @click="emit('cancel')"
            ></div>

            <!-- Modal -->
            <div
                class="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl"
            >

                <div class="p-6">

                    <h2 class="text-xl font-bold text-gray-900">
                        {{ title }}
                    </h2>

                    <p class="mt-3 text-gray-500">
                        {{ message }}
                    </p>

                </div>

                <div
                    class="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3"
                >

                    <button
                        type="button"
                        @click="emit('cancel')"
                        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        @click="emit('confirm')"
                        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>

    </Teleport>
</template>