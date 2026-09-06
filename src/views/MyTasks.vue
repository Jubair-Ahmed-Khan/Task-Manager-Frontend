<script setup>
import { onMounted, ref } from "vue";
import TaskService from "@/services/TaskService";

const tasks = ref([]);
const loading = ref(false);
const updatingTaskId = ref(null);
const error = ref("");

const loadMyTasks = async () => {
    loading.value = true;
    error.value = "";

    try {
        const response = await TaskService.getTasks({
            page: 1,
            per_page: 100,
        });

        console.log("My Tasks API Response:", response);

        tasks.value = response?.data?.data ?? [];

        console.log("My Tasks:", tasks.value);

    } catch (err) {
        console.error("Failed to load tasks:", err);

        error.value = err.response?.data?.message || err.message || "Unable to load your tasks.";
    } finally {
        loading.value = false;
    }
};

const changeStatus = async (task, newStatus) => {
    if (task.status === newStatus) {
        return;
    }

    updatingTaskId.value = task.id;

    try {
        const response = await TaskService.updateStatus(task.id, newStatus);

        console.log("Status update response:", response);

        const updatedTask = response?.data;

        if (updatedTask) {
            task.status = updatedTask.status;
        } else {
            task.status = newStatus;
        }

    } catch (err) {
        console.error("Status update failed:", err);

        alert(err.response?.data?.message || err.message || "Unable to update task status.");
    } finally {
        updatingTaskId.value = null;
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

        default:
            return "bg-gray-100 text-gray-800";
    }
};

const formatStatus = (status) => {
    switch (status) {
        case "pending":
            return "Pending";

        case "in_progress":
            return "In Progress";

        case "completed":
            return "Completed";

        default:
            return status;
    }
};

onMounted(() => {
    loadMyTasks();
});
</script>

<template>
    <div class="p-6">

        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">
                    My Tasks
                </h1>

                <p class="text-gray-500 mt-1">
                    Tasks assigned to you
                </p>
            </div>

            <button @click="loadMyTasks" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Refresh
            </button>
        </div>

        <div v-if="error" class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {{ error }}
        </div>

        <div v-if="loading" class="text-center py-10 text-gray-500">
            Loading your tasks...
        </div>

        <div v-else class="bg-white rounded-xl shadow overflow-hidden"
        >
            <div class="overflow-x-auto">

                <table class="w-full">

                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="text-left px-6 py-4">
                                Title
                            </th>

                            <th class="text-left px-6 py-4">
                                Description
                            </th>

                            <th class="text-left px-6 py-4">
                                Priority
                            </th>

                            <th class="text-left px-6 py-4">
                                Due Date
                            </th>

                            <th class="text-left px-6 py-4">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody>

                        <tr
                            v-for="task in tasks"
                            :key="task.id"
                            class="border-b hover:bg-gray-50"
                        >

                            <td class="px-6 py-4 font-medium text-gray-800">
                                {{ task.title }}
                            </td>

                            <td class="px-6 py-4 text-gray-600">
                                {{ task.description || "—" }}
                            </td>

                            <td class="px-6 py-4">

                                <span
                                    class="px-3 py-1 rounded-full text-xs font-medium"
                                    :class="{
                                        'bg-green-100 text-green-800':
                                            task.priority === 'low',

                                        'bg-yellow-100 text-yellow-800':
                                            task.priority === 'medium',

                                        'bg-red-100 text-red-800':
                                            task.priority === 'high'
                                    }"
                                >
                                    {{ task.priority }}
                                </span>

                            </td>

                            <td class="px-6 py-4 text-gray-600">
                                {{ task.due_date || "—" }}
                            </td>

                            <td class="px-6 py-4">

                                <select
                                    :value="task.status"
                                    :disabled="
                                        updatingTaskId === task.id
                                    "
                                    @change="
                                        changeStatus(
                                            task,
                                            $event.target.value
                                        )
                                    "
                                    class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >

                                    <option value="pending">
                                        Pending
                                    </option>

                                    <option value="in_progress">
                                        In Progress
                                    </option>

                                    <option value="completed">
                                        Completed
                                    </option>

                                </select>

                                <span v-if="updatingTaskId === task.id" class="ml-2 text-sm text-gray-500">
                                    Updating...
                                </span>

                            </td>

                        </tr>

                        <tr v-if="tasks.length === 0">

                            <td colspan="5" class="text-center py-10 text-gray-500">
                                No tasks assigned to you.
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>
        </div>

    </div>
</template>