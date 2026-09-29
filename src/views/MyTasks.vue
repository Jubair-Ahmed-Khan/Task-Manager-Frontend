<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { Eye } from '@lucide/vue'
import TaskService from "@/services/TaskService";
import TaskCategoryService from "@/services/TaskCategoryService";

const tasks = ref([]);
const loading = ref(false);
const updatingTaskId = ref(null);
const error = ref("");

// Filters
const search = ref("");
const status = ref("");
const priority = ref("");
const categoryId = ref("");
const overdue = ref(false);
const currentPage = ref(1);
const perPage = ref(10);

const categories = ref([]);
const loadingCategories = ref(false);

const searchTimer = ref(null);


/*
|--------------------------------------------------------------------------
| Load Categories
|--------------------------------------------------------------------------
*/

const loadCategories = async () => {

    loadingCategories.value = true;

    try {

        const response =
            await TaskCategoryService.getCategories(true);

        categories.value =
            response?.data ?? [];

    } catch (err) {

        console.error(
            "Failed to load task categories:",
            err
        );

        categories.value = [];

    } finally {

        loadingCategories.value = false;

    }
};


/*
|--------------------------------------------------------------------------
| Load My Tasks
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {

    if (!date) {
        return "—";
    }

    const d = new Date(date);

    const day =
        String(d.getDate()).padStart(2, "0");

    const month =
        String(d.getMonth() + 1).padStart(2, "0");

    const year =
        String(d.getFullYear()).slice(-2);

    return `${day}-${month}-${year}`;
};


const loadMyTasks = async () => {

    loading.value = true;
    error.value = "";

    try {

        const response =
            await TaskService.getTasks({

                search:
                    search.value || undefined,

                status:
                    status.value === "overdue"
                        ? undefined
                        : status.value || undefined,

                priority:
                    priority.value || undefined,

                category_id:
                    categoryId.value || undefined,

                overdue:
                    status.value === "overdue"
                        ? true
                        : undefined,

                page:
                    currentPage.value,

                per_page:
                    perPage.value,

                sort_by:
                    "due_date",

                sort_direction:
                    "asc",
            });

        tasks.value =
            response.data?.data ?? [];

    } catch (err) {

        console.error(
            "Failed to load tasks:",
            err
        );

        error.value =
            err.response?.data?.message ||
            "Unable to load your tasks.";

    } finally {

        loading.value = false;

    }
};


const dueStatus = (task) => {

    if (task.status === "completed") {
        return null;
    }

    if (task.is_overdue) {

        return {
            label: "🔴 Overdue",
            class: "bg-red-100 text-red-700"
        };

    }

    if (task.is_due_soon) {

        return {
            label: "🟠 Due Soon",
            class: "bg-orange-100 text-orange-700"
        };

    }

    return null;
};


/*
|--------------------------------------------------------------------------
| Search Watch
|--------------------------------------------------------------------------
*/

watch(search, () => {

    clearTimeout(searchTimer.value);

    searchTimer.value = setTimeout(() => {

        currentPage.value = 1;

        loadMyTasks();

    }, 500);

});


/*
|--------------------------------------------------------------------------
| Filter Watch
|--------------------------------------------------------------------------
*/

watch(
    [
        status,
        priority,
        categoryId,
        overdue
    ],
    () => {

        currentPage.value = 1;

        loadMyTasks();

    }
);


/*
|--------------------------------------------------------------------------
| Change Status
|--------------------------------------------------------------------------
*/

const changeStatus = async (task, newStatus) => {

    if (task.status === newStatus) {
        return;
    }

    updatingTaskId.value = task.id;

    try {

        const response =
            await TaskService.updateStatus(
                task.id,
                newStatus
            );

        const updatedTask =
            response.data?.data;

        if (updatedTask) {

            task.status =
                updatedTask.status;

        } else {

            task.status =
                newStatus;

        }

    } catch (err) {

        console.error(
            "Status update failed:",
            err
        );

        alert(
            err.response?.data?.message ||
            "Unable to update task status."
        );

    } finally {

        updatingTaskId.value = null;

    }

};


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const isOverdue = (task) => {

    if (
        !task.due_date ||
        task.status === "completed"
    ) {
        return false;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const dueDate =
        new Date(task.due_date);

    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
};


const isDueSoon = (task) => {

    if (
        !task.due_date ||
        task.status === "completed"
    ) {
        return false;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const dueDate =
        new Date(task.due_date);

    dueDate.setHours(0, 0, 0, 0);

    const difference =
        Math.ceil(
            (dueDate - today) /
            (1000 * 60 * 60 * 24)
        );

    return difference >= 0 && difference <= 3;
};


const dueDateLabel = (task) => {

    if (!task.due_date) {
        return "No due date";
    }

    if (isOverdue(task)) {
        return "Overdue";
    }

    if (isDueSoon(task)) {

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const dueDate =
            new Date(task.due_date);

        dueDate.setHours(0, 0, 0, 0);

        const days =
            Math.ceil(
                (dueDate - today) /
                (1000 * 60 * 60 * 24)
            );

        if (days === 0) {
            return "Due Today";
        }

        if (days === 1) {
            return "Due Tomorrow";
        }

        return `Due in ${days} days`;
    }

    return task.due_date;
};


/*
|--------------------------------------------------------------------------
| Status Helper
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Initial Load
|--------------------------------------------------------------------------
*/

onMounted(async () => {

    await loadCategories();

    await loadMyTasks();

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

        <!-- Filters -->

        <div
            class="bg-white rounded-xl shadow p-4 mb-6"
        >
            <div
                class="grid grid-cols-1 md:grid-cols-4 gap-4"
            >

                <!-- Search -->

                <div>
                    <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Search
                    </label>

                    <input
                        v-model="search"
                        type="text"
                        placeholder="Search tasks..."
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                </div>


                <!-- Status -->

                <div>
                    <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Status
                    </label>

                    <select
                        v-model="status"
                        class="w-full px-4 py-2 border rounded-lg"
                    >
                        <option value="">
                            All Statuses
                        </option>

                        <option value="pending">
                            Pending
                        </option>

                        <option value="in_progress">
                            In Progress
                        </option>

                        <option value="completed">
                            Completed
                        </option>
                        <option value="overdue">
                            Overdue Tasks
                        </option>
                    </select>
                </div>


                <!-- Priority -->

                <div>
                    <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Priority
                    </label>

                    <select
                        v-model="priority"
                        class="w-full px-4 py-2 border rounded-lg"
                    >
                        <option value="">
                            All Priorities
                        </option>

                        <option value="low">
                            Low
                        </option>

                        <option value="medium">
                            Medium
                        </option>

                        <option value="high">
                            High
                        </option>
                    </select>
                </div>

                <!-- Category -->

                <div>

                    <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Category
                    </label>

                    <select
                        v-model="categoryId"
                        :disabled="loadingCategories"
                        class="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                    >

                        <option value="">
                            All Categories
                        </option>

                        <option
                            v-for="category in categories"
                            :key="category.id"
                            :value="category.id"
                        >
                            {{ category.name }}
                        </option>

                    </select>

                </div>

            </div>
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
                                Category
                            </th>

                            <th class="text-left px-6 py-4">
                                Priority
                            </th>

                            <th class="text-left px-6 py-4">
                                Due Date
                            </th>

                            <th class="text-left px-6 py-4 min-w-38.5 whitespace-nowrap">
                                Due Status
                            </th>
    
    
                            <th class="text-left px-6 py-4">
                                Status
                            </th>

                            <th class="text-left px-6 py-4">
                                Actions
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
                                {{
                                    task.description
                                        ? (task.description.length > 25
                                            ? task.description.substring(0, 25) + '...'
                                            : task.description)
                                        : '—'
                                }}
                            </td>

                            <td class="px-6 py-4 text-center min-w-32.5 whitespace-nowrap">
                                <span
                                    v-if="task.category"
                                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                    :style="{
                                        backgroundColor: `${task.category.color || '#6B7280'}20`,
                                        color: task.category.color || '#6B7280'
                                    }"
                                >
                                    {{ task.category.name }}
                                </span>

                                <span
                                    v-else
                                    class="text-gray-400"
                                >
                                    —
                                </span>
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

                            <td class="px-6 py-4 text-gray-600 min-w-32.5 whitespace-nowrap">
                                {{ formatDate(task.due_date) || "—" }}
                            </td>

                            <td class="px-6 py-4 text-center min-w-32.5 whitespace-nowrap">

                                <span
                                    v-if="dueStatus(task)"
                                    class="inline-flex px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                    :class="dueStatus(task).class"
                                >
                                    {{ dueStatus(task).label }}
                                </span>

                                <span
                                    v-else
                                    class="text-gray-400 text-sm"
                                >
                                    —
                                </span>

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
                            <td class="px-6 py-4">
                                <RouterLink
                                    :to="{
                                        name: 'task-details',
                                        params: {
                                            id: task.id
                                        }
                                    }"
                                    title="View Details"
                                    aria-label="View Details"
                                    class="inline-flex items-center justify-center p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                                >
                                    <Eye :size="20" />
                                </RouterLink>
                            </td>

                        </tr>

                        <tr v-if="tasks.length === 0">

                            <td colspan="8" class="text-center py-10 text-gray-500">
                                No tasks assigned to you.
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>
        </div>

    </div>
</template>