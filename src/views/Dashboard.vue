<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import DashboardService from "@/services/dashboard";

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref("");

const dashboard = ref({
    total_tasks: 0,
    pending_tasks: 0,
    in_progress_tasks: 0,
    completed_tasks: 0,
    overdue_tasks: 0,
    total_employees: 0,
    my_tasks: 0,
});



const user = computed(() => authStore.user);
const isAdmin = computed(() => authStore.isAdmin);
const isEmployee = computed(() => authStore.isEmployee);


const userName = computed(() => {
    return user.value?.name || "User";
});


const loadDashboard = async () => {
    loading.value = true;
    error.value = "";

    try {
        const response = await DashboardService.getDashboard();

        dashboard.value = response.data?.data ?? response.data ?? dashboard.value;

    } catch (err) {

        console.error("Dashboard loading error:", err);

        error.value = err.response?.data?.message ?? "Unable to load dashboard statistics.";

    } finally {
        loading.value = false;
    }
};


const goToTasks = () => {
    router.push({
        name: "tasks",
    });
};

const goToEmployees = () => {
    router.push({
        name: "employees",
    });
};

const goToMyTasks = () => {
    router.push({
        name: "my-tasks",
    });
};


const taskStatusCards = computed(() => {

    if (isAdmin.value) {

        return [
            {
                title: "Total Tasks",
                value: dashboard.value.total_tasks ?? 0,
                icon: "📋",
                description: "All tasks",
                className: "bg-blue-50 text-blue-600",
            },
            {
                title: "Pending",
                value: dashboard.value.pending_tasks ?? 0,
                icon: "⏳",
                description: "Waiting to start",
                className: "bg-yellow-50 text-yellow-600",
            },
            {
                title: "In Progress",
                value:
                    dashboard.value.in_progress_tasks ?? 0,
                icon: "🔄",
                description: "Currently working",
                className: "bg-indigo-50 text-indigo-600",
            },
            {
                title: "Completed",
                value:
                    dashboard.value.completed_tasks ?? 0,
                icon: "✓",
                description: "Successfully completed",
                className: "bg-green-50 text-green-600",
            },
        ];
    }


    return [
        {
            title: "My Tasks",
            value: dashboard.value.my_tasks ?? dashboard.value.total_tasks ?? 0,
            icon: "📋",
            description: "Tasks assigned to me",
            className: "bg-blue-50 text-blue-600",
        },
        {
            title: "Pending",
            value: dashboard.value.pending_tasks ?? 0,
            icon: "⏳",
            description: "Waiting to start",
            className: "bg-yellow-50 text-yellow-600",
        },
        {
            title: "In Progress",
            value: dashboard.value.in_progress_tasks ?? 0,
            icon: "🔄",
            description: "Currently working",
            className: "bg-indigo-50 text-indigo-600",
        },
        {
            title: "Completed",
            value: dashboard.value.completed_tasks ?? 0,
            icon: "✓",
            description: "Successfully completed",
            className: "bg-green-50 text-green-600",
        },
    ];
});


onMounted(async () => {

    if (authStore.token && !authStore.user) 
    {
        try {
            await authStore.getUser();
        } catch (err) {
            console.error("Failed to load current user:", err);
        }
    }

    await loadDashboard();
});
</script>


<template>

    <div class="p-6 bg-gray-50 min-h-full">

        <div class="mb-8 bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl p-7 text-white shadow-lg">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                    <p class="text-blue-100 text-sm mb-1">
                        Welcome back,
                    </p>

                    <h1 class="text-3xl font-bold">
                        {{ userName }} 👋
                    </h1>

                    <p class="mt-2 text-blue-100">
                        <span v-if="isAdmin">
                            Manage your team's tasks and
                            monitor overall progress.
                        </span>

                        <span v-else>
                            Here's an overview of your
                            assigned tasks.
                        </span>
                    </p>

                </div>


                <div class="self-start md:self-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/20">
                    <span class="text-sm font-semibold">
                        {{ isAdmin ? "Administrator" : "Employee" }}
                    </span>
                </div>
            </div>

        </div>

        <div v-if="error" class="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center justify-between">
            <span>
                {{ error }}
            </span>

            <button
                type="button"
                @click="loadDashboard"
                class="font-medium underline"
            >
                Retry
            </button>

        </div>

        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

            <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">

                <div
                    class="h-10 w-10 bg-gray-200 rounded-lg mb-5"
                ></div>

                <div
                    class="h-4 bg-gray-200 rounded w-24 mb-3"
                ></div>

                <div
                    class="h-8 bg-gray-200 rounded w-16"
                ></div>

            </div>

        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

            <div v-for="card in taskStatusCards" :key="card.title" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition duration-200">

                <div class="flex items-start justify-between">

                    <div>

                        <p class="text-sm font-medium text-gray-500">
                            {{ card.title }}
                        </p>

                        <p class="text-3xl font-bold text-gray-800 mt-2">
                            {{ card.value }}
                        </p>

                        <p class="text-xs text-gray-400 mt-2">
                            {{ card.description }}
                        </p>

                    </div>


                    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl" :class="card.className">
                        {{ card.icon }}
                    </div>

                </div>

            </div>

        </div>

        <template v-if="isAdmin">

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                <div class="bg-white rounded-xl border border-gray-200 p-6">

                    <div class="flex items-center justify-between mb-6">

                        <div>

                            <h2 class="text-lg font-semibold text-gray-800">
                                Task Overview
                            </h2>

                            <p class="text-sm text-gray-500 mt-1">
                                Current task distribution
                            </p>

                        </div>

                        <span class="text-2xl">
                            📊
                        </span>

                    </div>

                    <div class="mb-5">

                        <div class="flex justify-between text-sm mb-2">

                            <span class="text-gray-600">
                                Pending
                            </span>

                            <span class="font-medium text-gray-800">
                                {{ dashboard.pending_tasks ?? 0 }}
                            </span>

                        </div>

                        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">

                            <div
                                class="h-full bg-yellow-400 rounded-full"
                                :style="{
                                    width:
                                        dashboard.total_tasks
                                            ? `${Math.min(
                                                100,
                                                (dashboard.pending_tasks /
                                                    dashboard.total_tasks) *
                                                    100
                                            )}%`
                                            : '0%'
                                }"
                            ></div>

                        </div>

                    </div>

                    <div class="mb-5">

                        <div class="flex justify-between text-sm mb-2">

                            <span class="text-gray-600">
                                In Progress
                            </span>

                            <span class="font-medium text-gray-800">
                                {{ dashboard.in_progress_tasks ?? 0 }}
                            </span>

                        </div>

                        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">

                            <div
                                class="h-full bg-blue-500 rounded-full"
                                :style="{
                                    width:
                                        dashboard.total_tasks
                                            ? `${Math.min(
                                                100,
                                                (dashboard.in_progress_tasks /
                                                    dashboard.total_tasks) *
                                                    100
                                            )}%`
                                            : '0%'
                                }"
                            ></div>

                        </div>

                    </div>

                    <div>

                        <div class="flex justify-between text-sm mb-2">

                            <span class="text-gray-600">
                                Completed
                            </span>

                            <span class="font-medium text-gray-800">
                                {{ dashboard.completed_tasks ?? 0 }}
                            </span>

                        </div>

                        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">

                            <div
                                class="h-full bg-green-500 rounded-full"
                                :style="{
                                    width:
                                        dashboard.total_tasks
                                            ? `${Math.min(
                                                100,
                                                (dashboard.completed_tasks /
                                                    dashboard.total_tasks) *
                                                    100
                                            )}%`
                                            : '0%'
                                }"
                            ></div>

                        </div>

                    </div>

                </div>


                <div class="bg-white rounded-xl border border-gray-200 p-6">

                    <div class="flex items-center justify-between mb-6">

                        <div>

                            <h2 class="text-lg font-semibold text-gray-800">
                                Employees
                            </h2>

                            <p class="text-sm text-gray-500 mt-1">
                                Team overview
                            </p>

                        </div>

                        <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
                            👥
                        </div>

                    </div>


                    <div class="flex items-center">

                        <div class="text-4xl font-bold text-gray-800">
                            {{ dashboard.total_employees ?? 0 }}
                        </div>

                        <div class="ml-4">

                            <p class="font-medium text-gray-700">
                                Employees
                            </p>

                            <p class="text-sm text-gray-500">
                                Currently registered
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        @click="goToEmployees"
                        class="mt-6 w-full py-2.5 rounded-lg bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition"
                    >
                        Manage Employees →
                    </button>

                </div>

            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-6">

                <div class="mb-5">

                    <h2 class="text-lg font-semibold text-gray-800">
                        Quick Actions
                    </h2>

                    <p class="text-sm text-gray-500 mt-1">
                        Frequently used management actions
                    </p>

                </div>


                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <button
                        type="button"
                        @click="goToTasks"
                        class="group flex items-center p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition text-left"
                    >

                        <div class="w-11 h-11 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-lg mr-4">
                            📋
                        </div>

                        <div class="flex-1">

                            <p class="font-semibold text-gray-800">
                                Manage Tasks
                            </p>

                            <p class="text-sm text-gray-500 mt-1">
                                Create, assign and manage tasks
                            </p>

                        </div>

                        <span class="text-gray-400 group-hover:text-blue-600">
                            →
                        </span>

                    </button>


                    <!-- Employees -->

                    <button
                        type="button"
                        @click="goToEmployees"
                        class="group flex items-center p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition text-left"
                    >

                        <div class="w-11 h-11 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-lg mr-4">
                            👥
                        </div>

                        <div class="flex-1">

                            <p class="font-semibold text-gray-800">
                                Employees
                            </p>

                            <p class="text-sm text-gray-500 mt-1">
                                View and manage employees
                            </p>

                        </div>

                        <span class="text-gray-400 group-hover:text-purple-600">
                            →
                        </span>

                    </button>

                </div>

            </div>

        </template>

        <template v-if="isEmployee">

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div class="bg-white rounded-xl border border-gray-200 p-6">

                    <div class="flex items-center justify-between mb-5">

                        <div>

                            <h2 class="text-lg font-semibold text-gray-800">
                                My Task Summary
                            </h2>

                            <p class="text-sm text-gray-500 mt-1">
                                Track your assigned work
                            </p>

                        </div>

                        <span class="text-2xl">
                            📝
                        </span>

                    </div>


                    <div class="grid grid-cols-3 gap-3">

                        <div class="text-center p-4 bg-yellow-50 rounded-xl">

                            <p class="text-2xl font-bold text-yellow-700">
                                {{ dashboard.pending_tasks ?? 0 }}
                            </p>

                            <p class="text-xs text-yellow-700 mt-1">
                                Pending
                            </p>

                        </div>


                        <div class="text-center p-4 bg-blue-50 rounded-xl">

                            <p class="text-2xl font-bold text-blue-700">
                                {{ dashboard.in_progress_tasks ?? 0 }}
                            </p>

                            <p class="text-xs text-blue-700 mt-1">
                                In Progress
                            </p>

                        </div>


                        <div class="text-center p-4 bg-green-50 rounded-xl">

                            <p class="text-2xl font-bold text-green-700">
                                {{ dashboard.completed_tasks ?? 0 }}
                            </p>

                            <p class="text-xs text-green-700 mt-1">
                                Completed
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        @click="goToMyTasks"
                        class="mt-5 w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                    >
                        View My Tasks →
                    </button>

                </div>

                <div class="bg-white rounded-xl border border-gray-200 p-6">

                    <h2 class="text-lg font-semibold text-gray-800">
                        What You Can Do
                    </h2>

                    <p class="text-sm text-gray-500 mt-1 mb-5">
                        Your available task actions
                    </p>


                    <div class="space-y-4">

                        <div class="flex items-start">

                            <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3">
                                ✓
                            </div>

                            <div>

                                <p class="font-medium text-gray-700">
                                    View assigned tasks
                                </p>

                                <p class="text-sm text-gray-500">
                                    See the tasks assigned to you.
                                </p>

                            </div>

                        </div>


                        <div class="flex items-start">

                            <div class="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mr-3">
                                ↻
                            </div>

                            <div>

                                <p class="font-medium text-gray-700">
                                    Update task status
                                </p>

                                <p class="text-sm text-gray-500">
                                    Change your task status as you work.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </template>

    </div>

</template>
