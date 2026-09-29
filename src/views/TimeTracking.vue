<script setup>
import {
    ref,
    computed,
    onMounted,
    onUnmounted,
    watch,
} from 'vue'

import TimeTrackingService from '@/services/TimeTrackingService'

// State
const tasks = ref([])
const selectedTaskId = ref('')

const activeTimer = ref(null)
const timeEntries = ref([])

const totalSeconds = ref(0)
const estimatedMinutes = ref(null)

const loading = ref(true)
const historyLoading = ref(false)
const actionLoading = ref(false)
const error = ref('')
const success = ref('')

const currentTime = ref(Date.now())
let timerInterval = null

// Selected task
const selectedTask = computed(() => {
    return tasks.value.find(
        task => String(task.id) === String(selectedTaskId.value)
    ) || null
})

// Get the elapsed seconds of the active timer
const elapsedSeconds = computed(() => {
    if (!activeTimer.value) {
        return 0
    }

    const startedAt = new Date(
        activeTimer.value.started_at
    ).getTime()

    if (Number.isNaN(startedAt)) {
        return 0
    }

    return Math.max(
        0,
        Math.floor((currentTime.value - startedAt) / 1000)
    )
})

// Total tracked time, including active timer
const displayedTotalSeconds = computed(() => {
    return Number(totalSeconds.value || 0)
})

// Format seconds to HH:MM:SS
const formatDuration = (seconds) => {
    const total = Math.max(
        0,
        Math.floor(Number(seconds) || 0)
    )

    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const secs = total % 60

    return [
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        String(secs).padStart(2, '0'),
    ].join(':')
}

// Format date and time
const formatDateTime = (value) => {
    if (!value) {
        return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return '-'
    }

    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

// Format seconds as minutes
const formatMinutes = (seconds) => {
    return (Number(seconds || 0) / 60).toFixed(2)
}

// Load tasks from existing Laravel endpoint
const loadTasks = async () => {
    try {
        const response =
            await TimeTrackingService.getTasks({
                per_page: 100,
            })

        const payload = response.data.data

        // Laravel paginator: data.data
        // Plain array: data
        const taskList = Array.isArray(payload)
            ? payload
            : payload?.data || []

        tasks.value = taskList

        if (tasks.value.length > 0) {
            selectedTaskId.value = String(
                tasks.value[0].id
            )
        }
    } catch (e) {
        error.value =
            e.response?.data?.message ||
            'Unable to load tasks.'
    }
}

// Load task summary
const loadSummary = async (taskId) => {
    if (!taskId) {
        activeTimer.value = null
        totalSeconds.value = 0
        estimatedMinutes.value = null
        return
    }

    const response =
        await TimeTrackingService.getSummary(taskId)

    const data = response.data.data

    totalSeconds.value = Number(
        data.total_seconds || 0
    )

    estimatedMinutes.value =
        data.estimated_minutes ?? null

    activeTimer.value = data.active_timer || null
}

// Load time-entry history
const loadEntries = async (taskId) => {
    if (!taskId) {
        timeEntries.value = []
        return
    }

    historyLoading.value = true

    try {
        const response =
            await TimeTrackingService.getEntries(
                taskId,
                {
                    per_page: 20,
                }
            )

        const payload = response.data.data

        // Your controller returns:
        // { data: paginator }
        // paginator.data contains the entries
        timeEntries.value = Array.isArray(payload)
            ? payload
            : payload?.data || []

    } catch (e) {
        error.value =
            e.response?.data?.message ||
            'Unable to load time entries.'
    } finally {
        historyLoading.value = false
    }
}

// Load summary and history for selected task
const loadSelectedTask = async () => {
    error.value = ''
    success.value = ''

    activeTimer.value = null
    totalSeconds.value = 0
    estimatedMinutes.value = null
    timeEntries.value = []

    if (!selectedTaskId.value) {
        return
    }

    try {
        await Promise.all([
            loadSummary(selectedTaskId.value),
            loadEntries(selectedTaskId.value),
        ])
    } catch (e) {
        error.value =
            e.response?.data?.message ||
            'Unable to load time tracking data.'
    }
}

// Start timer
const startTimer = async () => {
    if (!selectedTaskId.value) {
        error.value = 'Please select a task first.'
        return
    }

    if (activeTimer.value) {
        error.value =
            'A timer is already running. Stop it first.'
        return
    }

    actionLoading.value = true
    error.value = ''
    success.value = ''

    try {
        const response =
            await TimeTrackingService.startTimer(
                selectedTaskId.value
            )

        activeTimer.value = response.data.data

        success.value = 'Timer started successfully.'

        await loadSelectedTask()

    } catch (e) {
        error.value =
            e.response?.data?.message ||
            e.response?.data?.errors?.timer?.[0] ||
            'Unable to start timer.'
    } finally {
        actionLoading.value = false
    }
}

// Stop timer
const stopTimer = async () => {
    if (!activeTimer.value) {
        error.value = 'No active timer.'
        return
    }

    actionLoading.value = true
    error.value = ''
    success.value = ''

    try {
        await TimeTrackingService.stopTimer(
            activeTimer.value.task_id
        )

        activeTimer.value = null

        success.value = 'Timer stopped successfully.'

        await loadSelectedTask()

    } catch (e) {
        error.value =
            e.response?.data?.message ||
            'Unable to stop timer.'
    } finally {
        actionLoading.value = false
    }
}

// When selected task changes, load its data
watch(selectedTaskId, () => {
    loadSelectedTask()
})

// Refresh selected task summary/history
const refreshTracking = async () => {
    await loadSelectedTask()
}

// Initialize page
onMounted(async () => {
    timerInterval = setInterval(() => {
        currentTime.value = Date.now()
    }, 1000)

    await loadTasks()

    if (selectedTaskId.value) {
        await loadSelectedTask()
    }

    loading.value = false
})

// Clear interval when leaving page
onUnmounted(() => {
    if (timerInterval) {
        clearInterval(timerInterval)
    }
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-6 space-y-6">

        <!-- Header -->
        <div
            class="flex flex-col sm:flex-row
                   sm:items-center sm:justify-between gap-4"
        >
            <div>
                <h1 class="text-2xl font-bold text-gray-800">
                    Time Tracking
                </h1>

                <p class="text-sm text-gray-500 mt-1">
                    Track time spent working on tasks.
                </p>
            </div>

            <button
                @click="refreshTracking"
                :disabled="loading || !selectedTaskId"
                class="px-4 py-2 bg-white border rounded-lg
                       text-gray-700 hover:bg-gray-100
                       disabled:opacity-50"
            >
                Refresh
            </button>
        </div>

        <!-- Loading -->
        <div
            v-if="loading"
            class="bg-white border rounded-xl p-6 text-gray-500"
        >
            Loading time tracking...
        </div>

        <template v-else>

            <!-- Error -->
            <div
                v-if="error"
                class="bg-red-50 border border-red-200
                       text-red-700 rounded-lg p-4"
            >
                {{ error }}
            </div>

            <!-- Success -->
            <div
                v-if="success"
                class="bg-green-50 border border-green-200
                       text-green-700 rounded-lg p-4"
            >
                {{ success }}
            </div>

            <!-- No Tasks -->
            <div
                v-if="tasks.length === 0"
                class="bg-white border rounded-xl p-8 text-center"
            >
                <p class="text-gray-500">
                    No tasks are available for time tracking.
                </p>
            </div>

            <template v-else>

                <!-- Task Selection -->
                <div class="bg-white border rounded-xl p-5 shadow-sm">
                    <label
                        for="task"
                        class="block text-sm font-medium
                               text-gray-700 mb-2"
                    >
                        Select Task
                    </label>

                    <select
                        id="task"
                        v-model="selectedTaskId"
                        class="w-full border border-gray-300
                               rounded-lg px-4 py-3
                               focus:ring-2 focus:ring-blue-500
                               focus:border-blue-500 outline-none"
                    >
                        <option
                            v-for="task in tasks"
                            :key="task.id"
                            :value="String(task.id)"
                        >
                            {{ task.title }}
                        </option>
                    </select>

                    <div
                        v-if="selectedTask"
                        class="mt-3 text-sm text-gray-500"
                    >
                        Status:
                        <span class="font-medium text-gray-700">
                            {{ selectedTask.status || 'N/A' }}
                        </span>

                        <span class="mx-2">|</span>

                        Estimated time:
                        <span class="font-medium text-gray-700">
                            {{
                                selectedTask.estimated_minutes ??
                                estimatedMinutes ??
                                '-'
                            }}
                            min
                        </span>
                    </div>
                </div>

                <!-- Timer -->
                <div
                    class="bg-white border rounded-xl p-8
                           shadow-sm text-center"
                >
                    <div
                        class="inline-flex items-center gap-2
                               px-3 py-1 rounded-full text-sm
                               mb-5"
                        :class="activeTimer
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'"
                    >
                        <span
                            class="w-2 h-2 rounded-full"
                            :class="activeTimer
                                ? 'bg-green-500 animate-pulse'
                                : 'bg-gray-400'"
                        ></span>

                        {{ activeTimer ? 'Timer Running' : 'Timer Stopped' }}
                    </div>

                    <div
                        class="text-5xl sm:text-6xl
                               font-mono font-bold tracking-wider"
                        :class="activeTimer
                            ? 'text-green-600'
                            : 'text-gray-800'"
                    >
                        {{ formatDuration(elapsedSeconds) }}
                    </div>

                    <p class="text-sm text-gray-500 mt-3">
                        {{
                            activeTimer
                                ? 'Current session'
                                : 'Start the timer to track your work'
                        }}
                    </p>

                    <div class="flex justify-center mt-8">
                        <button
                            v-if="!activeTimer"
                            @click="startTimer"
                            :disabled="actionLoading"
                            class="inline-flex items-center gap-2
                                   px-8 py-3 rounded-lg
                                   bg-green-600 text-white
                                   font-semibold hover:bg-green-700
                                   disabled:opacity-50"
                        >
                            <span>▶</span>

                            {{
                                actionLoading
                                    ? 'Starting...'
                                    : 'Start Timer'
                            }}
                        </button>

                        <button
                            v-else
                            @click="stopTimer"
                            :disabled="actionLoading"
                            class="inline-flex items-center gap-2
                                   px-8 py-3 rounded-lg
                                   bg-red-600 text-white
                                   font-semibold hover:bg-red-700
                                   disabled:opacity-50"
                        >
                            <span>■</span>

                            {{
                                actionLoading
                                    ? 'Stopping...'
                                    : 'Stop Timer'
                            }}
                        </button>
                    </div>

                    <p
                        v-if="activeTimer"
                        class="text-sm text-gray-500 mt-4"
                    >
                        Started:
                        {{ formatDateTime(activeTimer.started_at) }}
                    </p>
                </div>

                <!-- Time Summary -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div class="bg-white border rounded-xl p-5 shadow-sm">
                        <p class="text-sm text-gray-500">
                            Total Tracked Time
                        </p>

                        <p class="text-2xl font-bold text-blue-600 mt-2">
                            {{ formatDuration(displayedTotalSeconds) }}
                        </p>
                    </div>

                    <div class="bg-white border rounded-xl p-5 shadow-sm">
                        <p class="text-sm text-gray-500">
                            Tracked Minutes
                        </p>

                        <p class="text-2xl font-bold text-gray-800 mt-2">
                            {{ formatMinutes(displayedTotalSeconds) }}
                        </p>
                    </div>

                    <div class="bg-white border rounded-xl p-5 shadow-sm">
                        <p class="text-sm text-gray-500">
                            Estimated Minutes
                        </p>

                        <p class="text-2xl font-bold text-gray-800 mt-2">
                            {{
                                estimatedMinutes ??
                                selectedTask?.estimated_minutes ??
                                '-'
                            }}
                        </p>
                    </div>

                </div>

                <!-- Time History -->
                <div class="bg-white border rounded-xl shadow-sm">

                    <div
                        class="p-5 border-b flex items-center
                               justify-between"
                    >
                        <h2 class="font-semibold text-gray-800">
                            Time Entry History
                        </h2>

                        <span
                            class="text-xs px-3 py-1 rounded-full
                                   bg-blue-50 text-blue-700"
                        >
                            {{ timeEntries.length }} entries
                        </span>
                    </div>

                    <div
                        v-if="historyLoading"
                        class="p-6 text-center text-gray-500"
                    >
                        Loading time entries...
                    </div>

                    <div
                        v-else
                        class="overflow-x-auto"
                    >
                        <table class="w-full text-sm text-left">

                            <thead class="bg-gray-50 text-gray-600">
                                <tr>
                                    <th class="p-4 font-semibold">
                                        Employee
                                    </th>

                                    <th class="p-4 font-semibold">
                                        Started At
                                    </th>

                                    <th class="p-4 font-semibold">
                                        Ended At
                                    </th>

                                    <th class="p-4 font-semibold">
                                        Duration
                                    </th>

                                    <th class="p-4 font-semibold">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr
                                    v-for="entry in timeEntries"
                                    :key="entry.id"
                                    class="border-t hover:bg-gray-50"
                                >
                                    <td class="p-4 text-gray-800">
                                        {{ entry.user?.name || 'You' }}
                                    </td>

                                    <td class="p-4 text-gray-600">
                                        {{ formatDateTime(entry.started_at) }}
                                    </td>

                                    <td class="p-4 text-gray-600">
                                        {{ formatDateTime(entry.ended_at) }}
                                    </td>

                                    <td class="p-4 font-medium text-gray-800">
                                        {{
                                            entry.ended_at
                                                ? formatDuration(
                                                    entry.duration_seconds
                                                )
                                                : formatDuration(
                                                    Math.floor(
                                                        (
                                                            currentTime -
                                                            new Date(
                                                                entry.started_at
                                                            ).getTime()
                                                        ) / 1000
                                                    )
                                                )
                                        }}
                                    </td>

                                    <td class="p-4">
                                        <span
                                            class="px-3 py-1 rounded-full
                                                   text-xs font-medium"
                                            :class="entry.ended_at
                                                ? 'bg-gray-100 text-gray-600'
                                                : 'bg-green-100 text-green-700'"
                                        >
                                            {{
                                                entry.ended_at
                                                    ? 'Completed'
                                                    : 'Running'
                                            }}
                                        </span>
                                    </td>
                                </tr>

                                <tr v-if="timeEntries.length === 0">
                                    <td
                                        colspan="5"
                                        class="p-8 text-center text-gray-400"
                                    >
                                        No time entries found for this task.
                                    </td>
                                </tr>
                            </tbody>

                        </table>
                    </div>
                </div>

            </template>
        </template>
    </div>
</template>