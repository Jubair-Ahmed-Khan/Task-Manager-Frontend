<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
    email: '',
    password: '',
})

const errors = ref({})
const generalError = ref('')
const loading = ref(false)

const login = async () => {
    loading.value = true
    errors.value = {}
    generalError.value = ''

    try {
        await authStore.login(form)

        router.push('/dashboard')
    } catch (error) {
        if (error.response?.status === 422) {
            errors.value = error.response.data.errors
        } else if (error.response?.status === 401) {
            generalError.value = 'Invalid email or password.'
        } else {
            generalError.value = 'Something went wrong.'
        }
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">

        <div class="w-full max-w-md">

            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900">
                    Task Manager
                </h1>

                <p class="mt-2 text-gray-600">
                    Sign in to your account
                </p>
            </div>

            <div class="bg-white rounded-2xl shadow-lg p-8">

                <form @submit.prevent="login" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>

                        <input
                            v-model="form.email"
                            type="email"
                            placeholder="you@example.com"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >

                        <p v-if="errors.email" class="mt-1 text-sm text-red-600">
                            {{ errors.email[0] }}
                        </p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>

                        <input
                            v-model="form.password"
                            type="password"
                            placeholder="••••••••"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >

                        <p v-if="errors.password" class="mt-1 text-sm text-red-600">
                            {{ errors.password[0] }}
                        </p>
                    </div>

                    <div v-if="generalError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p class="text-sm text-red-600">
                            {{ generalError }}
                        </p>
                    </div>

                    <!-- Login Button -->
                    <button
                        type="submit"
                        :disabled="loading"
                        class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition duration-200"
                    >
                        {{ loading ? 'Logging in...' : 'Login' }}
                    </button>

                </form>

                <div class="mt-6 text-center text-sm text-gray-600">

                    Don't have an account?

                    <router-link
                        to="/register"
                        class="text-blue-600 font-semibold hover:text-blue-700"
                    >
                        Register
                    </router-link>

                </div>

            </div>

        </div>

    </div>
</template>