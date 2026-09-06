<script setup>

import { computed, onMounted, ref, watch, } from 'vue'
import { useRoute, useRouter, } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import { useAuthStore } from '@/stores/auth'
import TaskForm from '@/components/TaskForm.vue'


const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const updatingStatus = ref(false)
const showModal = ref(false)
const editingTask = ref(null)

const openEditModal = (task) => {

    editingTask.value = {
        ...task,
    }

    showModal.value = true
}

const closeModal = () => {

    showModal.value = false

    editingTask.value = null
}

const user = computed(() => {

    return authStore.user

})

const isAdmin = computed(() => {

    return user.value?.roles?.some(role => role.name === 'Admin') || user.value?.role === 'Admin'

})


const isEmployee = computed(() => {

    return user.value?.roles?.some(role => role.name === 'Employee') || user.value?.role === 'Employee'

})


const task = computed(() => {

    return taskStore.currentTask

})


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

    return classes[value] || 'bg-gray-100 text-gray-700'

}


const priorityClass = (value) => {

    const classes = {
        low:
            'bg-gray-100 text-gray-700',

        medium:
            'bg-orange-100 text-orange-700',

        high:
            'bg-red-100 text-red-700',
    }

    return classes[value] || 'bg-gray-100 text-gray-700'

}


const formatDate = (date) => {

    if (!date) {
        return '—'
    }

    return new Date(date)
        .toLocaleDateString(
            undefined,
            {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }
        )

}


const handleSaved = async () => {
    closeModal()

    // Reload the current task from the backend
    await loadTask()
}

const updateStatus = async (newStatus) => {

    if (!isEmployee.value || !task.value || updatingStatus.value) 
    {
        return
    }

    if (task.value.status === newStatus) 
    {
        return
    }

    updatingStatus.value = true

    try {

        await taskStore.updateTaskStatus(task.value.id, newStatus)

    } catch (error) {

        console.error('Failed to update status:', error)

    } finally {

        updatingStatus.value = false

    }

}


const goBack = () => {

    router.push({
        name: 'tasks',
    })

}


const loadTask = async () => {

    const id = route.params.id

    if (!id) return

    await taskStore.fetchTask(id)
}

onMounted(() => {
    loadTask()
})

watch(
    () => route.params.id,
    () => {
        loadTask()
    }
)

</script>


<template>

    <div class="max-w-5xl mx-auto space-y-6">

        <button
            type="button"
            @click="goBack"
            class="text-sm text-gray-500 hover:text-blue-600"
        >
            ← Back to Tasks
        </button>

        <div v-if="taskStore.loading" class="bg-white rounded-2xl shadow-sm border p-12 text-center">

            <div class="inline-block w-9 h-9 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>

            <p class="mt-4 text-gray-500">
                Loading task...
            </p>

        </div>

        <div v-else-if="task" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            <div class="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                <div>

                    <h1 class="text-2xl font-bold text-gray-900">
                        {{ task.title }}
                    </h1>

                    <p class="mt-1 text-sm text-gray-500">
                        Task #{{ task.id }}
                    </p>

                </div>

                <div v-if="isAdmin" class="flex gap-2">

                    <button
                        type="button"
                        @click="openEditModal(task)"
                        class="px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                        Delete
                    </button>

                </div>

            </div>

            <div class="p-6 space-y-8">

                <div>

                    <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Description
                    </h2>

                    <p class="mt-3 text-gray-600 whitespace-pre-line leading-7">
                        {{
                            task.description || 'No description provided.'
                        }}
                    </p>

                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>

                        <p class="text-sm font-medium text-gray-500">
                            Status
                        </p>

                        <select
                            v-if="isEmployee"
                            :value="task.status"
                            @change="
                                updateStatus(
                                    $event.target.value
                                )
                            "
                            :disabled="updatingStatus"
                            class="mt-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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

                        <span
                            v-else
                            class="inline-flex mt-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                            :class="
                                statusClass(
                                    task.status
                                )
                            "
                        >
                            {{
                                statusLabel(
                                    task.status
                                )
                            }}
                        </span>

                    </div>

                    <div>

                        <p class="text-sm font-medium text-gray-500">
                            Priority
                        </p>

                        <span
                            class="inline-flex mt-2 px-3 py-1.5 rounded-full text-sm font-semibold capitalize"
                            :class="
                                priorityClass(
                                    task.priority
                                )
                            "
                        >
                            {{ task.priority }}
                        </span>

                    </div>

                    <div>

                        <p class="text-sm font-medium text-gray-500">
                            Assigned To
                        </p>

                        <div v-if="task.assignee" class="mt-2">

                            <p class="font-medium text-gray-900">
                                {{
                                    task.assignee.name
                                }}
                            </p>

                            <p class="text-sm text-gray-500">
                                {{
                                    task.assignee.email
                                }}
                            </p>

                        </div>

                        <p v-else class="mt-2 text-gray-400">
                            Unassigned
                        </p>

                    </div>

                    <div>

                        <p class="text-sm font-medium text-gray-500">
                            Due Date
                        </p>

                        <p
                            class="mt-2 text-gray-900"
                            :class="
                                task.is_overdue
                                    ? 'text-red-600 font-semibold'
                                    : ''
                            "
                        >
                            {{
                                formatDate(task.due_date)
                            }}
                        </p>

                    </div>

                </div>

                <div class="pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>

                        <p class="text-sm text-gray-500">
                            Created
                        </p>

                        <p class="mt-1 text-sm font-medium text-gray-900">
                            {{
                                formatDate(task.created_at)
                            }}
                        </p>

                    </div>


                    <div>

                        <p class="text-sm text-gray-500">
                            Last Updated
                        </p>

                        <p class="mt-1 text-sm font-medium text-gray-900">
                            {{
                                formatDate(task.updated_at)
                            }}
                        </p>

                    </div>

                </div>

            </div>

        </div>

        <div v-else class="bg-white rounded-2xl border p-12 text-center">

            <p class="text-gray-500">
                Task not found.
            </p>

        </div>

        <TaskForm
            v-if="showModal"
            :show="showModal"
            :task="editingTask"
            @close="closeModal"
            @saved="handleSaved"
        />

    </div>

</template>
