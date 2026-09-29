<script setup>
import { ref, onMounted } from 'vue'

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js'

import { Doughnut, Bar } from 'vue-chartjs'
import AnalyticsService from '@/services/AnalyticsService'

// Register Chart.js components
ChartJS.register(
    Title,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
)

// Dashboard data
const summary = ref({})
const statusChart = ref(null)
const workloadChart = ref(null)
const timeByTask = ref([])

const loading = ref(true)
const error = ref('')

// Chart options
const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
        legend: {
            display: true,
            position: 'bottom',

            labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle',
            },
        },

        tooltip: {
            enabled: true,
        },
    },
}

const workloadChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    indexAxis: 'y',

    plugins: {
        legend: {
            display: true,
            position: 'bottom',

            labels: {
                usePointStyle: true,
                pointStyle: 'rectRounded',
                padding: 20,
            },
        },

        tooltip: {
            enabled: true,
        },
    },

    scales: {
        x: {
            beginAtZero: true,

            ticks: {
                precision: 0,
            },

            grid: {
                color: '#E5E7EB',
            },
        },

        y: {
            grid: {
                display: false,
            },
        },
    },
}

// Load analytics data
const loadDashboard = async () => {
    loading.value = true
    error.value = ''

    try {
        const response =
            await AnalyticsService.getDashboard()

        const data = response.data.data

        // Summary cards
        summary.value = data.summary

        // Tasks by status - Doughnut chart
        statusChart.value = {
            labels: data.tasks_by_status.map(
                item => item.status
            ),

            datasets: [
                {
                    label: 'Tasks',

                    data: data.tasks_by_status.map(
                        item => item.total
                    ),

                    // Different color for each status
                    backgroundColor: [
                        '#3B82F6', // Blue
                        '#10B981', // Green
                        '#F59E0B', // Orange
                        '#EF4444', // Red
                        '#8B5CF6', // Purple
                        '#06B6D4', // Cyan
                        '#EC4899', // Pink
                    ],

                    borderColor: '#FFFFFF',
                    borderWidth: 3,

                    hoverOffset: 10,
                },
            ],
        }

        // Employee workload - Horizontal Bar chart
        workloadChart.value = {
            labels: data.employee_workload.map(
                item => item.name
            ),

            datasets: [
                {
                    label: 'Assigned',

                    data: data.employee_workload.map(
                        item => item.total_tasks
                    ),

                    backgroundColor: '#3B82F6',
                    borderColor: '#2563EB',
                    borderWidth: 1,

                    borderRadius: 6,
                    borderSkipped: false,

                    barPercentage: 0.7,
                    categoryPercentage: 0.8,
                },

                {
                    label: 'Completed',

                    data: data.employee_workload.map(
                        item => item.completed_tasks
                    ),

                    backgroundColor: '#10B981',
                    borderColor: '#059669',
                    borderWidth: 1,

                    borderRadius: 6,
                    borderSkipped: false,

                    barPercentage: 0.7,
                    categoryPercentage: 0.8,
                },
            ],
        }

        // Time tracking data
        timeByTask.value = data.time_by_task

    } catch (e) {
        error.value =
            e.response?.data?.message ||
            'Unable to load analytics.'
    } finally {
        loading.value = false
    }
}

onMounted(loadDashboard)
</script>

<template>
    <div class="p-6 space-y-6 bg-gray-50 min-h-screen">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">
                    Analytics Dashboard
                </h1>

                <p class="text-sm text-gray-500 mt-1">
                    Task performance and team overview
                </p>
            </div>

            <button
                @click="loadDashboard"
                :disabled="loading"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 transition
                       disabled:opacity-50"
            >
                {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
        </div>

        <!-- Loading -->
        <div
            v-if="loading"
            class="text-gray-500 bg-white border rounded-xl p-6"
        >
            Loading analytics...
        </div>

        <!-- Error -->
        <div
            v-else-if="error"
            class="text-red-600 bg-red-50 border border-red-200
                   rounded-xl p-5"
        >
            {{ error }}

            <button
                @click="loadDashboard"
                class="ml-3 underline font-semibold"
            >
                Try again
            </button>
        </div>

        <template v-else>

            <!-- Summary Cards -->
            <div
                class="grid grid-cols-1 sm:grid-cols-2
                       xl:grid-cols-4 gap-4"
            >
                <div
                    v-for="card in [
                        {
                            label: 'Total Tasks',
                            value: summary.total_tasks,
                            color: 'blue',
                            icon: '📋'
                        },
                        {
                            label: 'Completed',
                            value: summary.completed_tasks,
                            color: 'green',
                            icon: '✅'
                        },
                        {
                            label: 'In Progress',
                            value: summary.in_progress_tasks,
                            color: 'yellow',
                            icon: '⏳'
                        },
                        {
                            label: 'Overdue',
                            value: summary.overdue_tasks,
                            color: 'red',
                            icon: '⚠️'
                        }
                    ]"
                    :key="card.label"
                    class="bg-white rounded-xl shadow-sm
                           border border-gray-100 p-5"
                >
                    <div class="flex items-center justify-between">
                        <p class="text-sm text-gray-500">
                            {{ card.label }}
                        </p>

                        <span class="text-xl">
                            {{ card.icon }}
                        </span>
                    </div>

                    <p class="text-3xl font-bold text-gray-800 mt-3">
                        {{ card.value ?? 0 }}
                    </p>
                </div>
            </div>

            <!-- Completion Rate -->
            <div class="bg-white border border-gray-100
                        rounded-xl p-5 shadow-sm">

                <div class="flex items-center justify-between">
                    <h2 class="font-semibold text-gray-800">
                        Overall Completion Rate
                    </h2>

                    <span class="text-lg font-bold text-green-600">
                        {{ summary.completion_rate ?? 0 }}%
                    </span>
                </div>

                <div
                    class="h-3 bg-gray-200 rounded-full
                           mt-4 overflow-hidden"
                >
                    <div
                        class="h-full bg-green-500 rounded-full
                               transition-all duration-500"
                        :style="{
                            width: `${Math.min(
                                100,
                                Math.max(
                                    0,
                                    Number(summary.completion_rate) || 0
                                )
                            )}%`
                        }"
                    ></div>
                </div>
            </div>

            <!-- Charts -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

                <!-- Tasks by Status -->
                <div
                    class="bg-white border border-gray-100
                           rounded-xl p-5 shadow-sm"
                >
                    <h2 class="font-semibold text-gray-800 mb-5">
                        Tasks by Status
                    </h2>

                    <div class="relative h-80">
                        <Doughnut
                            v-if="statusChart"
                            :data="statusChart"
                            :options="statusChartOptions"
                        />
                    </div>
                </div>

                <!-- Employee Workload -->
                <div
                    class="bg-white border border-gray-100
                           rounded-xl p-5 shadow-sm"
                >
                    <h2 class="font-semibold text-gray-800 mb-5">
                        Employee Workload
                    </h2>

                    <div
                        v-if="workloadChart?.labels?.length"
                        class="relative h-80"
                    >
                        <Bar
                            :data="workloadChart"
                            :options="workloadChartOptions"
                        />
                    </div>

                    <div
                        v-else
                        class="h-80 flex items-center justify-center
                               text-gray-400"
                    >
                        No employee workload data available.
                    </div>
                </div>

            </div>

            <!-- Time Tracking -->
            <div
                class="bg-white border border-gray-100
                       rounded-xl p-5 shadow-sm"
            >
                <div class="flex items-center justify-between mb-4">
                    <h2 class="font-semibold text-gray-800">
                        Time Tracking — Top Tasks
                    </h2>

                    <span
                        class="text-xs bg-blue-50 text-blue-700
                               px-3 py-1 rounded-full"
                    >
                        {{ timeByTask.length }} tasks
                    </span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">

                        <thead class="bg-gray-50 text-gray-600">
                            <tr>
                                <th class="p-3 font-semibold">
                                    Task
                                </th>

                                <th class="p-3 font-semibold">
                                    Estimated (min)
                                </th>

                                <th class="p-3 font-semibold">
                                    Actual (min)
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr
                                v-for="task in timeByTask"
                                :key="task.id"
                                class="border-t hover:bg-gray-50"
                            >
                                <td class="p-3 text-gray-800">
                                    {{ task.title }}
                                </td>

                                <td class="p-3 text-gray-600">
                                    {{ task.estimated_minutes ?? '-' }}
                                </td>

                                <td class="p-3 font-medium text-gray-800">
                                    {{
                                        Math.round(
                                            Number(task.actual_minutes) || 0
                                        )
                                    }}
                                </td>
                            </tr>

                            <tr v-if="timeByTask.length === 0">
                                <td
                                    colspan="3"
                                    class="p-6 text-center text-gray-400"
                                >
                                    No time tracking data available.
                                </td>
                            </tr>
                        </tbody>

                    </table>
                </div>
            </div>

        </template>
    </div>
</template>