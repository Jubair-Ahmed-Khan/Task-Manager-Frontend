<script setup>

import { computed, onMounted, ref, watch, } from 'vue'
import { useRoute, useRouter, } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import { useAuthStore } from '@/stores/auth'
import TaskForm from '@/components/TaskForm.vue'
import CommentService from '@/services/CommentService'
import TaskAttachments from "@/components/TaskAttachments.vue";
import TaskActivityHistory from "@/components/TaskActivityHistory.vue";


const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const updatingStatus = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const editingTask = ref(null)
const comments = ref([])
const newComment = ref('')
const loadingComments = ref(false)
const savingComment = ref(false)
const commentError = ref('')
const deleteLoading = ref(false)
const deleteTarget = ref(null)
const showDeleteModal = ref(false)

const openEditModal = (task) => {

    editingTask.value = {
        ...task,
    }

    showModal.value = true
}

const openDeleteModal = (task) => {

    deleteTarget.value = task

    showDeleteModal.value = true
}

const closeDeleteModal = () => {

    showDeleteModal.value = false

    deleteTarget.value = null
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

const dueStatus = computed(() => {

    if (!task.value) {
        return null
    }

    if (task.value.status === 'completed') {
        return null
    }

    if (task.value.is_overdue) {
        return {
            label: '🔴 Overdue',
            class: 'bg-red-100 text-red-700'
        }
    }

    if (task.value.is_due_soon) {
        return {
            label: '🟠 Due Soon',
            class: 'bg-orange-100 text-orange-700'
        }
    }

    return null
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

const deleteTask = async () => {

    deleteLoading.value = true

    try {

        await taskStore.deleteTask(
            task.value.id
        )

        // Go back to task list after successful deletion
        router.push({
            name: 'tasks',
        })

    } catch (error) {

        console.error(
            'Failed to delete task:',
            error
        )

        alert(
            error.response?.data?.message ||
            'Unable to delete task.'
        )

    } finally {

        deleteLoading.value = false

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
    await loadComments()
}

/*
|--------------------------------------------------------------------------
| Comments
|--------------------------------------------------------------------------
*/

const loadComments = async () => {

    if (!task.value?.id) {
        return
    }

    loadingComments.value = true

    commentError.value = ''

    try {

        const response =
            await CommentService.getComments(
                task.value.id
            )

        comments.value =
            response.data?.data
            || []

    } catch (error) {

        console.error(
            'Failed to load comments:',
            error
        )

        commentError.value =
            error.response?.data?.message
            || 'Failed to load comments.'

    } finally {

        loadingComments.value = false

    }
}


const addComment = async () => {

    if (
        !newComment.value.trim()
        || savingComment.value
        || !task.value
    ) {
        return
    }

    savingComment.value = true

    commentError.value = ''

    try {

        const response =
            await CommentService.addComment(
                task.value.id,
                {
                    comment:
                        newComment.value.trim(),
                }
            )

        /*
        |--------------------------------------------------------------------------
        | Add new comment immediately
        |--------------------------------------------------------------------------
        */

        comments.value.unshift(
            response.data.data
        )

        newComment.value = ''

    } catch (error) {

        console.error(
            'Failed to add comment:',
            error
        )

        commentError.value =
            error.response?.data?.message
            || 'Failed to add comment.'

    } finally {

        savingComment.value = false

    }
}


const deleteComment = async (
    comment
) => {

    const confirmed =
        window.confirm(
            'Are you sure you want to delete this comment?'
        )

    if (!confirmed) {
        return
    }

    try {

        await CommentService.deleteComment(
            comment.id
        )

        comments.value =
            comments.value.filter(
                item => item.id !== comment.id
            )

    } catch (error) {

        console.error(
            'Failed to delete comment:',
            error
        )

        alert(
            error.response?.data?.message
            || 'Failed to delete comment.'
        )

    }
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
                        @click="openDeleteModal(task)"
                        :disabled="deleteLoading"
                        class="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span v-if="deleteLoading">
                            Deleting...
                        </span>

                        <span v-else>
                            Delete
                        </span>
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

                    <!-- Due Date -->

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
                            {{ formatDate(task.due_date) }}
                        </p>


                        <!-- Due Status -->

                        <span
                            v-if="dueStatus"
                            class="inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                            :class="dueStatus.class"
                        >
                            {{ dueStatus.label }}
                        </span>

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
            <!-- ============================================================= -->
            <!-- COMMENTS -->
            <!-- ============================================================= -->

            <div class="p-6 space-y-8 border-gray-100">

                <div class="flex items-center justify-between mb-5">

                    <div>

                        <h2 class="text-lg font-bold text-gray-900">
                            Discussion
                        </h2>

                        <p class="text-sm text-gray-500">
                            Comments and updates about this task.
                        </p>

                    </div>


                    <span
                        class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                        {{ comments.length }}
                        Comments
                    </span>

                </div>


                <!-- Add Comment -->

                <div class="mb-6">

                    <textarea
                        v-model="newComment"
                        rows="3"
                        placeholder="Write a comment..."
                        :disabled="savingComment"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    ></textarea>


                    <div class="mt-3 flex justify-end">

                        <button
                            type="button"
                            @click="addComment"
                            :disabled="
                                !newComment.trim()
                                || savingComment
                            "
                            class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >

                            {{
                                savingComment
                                    ? 'Posting...'
                                    : 'Post Comment'
                            }}

                        </button>

                    </div>

                </div>


                <!-- Error -->

                <div
                    v-if="commentError"
                    class="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                >
                    {{ commentError }}
                </div>


                <!-- Loading -->

                <div
                    v-if="loadingComments"
                    class="py-8 text-center text-gray-500"
                >
                    Loading comments...
                </div>


                <!-- Empty -->

                <div
                    v-else-if="comments.length === 0"
                    class="py-8 text-center border border-dashed border-gray-300 rounded-xl"
                >

                    <div class="text-3xl mb-2">
                        💬
                    </div>

                    <p class="text-gray-500">
                        No comments yet.
                    </p>

                    <p class="text-sm text-gray-400 mt-1">
                        Start the discussion about this task.
                    </p>

                </div>


                <!-- Comment List -->

                <div
                    v-else
                    class="space-y-4"
                >

                    <div
                        v-for="comment in comments"
                        :key="comment.id"
                        class="p-4 border border-gray-100 rounded-xl bg-gray-50"
                    >

                        <!-- Header -->

                        <div class="flex items-start justify-between gap-4">

                            <div>

                                <p class="font-semibold text-gray-900">

                                    {{
                                        comment.user?.name
                                        || 'Unknown User'
                                    }}

                                </p>


                                <p class="text-xs text-gray-500 mt-1">

                                    {{
                                        formatDate(
                                            comment.created_at
                                        )
                                    }}

                                </p>

                            </div>


                            <!-- Delete -->

                            <button
                                v-if="
                                    isAdmin
                                    || comment.user_id === user?.id
                                "
                                type="button"
                                @click="deleteComment(comment)"
                                class="text-sm text-red-600 hover:text-red-700"
                            >
                                Delete
                            </button>

                        </div>


                        <!-- Comment -->

                        <p
                            class="mt-3 text-gray-700 whitespace-pre-line leading-6"
                        >

                            {{ comment.comment }}

                        </p>

                    </div>

                </div>

            </div>

            <TaskAttachments
                v-if="task?.id"
                :task-id="task.id"
            />
            <TaskActivityHistory
                v-if="task?.id"
                :task-id="task.id"
            />
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
