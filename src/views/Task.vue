<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import TaskService from "@/services/TaskService";
import TaskForm from "@/components/TaskForm.vue";
import TaskDetails from "@/components/TaskDetails.vue";

const authStore = useAuthStore();

const tasks = ref([]);
const loading = ref(false);
const error = ref("");

const showTaskForm = ref(false);
const showTaskDetails = ref(false);

const selectedTask = ref(null);
const editingTask = ref(null);

const isAdmin = computed(() => authStore.isAdmin);
const isEmployee = computed(() => authStore.isEmployee);


const fetchTasks = async () => {
    loading.value = true;
    error.value = "";

    try {
        const response = await TaskService.getTasks();

        tasks.value = response.data?.data ?? response.data ?? [];
    } catch (err) {
        console.error("Failed to load tasks:", err);

        error.value = err.response?.data?.message ?? "Failed to load tasks.";
    } finally {
        loading.value = false;
    }
};


const openCreateModal = () => {
    if (!isAdmin.value) {
        return;
    }

    editingTask.value = null;
    showTaskForm.value = true;
};


const openEditModal = (task) => {
    if (!isAdmin.value) {
        return;
    }

    editingTask.value = task;
    showTaskForm.value = true;
};


const closeTaskForm = () => {
    showTaskForm.value = false;
    editingTask.value = null;
};


const handleTaskSaved = async () => {
    closeTaskForm();

    await fetchTasks();
};


const openTaskDetails = (task) => {
    selectedTask.value = task;
    showTaskDetails.value = true;
};

const closeTaskDetails = () => {
    showTaskDetails.value = false;
    selectedTask.value = null;
};


const deleteTask = async (task) => {
    if (!isAdmin.value) {
        return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${task.title}"?`);

    if (!confirmed) {
        return;
    }

    try {
        await TaskService.deleteTask(task.id);

        await fetchTasks();
    } catch (err) {
        console.error("Failed to delete task:", err);

        error.value = err.response?.data?.message ?? "Failed to delete task.";
    }
};


const statusClass = (status) => {
    switch (status) {
        case "pending":
            return "bg-yellow-100 text-yellow-800";

        case "in_progress":
            return "bg-blue-100 text-blue-800";

        case "completed":
            return "bg-green-100 text-green-800";

        case "cancelled":
            return "bg-red-100 text-red-800";

        default:
            return "bg-gray-100 text-gray-800";
    }
};

const formatStatus = (status) => {
    if (!status) {
        return "-";
    }

    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

onMounted(async () => {
    if (authStore.token && !authStore.user) {
        try {
            await authStore.getUser();
        } catch (err) {
            console.error("Failed to load user:", err);
        }
    }

    await fetchTasks();
});
</script>


<template>
    <div class="p-6">

        <div class="flex items-center justify-between mb-6">

            <div>
                <h1 class="text-2xl font-bold text-gray-800">
                    {{ isAdmin ? "Manage Tasks" : "My Tasks" }}
                </h1>

                <p class="text-gray-500 mt-1">
                    <span v-if="isAdmin">
                        Create, assign and manage tasks.
                    </span>

                    <span v-else>
                        View your assigned tasks.
                    </span>
                </p>
            </div>

            <button
                v-if="isAdmin"
                type="button"
                @click="openCreateModal"
                class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
                + Create Task
            </button>

        </div>

        <div v-if="error" class="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {{ error }}
        </div>

        <div v-if="loading" class="py-16 text-center text-gray-500">
            Loading tasks...
        </div>

        <div v-else-if="tasks.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
            <h3 class="text-lg font-semibold text-gray-700">
                No tasks found
            </h3>

            <p class="text-gray-500 mt-2">
                <span v-if="isAdmin">
                    Create your first task to get started.
                </span>

                <span v-else>
                    No tasks have been assigned to you.
                </span>
            </p>

            <button
                v-if="isAdmin"
                type="button"
                @click="openCreateModal"
                class="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                Create Task
            </button>
        </div>

        <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

            <div class="overflow-x-auto">

                <table class="w-full">

                    <thead class="bg-gray-50 border-b border-gray-200">

                        <tr>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                Title
                            </th>

                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                Assigned To
                            </th>

                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                Priority
                            </th>

                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                Status
                            </th>

                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                Due Date
                            </th>

                            <th class="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                                Actions
                            </th>
                        </tr>

                    </thead>


                    <tbody class="divide-y divide-gray-200">

                        <tr
                            v-for="task in tasks"
                            :key="task.id"
                            class="hover:bg-gray-50 transition"
                        >

                            <!-- TITLE -->

                            <td class="px-6 py-4">

                                <div class="font-medium text-gray-800">
                                    {{ task.title }}
                                </div>

                                <div v-if="task.description" class="text-sm text-gray-500 mt-1 max-w-md truncate">
                                    {{ task.description }}
                                </div>

                            </td>

                            <td class="px-6 py-4 text-gray-600">
                                {{
                                    task.assigned_to?.name ?? task.assignee?.name ?? task.assignedUser?.name ?? "Unassigned"
                                }}
                            </td>

                            <td class="px-6 py-4 text-gray-600">
                                {{
                                    task.priority
                                        ? task.priority
                                            .replace(/_/g, " ")
                                            .replace(/\b\w/g, l => l.toUpperCase())
                                        : "-"
                                }}
                            </td>

                            <td class="px-6 py-4">
                                <span
                                    class="inline-flex px-3 py-1 rounded-full text-xs font-semibold"
                                    :class="statusClass(task.status)"
                                >
                                    {{ formatStatus(task.status) }}
                                </span>
                            </td>

                            <td class="px-6 py-4 text-gray-600">
                                {{
                                    task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"
                                }}
                            </td>


                            <!-- ACTIONS -->

                            <td class="px-6 py-4">

                                <div class="flex justify-end gap-2">

                                    <button
                                        type="button"
                                        @click="openTaskDetails(task)"
                                        class="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        View
                                    </button>

                                    <button
                                        v-if="isAdmin"
                                        type="button"
                                        @click="openEditModal(task)"
                                        class="px-3 py-1.5 text-sm rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        v-if="isAdmin"
                                        type="button"
                                        @click="deleteTask(task)"
                                        class="px-3 py-1.5 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

        <TaskForm
            v-if="showTaskForm && isAdmin"
            :task="editingTask"
            @close="closeTaskForm"
            @saved="handleTaskSaved"
        />

        <TaskDetails
            v-if="showTaskDetails"
            :task="selectedTask"
            @close="closeTaskDetails"
        />

    </div>
</template>
