<template>
    <div class="bg-white rounded-lg shadow p-6 mt-6">

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-lg font-semibold text-gray-800">
                    Activity History
                </h2>

                <p class="text-sm text-gray-500">
                    Changes made to this task
                </p>
            </div>

            <span
                class="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600"
            >
                {{ activities.length }}
            </span>
        </div>

        <!-- Loading -->
        <div
            v-if="loading"
            class="text-sm text-gray-500"
        >
            Loading activity history...
        </div>

        <!-- Error -->
        <div
            v-else-if="error"
            class="p-3 rounded bg-red-50 text-red-600 text-sm"
        >
            {{ error }}
        </div>

        <!-- Empty -->
        <div
            v-else-if="activities.length === 0"
            class="text-center py-8 text-gray-500"
        >
            No activity history yet.
        </div>

        <!-- Timeline -->
        <div
            v-else
            class="space-y-5"
        >
            <div
                v-for="activity in activities"
                :key="activity.id"
                class="flex gap-4"
            >

                <!-- Icon -->
                <div
                    class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
                >
                    {{ activityIcon(activity.action) }}
                </div>

                <!-- Content -->
                <div class="flex-1">

                    <div class="flex items-center justify-between gap-3">

                        <p class="font-medium text-gray-800">
                            {{ activity.description }}
                        </p>

                        <span class="text-xs text-gray-400 whitespace-nowrap">
                            {{ formatDate(activity.created_at) }}
                        </span>

                    </div>

                    <p class="text-sm text-gray-500 mt-1">
                        By
                        <span class="font-medium text-gray-700">
                            {{ activity.user?.name || "Unknown" }}
                        </span>
                    </p>

                </div>

            </div>
        </div>

    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import TaskService from "@/services/TaskService";

const props = defineProps({
    taskId: {
        type: [Number, String],
        required: true,
    },
});

const activities = ref([]);
const loading = ref(false);
const error = ref("");

const loadActivities = async () => {
    loading.value = true;
    error.value = "";

    try {
        const response = await TaskService.getActivities(
            props.taskId
        );

        activities.value = response?.data ?? [];

    } catch (err) {
        console.error(
            "Failed to load activity history:",
            err
        );

        error.value =
            err.response?.data?.message ||
            "Failed to load activity history.";

    } finally {
        loading.value = false;
    }
};

const activityIcon = (action) => {
    switch (action) {
        case "created":
            return "➕";

        case "updated":
            return "✏️";

        case "assigned":
            return "👤";

        case "status_changed":
            return "🔄";

        case "priority_changed":
            return "⚡";

        default:
            return "📝";
    }
};

const formatDate = (date) => {
    if (!date) {
        return "";
    }

    return new Date(date).toLocaleString();
};

onMounted(() => {
    loadActivities();
});
</script>