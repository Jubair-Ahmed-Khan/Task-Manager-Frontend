<script setup>
import { computed, onMounted, ref, watch, } from 'vue'
import { useTaskStore } from '@/stores/task'
import TaskForm from '@/components/TaskForm.vue'
import EmployeeService from '@/services/EmployeeService'


const taskStore = useTaskStore()
const showModal = ref(false)
const editingTask = ref(null)
const search = ref('')
const status = ref('')
const priority = ref('')
const currentPage = ref(1)
const perPage = ref(10)
const employees = ref([])
const assignedTo = ref('')
const deleteLoading = ref(false)
const deleteTarget = ref(null)
const showDeleteModal = ref(false)

const tasks = computed( () => taskStore.tasks )
const loading = computed( () => taskStore.loading )
const error = computed( () => taskStore.error)
const pagination = computed( () => taskStore.pagination )


const loadEmployees = async () => {
    try {
        const response = await EmployeeService.getEmployees()

        employees.value = response?.data ?? []

    } catch (error) {
        console.error('Failed to load employees:', error)

        employees.value = []
    }
}

const loadTasks = async () => {

    await taskStore.fetchTasks({

        search:
            search.value || undefined,

        status:
            status.value || undefined,

        priority:
            priority.value || undefined,

        assigned_to:
            assignedTo.value || undefined,

        page:
            currentPage.value,

        per_page:
            perPage.value,

        sort_by:
            'created_at',

        sort_direction:
            'desc',
    })
}


let searchTimer = null

watch(
    search,
    () => {

        clearTimeout(searchTimer)

        searchTimer = setTimeout(() => {

            currentPage.value = 1

            loadTasks()

        }, 400)
    }
)


watch(
    [status, priority, assignedTo],
    () => {

        currentPage.value = 1

        loadTasks()
    }
)


const goToPage = (page) => {

    if ( page < 1 || page > pagination.value.last_page) 
    {
        return
    }

    currentPage.value = page

    loadTasks()
}


const openCreateModal = () => {

    editingTask.value = null

    showModal.value = true
}


const openEditModal = (task) => {

    editingTask.value = { ...task,}

    showModal.value = true
}


const closeModal = () => {

    showModal.value = false

    editingTask.value = null
}


const handleSaved = async () => {

    closeModal()

    await loadTasks()
}


const openDeleteModal = (task) => {

    deleteTarget.value = task

    showDeleteModal.value = true
}


const closeDeleteModal = () => {

    showDeleteModal.value = false

    deleteTarget.value = null
}


const deleteTask = async () => {

    if (!deleteTarget.value) {
        return
    }

    deleteLoading.value = true

    try {

        await taskStore.deleteTask(deleteTarget.value.id)

        closeDeleteModal()

        if ( tasks.value.length === 1 && currentPage.value > 1 ) {
            currentPage.value--
        }

        await loadTasks()

    } catch (err) {

        console.error('Delete failed:', err)

    } finally {

        deleteLoading.value = false

    }
}


const statusLabel = (value) => {

    const labels = {

        pending: 'Pending',
        in_progress: 'In Progress',
        completed: 'Completed',
    }

    return labels[value] || value
}


const statusClass = (value) => {

    const classes = {

        pending:
            'bg-yellow-100 text-yellow-700',

        in_progress:
            'bg-blue-100 text-blue-700',

        completed:
            'bg-green-100 text-green-700',
    }

    return ( classes[value] || 'bg-gray-100 text-gray-700')
}


const priorityClass = (value) => {

    const classes = {

        low: 'bg-gray-100 text-gray-700',
        medium: 'bg-orange-100 text-orange-700',
        high: 'bg-red-100 text-red-700',
    }

    return ( classes[value] || 'bg-gray-100 text-gray-700')
}


/*
|--------------------------------------------------------------------------
| Initial Load
|--------------------------------------------------------------------------
*/

onMounted(async () => {

    await loadEmployees()

    await loadTasks()
})
</script>


<template>

    <div>
        <div class="space-y-6">

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

                <h1 class="text-2xl font-bold text-gray-900">
                    Tasks
                </h1>

                <p class="mt-1 text-sm text-gray-500">
                    Manage your tasks.
                </p>

            </div>


            <button
                type="button"
                @click="openCreateModal"
                class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
                + Create Task
            </button>

        </div>

        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <div>

                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Search
                    </label>

                    <input
                        v-model="search"
                        type="text"
                        placeholder="Search tasks..."
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    >

                </div>

                <div>

                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>

                    <select
                        v-model="status"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
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

                    </select>

                </div>

                <div>

                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                    </label>

                    <select
                        v-model="priority"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
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

                <div>

                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Employee
                    </label>

                    <select
                        v-model="assignedTo"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    >

                        <option value="">
                            All Employees
                        </option>

                        <option
                            v-for="employee in employees"
                            :key="employee.id"
                            :value="employee.id"
                        >
                            {{ employee.name }}
                        </option>

                    </select>

                </div>

            </div>

        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">

            <div class="flex items-center justify-between gap-4">

                <p class="text-sm text-red-600">
                    {{ error }}
                </p>

                <button
                    type="button"
                    @click="loadTasks"
                    class="text-sm font-medium text-red-700 underline"
                >
                    Retry
                </button>

            </div>

        </div>


        <div
            v-if="loading"
            class="bg-white rounded-xl border border-gray-100 shadow-sm p-10"
        >

            <div class="flex justify-center">

                <div class="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>

            </div>

            <p class="text-center text-gray-500 mt-4">
                Loading tasks...
            </p>

        </div>

        <div v-else class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            <div v-if="tasks.length === 0" class="p-12 text-center">

                <div class="text-4xl mb-4">
                    📋
                </div>

                <h3 class="text-lg font-semibold text-gray-900">
                    No tasks found
                </h3>

                <p class="mt-1 text-sm text-gray-500">
                    Create a task or change your filters.
                </p>

            </div>

            <div v-else class="divide-y divide-gray-100">

                <div
                    v-for="task in tasks"
                    :key="task.id"
                    class="p-5 hover:bg-gray-50 transition"
                >

                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        <div class="min-w-0">

                            <div class="flex flex-wrap items-center gap-2">

                                <RouterLink
                                    :to="{
                                        name: 'task-details',
                                        params: {
                                            id: task.id
                                        }
                                    }"
                                    class="text-lg font-semibold text-gray-900 hover:text-blue-600"
                                >
                                    {{ task.title }}
                                </RouterLink>


                                <span
                                    class="px-2.5 py-1 rounded-full text-xs font-medium"
                                    :class="statusClass(task.status)"
                                >
                                    {{ statusLabel(task.status) }}
                                </span>


                                <span
                                    class="px-2.5 py-1 rounded-full text-xs font-medium"
                                    :class="priorityClass(task.priority)"
                                >
                                    {{ task.priority }}
                                </span>

                            </div>


                            <p v-if="task.description" class="mt-2 text-sm text-gray-500 line-clamp-2">
                                {{ task.description }}
                            </p>


                            <div class="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">

                                <span>
                                    Due:
                                    {{
                                        task.due_date || 'No due date'
                                    }}
                                </span>


                                <span v-if="task.is_overdue" class="font-medium text-red-600">
                                    Overdue
                                </span>

                            </div>

                        </div>


                        <div class="flex items-center gap-2 shrink-0">

                            <RouterLink
                                :to="{
                                    name: 'task-details',
                                    params: {
                                        id: task.id
                                    }
                                }"
                                class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                View
                            </RouterLink>


                            <button
                                type="button"
                                @click="openEditModal(task)"
                                class="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                                Edit
                            </button>


                            <button
                                type="button"
                                @click="openDeleteModal(task)"
                                class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            </div>


            <!-- Pagination -->

            <div v-if="pagination.last_page > 1" class="px-5 py-4 border-t border-gray-100 flex items-center justify-between"
            >

                <p class="text-sm text-gray-500">
                    Page
                    {{ pagination.current_page }}
                    of
                    {{ pagination.last_page }}
                </p>


                <div class="flex items-center gap-2">

                    <button
                        type="button"
                        @click="goToPage(pagination.current_page - 1)"
                        :disabled="pagination.current_page === 1"
                        class="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>


                    <button
                        type="button"
                        @click="goToPage(pagination.current_page + 1)"
                        :disabled="pagination.current_page === pagination.last_page"
                        class="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>

                </div>

            </div>

    </div>

    </div>

    <TaskForm
        v-if="showModal"
        :task="editingTask"
        @close="closeModal"
        @saved="handleSaved"
    />

        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div class="absolute inset-0 bg-black/50" @click="closeDeleteModal"></div>

            <div class="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">

                <h2 class="text-lg font-semibold text-gray-900">
                    Delete Task
                </h2>


                <p class="mt-2 text-sm text-gray-500">
                    Are you sure you want to delete
                    <strong>
                        {{ deleteTarget?.title }}
                    </strong>?
                    This action cannot be undone.
                </p>


                <div class="mt-6 flex justify-end gap-3">

                    <button
                        type="button"
                        @click="closeDeleteModal"
                        :disabled="deleteLoading"
                        class="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        @click="deleteTask"
                        :disabled="deleteLoading"
                        class="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        {{
                            deleteLoading ? 'Deleting...' : 'Delete'
                        }}
                    </button>

                </div>

            </div>

        </div>
    </div>

</template>

