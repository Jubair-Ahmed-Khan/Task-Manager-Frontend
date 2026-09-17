<template>
    <div class="bg-white rounded-lg shadow p-6 mt-6">

        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
            <div>
                <h2 class="text-lg font-semibold text-gray-800">
                    Attachments
                </h2>

                <p class="text-sm text-gray-500">
                    Files related to this task
                </p>
            </div>

            <label
                class="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
                {{ uploading ? "Uploading..." : "Upload File" }}

                <input
                    type="file"
                    class="hidden"
                    :disabled="uploading"
                    @change="handleFileUpload"
                />
            </label>
        </div>

        <!-- Upload Error -->
        <div
            v-if="error"
            class="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm"
        >
            {{ error }}
        </div>

        <!-- Loading -->
        <div
            v-if="loading"
            class="text-gray-500 text-sm"
        >
            Loading attachments...
        </div>

        <!-- Empty -->
        <div
            v-else-if="attachments.length === 0"
            class="border border-dashed rounded-lg p-8 text-center text-gray-500"
        >
            No attachments yet.
        </div>

        <!-- Attachments -->
        <div
            v-else
            class="space-y-3"
        >
            <div
                v-for="attachment in attachments"
                :key="attachment.id"
                class="flex items-center justify-between border rounded-lg p-4"
            >
                <div class="flex items-center gap-3 min-w-0">

                    <div
                        class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"
                    >
                        📎
                    </div>

                    <div class="min-w-0">
                        <p
                            class="font-medium text-gray-800 truncate"
                            :title="attachment.original_name"
                        >
                            {{ attachment.original_name }}
                        </p>

                        <p class="text-xs text-gray-500">
                            {{ formatFileSize(attachment.file_size) }}
                            ·
                            {{ attachment.user?.name || "Unknown" }}
                            ·
                            {{ formatDate(attachment.created_at) }}
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-2 ml-4">

                    <button
                        type="button"
                        class="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        @click="downloadFile(attachment)"
                    >
                        Download
                    </button>

                    <button
                        v-if="canDeleteAttachment(attachment)"
                        type="button"
                        class="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                        @click="openDeleteModal(attachment)"
                    >
                        Delete
                    </button>

                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div
            v-if="showDeleteModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-sm"
        >
            <div
                class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
                @click.stop
            >

                <!-- Modal Header -->
                <div class="px-6 py-4 border-b">
                    <h3 class="text-lg font-semibold text-gray-800">
                        Delete Attachment
                    </h3>
                </div>

                <!-- Modal Body -->
                <div class="px-6 py-5">

                    <p class="text-gray-600">
                        Are you sure you want to delete this attachment?
                    </p>

                    <p
                        v-if="deleteTarget"
                        class="mt-2 font-medium text-gray-800 break-all"
                    >
                        {{ deleteTarget.original_name }}
                    </p>

                    <p class="mt-2 text-sm text-gray-500">
                        This action cannot be undone.
                    </p>

                </div>

                <!-- Modal Footer -->
                <div
                    class="px-6 py-4 border-t flex justify-end gap-3"
                >
                    <button
                        type="button"
                        class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                        :disabled="deleting"
                        @click="closeDeleteModal"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        :disabled="deleting"
                        @click="confirmDelete"
                    >
                        {{ deleting ? "Deleting..." : "Delete" }}
                    </button>
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

const currentUser = ref(JSON.parse(localStorage.getItem("user") || "null"));
const attachments = ref([]);
const loading = ref(false);
const uploading = ref(false);
const error = ref("");
const showDeleteModal = ref(false);
const deleteTarget = ref(null);
const deleting = ref(false);

const isAdmin = () => {
    const roles = currentUser.value?.roles || [];

    return roles.some(role =>
        (typeof role === "string" ? role : role.name) === "Admin"
    );
};

const canDeleteAttachment = (attachment) => {
    if (isAdmin()) {
        return true;
    }

    return attachment.user_id === currentUser.value?.id;
};

const loadAttachments = async () => {
    loading.value = true;
    error.value = "";

    try {
        const response = await TaskService.getAttachments(props.taskId);

        attachments.value = response?.data ?? [];
    } catch (err) {
        console.error("Failed to load attachments:", err);

        error.value =
            err.response?.data?.message ||
            "Failed to load attachments.";
    } finally {
        loading.value = false;
    }
};

const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    error.value = "";
    uploading.value = true;

    try {
        const response = await TaskService.uploadAttachment(
            props.taskId,
            file
        );

        if (response?.data) {
            attachments.value.unshift(response.data);
        }

    } catch (err) {
        console.error("Upload failed:", err);

        error.value =
            err.response?.data?.message ||
            "Failed to upload attachment.";
    } finally {
        uploading.value = false;

        // Reset file input
        event.target.value = "";
    }
};

const downloadFile = async (attachment) => {
    try {
        const response = await TaskService.downloadAttachment(
            attachment.id
        );

        const blob = new Blob([response.data]);

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = attachment.original_name;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

    } catch (err) {
        console.error("Download failed:", err);

        error.value =
            err.response?.data?.message ||
            "Failed to download attachment.";
    }
};

const openDeleteModal = (attachment) => {
    deleteTarget.value = attachment;
    showDeleteModal.value = true;
};

const closeDeleteModal = () => {
    showDeleteModal.value = false;
    deleteTarget.value = null;
};

const confirmDelete = async () => {
    if (!deleteTarget.value) {
        return;
    }

    deleting.value = true;
    error.value = "";

    try {
        const attachmentId = deleteTarget.value.id;

        await TaskService.deleteAttachment(attachmentId);

        attachments.value = attachments.value.filter(
            item => item.id !== attachmentId
        );

        // Close modal AFTER successful deletion
        closeDeleteModal();

    } catch (err) {
        console.error("Delete failed:", err);

        error.value =
            err.response?.data?.message ||
            "Failed to delete attachment.";
    } finally {
        deleting.value = false;
    }
};

const formatFileSize = (bytes) => {
    if (!bytes) {
        return "Unknown size";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date) => {
    if (!date) {
        return "";
    }

    return new Date(date).toLocaleString();
};

onMounted(() => {
    loadAttachments();
});
</script>