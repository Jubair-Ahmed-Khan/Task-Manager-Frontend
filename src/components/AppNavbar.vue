<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const logout = async () => {
    await authStore.logout()

    router.push('/login')
}
</script>

<template>
    <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">

        <div>
            <h2 class="text-lg font-semibold text-gray-800">
                Task Management
            </h2>
        </div>

        <div class="flex items-center gap-4">

            <div
                v-if="authStore.user"
                class="text-right"
            >
                <p class="text-sm font-medium text-gray-800">
                    {{ authStore.user.name }}
                </p>

                <p class="text-xs text-gray-500">
                    {{ authStore.user.email }}
                </p>
            </div>

            <button
                @click="logout"
                class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
            >
                Logout
            </button>

        </div>

    </header>
</template>