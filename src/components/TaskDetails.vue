<script setup>
const props = defineProps({
    task: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits(["close"]);

const close = () => {
    emit("close");
};

const formatStatus = (status) => {
    if (!status) {
        return "-";
    }

    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
</script>

<template>
    <div
        v-if="task"
        class="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-4"
        @click.self="close"
    >

        <div
            class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        >

            <!-- Header -->
            <div
                class="flex items-center justify-between px-6 py-4 border-b border-gray-200"
            >
                <div>
                    <h2 class="text-xl font-bold text-gray-800">
                        Task Details
                    </h2>

                    <p class="text-sm text-gray-500 mt-1">
                        View task information
                    </p>
                </div>

                <button
                    type="button"
                    @click="close"
                    class="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 text-xl"
                >
                    ×
                </button>
            </div>


            <!-- Body -->
            <div class="p-6 space-y-6">

                <!-- Title -->
                <div>
                    <p class="text-sm font-medium text-gray-500">
                        Title
                    </p>

                    <p class="text-lg font-semibold text-gray-800 mt-1">
                        {{ task.title }}
                    </p>
                </div>


                <!-- Description -->
                <div>
                    <p class="text-sm font-medium text-gray-500">
                        Description
                    </p>

                    <p class="text-gray-700 mt-1 whitespace-pre-line">
                        {{ task.description || "No description provided." }}
                    </p>
                </div>


                <!-- Information Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <!-- Priority -->
                    <div>
                        <p class="text-sm font-medium text-gray-500">
                            Priority
                        </p>

                        <p class="text-gray-800 mt-1">
                            {{
                                task.priority
                                    ? task.priority
                                        .replace(/_/g, " ")
                                        .replace(/\b\w/g, l => l.toUpperCase())
                                    : "-"
                            }}
                        </p>
                    </div>


                    <!-- Status -->
                    <div>
                        <p class="text-sm font-medium text-gray-500">
                            Status
                        </p>

                        <span
                            class="inline-flex px-3 py-1 mt-1 rounded-full text-xs font-semibold"
                            :class="statusClass(task.status)"
                        >
                            {{ formatStatus(task.status) }}
                        </span>
                    </div>


                    <!-- Assigned Employee -->
                    <div>
                        <p class="text-sm font-medium text-gray-500">
                            Assigned To
                        </p>

                        <p class="text-gray-800 mt-1">
                            {{
                                task.assigned_to?.name ??
                                task.assignee?.name ??
                                task.assignedUser?.name ??
                                "Unassigned"
                            }}
                        </p>
                    </div>


                    <!-- Due Date -->
                    <div>
                        <p class="text-sm font-medium text-gray-500">
                            Due Date
                        </p>

                        <p class="text-gray-800 mt-1">
                            {{
                                task.due_date
                                    ? new Date(task.due_date).toLocaleDateString()
                                    : "-"
                            }}
                        </p>
                    </div>

                </div>

            </div>


            <!-- Footer -->
            <div
                class="flex justify-end px-6 py-4 border-t border-gray-200"
            >
                <button
                    type="button"
                    @click="close"
                    class="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                >
                    Close
                </button>
            </div>

        </div>

    </div>
</template>
