<template>
    <div class="p-6">

        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">
                    Task Categories
                </h1>

                <p class="text-gray-500">
                    Manage task categories
                </p>
            </div>

            <button
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                @click="openCreateModal"
            >
                + Add Category
            </button>
        </div>

        <div class="bg-white rounded-lg shadow overflow-hidden">

            <table class="w-full">

                <thead class="bg-gray-50">
                    <tr>
                        <th class="text-left p-4">
                            Name
                        </th>

                        <th class="text-left p-4">
                            Description
                        </th>

                        <th class="text-left p-4">
                            Color
                        </th>

                        <th class="text-left p-4">
                            Status
                        </th>

                        <th class="text-right p-4">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>

                    <tr
                        v-for="category in categories"
                        :key="category.id"
                        class="border-t"
                    >
                        <td class="p-4">
                            {{ category.name }}
                        </td>

                        <td class="p-4 text-gray-600">
                            {{ category.description || "—" }}
                        </td>

                        <td class="p-4">
                            <span
                                class="inline-block w-6 h-6 rounded-full border"
                                :style="{
                                    backgroundColor:
                                        category.color || '#6B7280'
                                }"
                            ></span>
                        </td>

                        <td class="p-4">
                            <span
                                :class="
                                    category.is_active
                                        ? 'text-green-600'
                                        : 'text-gray-400'
                                "
                            >
                                {{
                                    category.is_active
                                        ? "Active"
                                        : "Inactive"
                                }}
                            </span>
                        </td>

                        <td class="p-4 text-right">

                            <button
                                class="text-blue-600 mr-3"
                                @click="openEditModal(category)"
                            >
                                Edit
                            </button>

                            <button
                                class="text-red-600"
                                @click="deleteCategory(category)"
                            >
                                Delete
                            </button>

                        </td>
                    </tr>

                    <tr v-if="categories.length === 0">
                        <td
                            colspan="5"
                            class="p-8 text-center text-gray-500"
                        >
                            No categories found.
                        </td>
                    </tr>

                </tbody>

            </table>

        </div>

        <!-- Modal -->
        <div
            v-if="showModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm"
        >
            <div
                class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
            >

                <div class="px-6 py-4 border-b">
                    <h2 class="text-lg font-semibold">
                        {{
                            editingCategory
                                ? "Edit Category"
                                : "Create Category"
                        }}
                    </h2>
                </div>

                <form
                    @submit.prevent="saveCategory"
                    class="p-6 space-y-4"
                >

                    <div>
                        <label class="block text-sm font-medium mb-1">
                            Name
                        </label>

                        <input
                            v-model="form.name"
                            type="text"
                            class="w-full border rounded-lg px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">
                            Description
                        </label>

                        <textarea
                            v-model="form.description"
                            class="w-full border rounded-lg px-3 py-2"
                            rows="3"
                        ></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">
                            Color
                        </label>

                        <input
                            v-model="form.color"
                            type="color"
                            class="w-16 h-10 border rounded"
                        />
                    </div>

                    <div class="flex items-center gap-2">
                        <input
                            v-model="form.is_active"
                            type="checkbox"
                            id="category-active"
                        />

                        <label for="category-active">
                            Active
                        </label>
                    </div>

                    <div class="flex justify-end gap-3 pt-4">

                        <button
                            type="button"
                            class="px-4 py-2 border rounded-lg"
                            @click="closeModal"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            :disabled="saving"
                        >
                            {{ saving ? "Saving..." : "Save" }}
                        </button>

                    </div>

                </form>

            </div>
        </div>

    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import TaskCategoryService from "@/services/TaskCategoryService";

const categories = ref([]);

const showModal = ref(false);
const editingCategory = ref(null);
const saving = ref(false);

const form = ref({
    name: "",
    description: "",
    color: "#3B82F6",
    is_active: true,
});

const loadCategories = async () => {
    try {
        const response =
            await TaskCategoryService.getCategories();

        categories.value = response?.data ?? [];
    } catch (err) {
        console.error(
            "Failed to load categories:",
            err
        );
    }
};

const resetForm = () => {
    form.value = {
        name: "",
        description: "",
        color: "#3B82F6",
        is_active: true,
    };
};

const openCreateModal = () => {
    editingCategory.value = null;
    resetForm();
    showModal.value = true;
};

const openEditModal = (category) => {
    editingCategory.value = category;

    form.value = {
        name: category.name ?? "",
        description: category.description ?? "",
        color: category.color ?? "#3B82F6",
        is_active: category.is_active ?? true,
    };

    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    editingCategory.value = null;
};

const saveCategory = async () => {
    saving.value = true;

    try {
        if (editingCategory.value) {
            await TaskCategoryService.updateCategory(
                editingCategory.value.id,
                form.value
            );
        } else {
            await TaskCategoryService.createCategory(
                form.value
            );
        }

        closeModal();

        await loadCategories();

    } catch (err) {
        console.error(
            "Failed to save category:",
            err
        );
    } finally {
        saving.value = false;
    }
};

const deleteCategory = async (category) => {
    if (
        !window.confirm(
            `Delete "${category.name}"?`
        )
    ) {
        return;
    }

    try {
        await TaskCategoryService.deleteCategory(
            category.id
        );

        await loadCategories();

    } catch (err) {
        console.error(
            "Failed to delete category:",
            err
        );
    }
}; 

onMounted(() => {
    loadCategories();
});
</script>