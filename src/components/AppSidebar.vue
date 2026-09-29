<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const authStore = useAuthStore();

const isAdmin = computed(() => authStore.isAdmin);
const isEmployee = computed(() => authStore.isEmployee);
</script>

<template>
    <aside class="w-64 bg-gray-900 text-white min-h-screen flex flex-col">

        <!-- Logo -->
        <div class="h-16 flex items-center px-6 border-b border-gray-800">
            <h1 class="text-xl font-bold">
                Task Manager
            </h1>
        </div>


        <!-- User -->
        <div class="px-6 py-4 border-b border-gray-800">
            <div class="font-semibold">
                {{ authStore.user?.name || "User" }}
            </div>

            <div class="text-sm text-gray-400 mt-1">
                {{ authStore.roleNames.join(", ") }}
            </div>
        </div>


        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-2">

            <!-- Dashboard -->
            <template v-if="isEmployee">
                <router-link
                    to="/dashboard"
                    class="block px-4 py-3 rounded-lg transition"
                    :class="
                        route.path === '/dashboard'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                    "
                >
                    Dashboard
                </router-link>
            </template>
            <template v-if="isEmployee">
                <router-link
                    to="/time-tracking"
                    class="block px-4 py-3 rounded-lg transition"
                    :class="
                        route.path === '/time-tracking'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                    "
                >
                    <!-- <span>⏱️</span> -->
                    <span>Time Tracking</span>
                </router-link>
            </template>


            <!-- ADMIN -->
            <template v-if="isAdmin">
                <router-link
                    v-if="authStore.user?.roles?.some(role =>
                        (typeof role === 'string' ? role : role.name) === 'Admin'
                    )"
                    to="/analytics"
                    class="block px-4 py-3 rounded-lg transition"
                    :class="
                        route.path === '/analytics'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                    "
                >
                    <!-- <span>📊</span> -->
                    <span>Analytics Dashboard</span>
                </router-link>

                <router-link
                    to="/tasks"
                    class="block px-4 py-3 rounded-lg transition"
                    :class="
                        route.path.startsWith('/tasks')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                    "
                >
                    Manage Tasks
                </router-link>

                <RouterLink
                    to="/task-categories"
                    class="block px-4 py-3 rounded-lg transition"
                    :class="
                        route.path.startsWith('/task-categories')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                    "
                >
                    Task Categories
                </RouterLink>


                <router-link
                    to="/employees"
                    class="block px-4 py-3 rounded-lg transition"
                    :class="
                        route.path.startsWith('/employees')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                    "
                >
                    Employees
                </router-link>

                <router-link
                    :to="{ name: 'employee-performance' }"
                    class="block px-4 py-3 rounded-lg transition"
                    :class="
                        route.path.startsWith('/employee-performance')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                    "
                >
                    <!-- 📊 Employee Performance -->
                    Employee Performance
                </router-link>

            </template>


            <!-- EMPLOYEE -->
            <template v-if="isEmployee">

                <router-link
                    to="/my-tasks"
                    class="block px-4 py-3 rounded-lg transition"
                    :class="
                        route.path.startsWith('/my-tasks')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                    "
                >
                    My Tasks
                </router-link>

            </template>

        </nav>


        <!-- Logout -->
        <div class="p-4 border-t border-gray-800">

            <button
                type="button"
                @click="authStore.logout()"
                class="w-full text-center px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition"
            >
                Logout
            </button>

        </div>

    </aside>
</template>
