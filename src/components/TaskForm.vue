<script setup>
import { onMounted, ref, watch } from "vue";
import TaskService from "@/services/TaskService";
import EmployeeService from "@/services/EmployeeService";
import api from "@/services/api";

const props = defineProps({
    show: {
        type: Boolean,
        default: false,
    },

    task: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits([
    "close",
    "saved",
]);


/*
|--------------------------------------------------------------------------
| Form
|--------------------------------------------------------------------------
*/

const form = ref({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    assigned_to: "",
    due_date: "",
});


/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const errors = ref({});
const loading = ref(false);
const loadingEmployees = ref(false);
const employees = ref([]);



/*
|--------------------------------------------------------------------------
| Reset Form
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This function is declared BEFORE watch().
| Therefore we won't get:
|
| ReferenceError: Cannot access 'resetForm' before initialization
|
|--------------------------------------------------------------------------
*/

const resetForm = () => {
    form.value = {
        title: "",
        description: "",
        priority: "medium",
        status: "pending",
        assigned_to: "",
        due_date: "",
    };

    errors.value = {};
};


/*
|--------------------------------------------------------------------------
| Fill Form For Editing
|--------------------------------------------------------------------------
*/

const fillForm = (task) => {
    if (!task) {
        resetForm();
        return;
    }

    form.value = {
        title: task.title ?? "",
        description: task.description ?? "",
        priority: task.priority ?? "medium",
        status: task.status ?? "pending",
        assigned_to:
            task.assigned_to ??
            task.assigned_to_id ??
            task.assignee?.id ??
            '',
        due_date: task.due_date
            ? task.due_date.substring(0, 10)
            : "",
    };

    errors.value = {};
};


/*
|--------------------------------------------------------------------------
| Watch Task Prop
|--------------------------------------------------------------------------
*/

// watch(
//     () => props.task,
//     async (newTask) => {
//         fillForm(newTask);

//         // If editing, make sure employees are available
//         if (newTask) {
//             await loadEmployees();
//         }
//     },
//     {
//         immediate: true,
//     }
// );

// watch(
//     () => props.show,
//     async (visible) => {
//         if (!visible) return;

//         fillForm(props.task);

//         await loadEmployees();
//     }
// );
watch(
    () => props.task,
    (newTask) => {
        fillForm(newTask)
    },
    {
        immediate: true
    }
)


/*
|--------------------------------------------------------------------------
| Load Employees
|--------------------------------------------------------------------------
*/

const loadEmployees = async () => {
    loadingEmployees.value = true;
    errors.value = "";

    try {
        const response = await EmployeeService.getEmployees();

        console.log("Employee API response:", response.data);

        employees.value = response?.data ?? [];

        console.log("Employees:", employees.value);

    } catch (err) {
        console.error("Employee loading error:", err);
        console.error("Status:", err.response?.status);
        console.error("Response:", err.response?.data);

        errors.value =
            err.response?.data?.message ||
            "Unable to load employees.";

        employees.value = [];
    } finally {
        loadingEmployees.value = false;
    }
};


/*
|--------------------------------------------------------------------------
| Submit
|--------------------------------------------------------------------------
*/

const submit = async () => {
    loading.value = true;
    errors.value = {};

    try {
        const payload = {
            title: form.value.title,
            description: form.value.description,
            priority: form.value.priority,
            status: form.value.status,
            assigned_to: form.value.assigned_to || null,
            due_date: form.value.due_date || null,
        };

        /*
        |--------------------------------------------------------------------------
        | Edit
        |--------------------------------------------------------------------------
        */

        if (props.task?.id) {
            await TaskService.updateTask(
                props.task.id,
                payload
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Create
        |--------------------------------------------------------------------------
        */

        else {
            await TaskService.createTask(payload);
        }

        emit("saved");

    } catch (err) {
        console.error("Task save error:", err);

        /*
        |--------------------------------------------------------------------------
        | Laravel validation errors
        |--------------------------------------------------------------------------
        */

        if (err.response?.status === 422) {
            errors.value =
                err.response.data.errors ?? {};
        }

        /*
        |--------------------------------------------------------------------------
        | General error
        |--------------------------------------------------------------------------
        */

        else {
            errors.value = {
                general: [
                    err.response?.data?.message ??
                    "Something went wrong."
                ],
            };
        }
    } finally {
        loading.value = false;
    }
};


/*
|--------------------------------------------------------------------------
| Close
|--------------------------------------------------------------------------
*/

const close = () => {
    if (loading.value) {
        return;
    }

    emit("close");
};


/*
|--------------------------------------------------------------------------
| Escape Key
|--------------------------------------------------------------------------
*/

const handleEscape = (event) => {
    if (event.key === "Escape") {
        close();
    }
};


onMounted(async () => {
    document.addEventListener(
        "keydown",
        handleEscape
    );

    await loadEmployees();
});
</script>


<template>

    <!-- ============================================================= -->
    <!-- MODAL OVERLAY -->
    <!-- ============================================================= -->

    <div
        class="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-4"
        @click.self="close"
    >

        <!-- ========================================================= -->
        <!-- MODAL -->
        <!-- ========================================================= -->

        <div
            class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        >

            <!-- ===================================================== -->
            <!-- HEADER -->
            <!-- ===================================================== -->

            <div
                class="flex items-center justify-between px-6 py-4 border-b border-gray-200"
            >

                <div>
                    <h2 class="text-xl font-bold text-gray-800">
                        {{ props.task ? "Edit Task" : "Create Task" }}
                    </h2>

                    <p class="text-sm text-gray-500 mt-1">
                        {{
                            props.task
                                ? "Update task information."
                                : "Create and assign a new task."
                        }}
                    </p>
                </div>


                <!-- CLOSE -->

                <button
                    type="button"
                    @click="close"
                    class="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 text-xl"
                >
                    ×
                </button>

            </div>


            <!-- ===================================================== -->
            <!-- FORM -->
            <!-- ===================================================== -->

            <form
                @submit.prevent="submit"
                class="p-6 space-y-5"
            >

                <!-- General Error -->

                <div
                    v-if="errors.general"
                    class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700"
                >
                    {{ errors.general[0] }}
                </div>


                <!-- TITLE -->

                <div>

                    <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Title
                    </label>

                    <input
                        v-model="form.title"
                        type="text"
                        placeholder="Enter task title"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />

                    <p
                        v-if="errors.title"
                        class="text-sm text-red-600 mt-1"
                    >
                        {{ errors.title[0] }}
                    </p>

                </div>


                <!-- DESCRIPTION -->

                <div>

                    <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Description
                    </label>

                    <textarea
                        v-model="form.description"
                        rows="4"
                        placeholder="Enter task description"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    ></textarea>

                    <p
                        v-if="errors.description"
                        class="text-sm text-red-600 mt-1"
                    >
                        {{ errors.description[0] }}
                    </p>

                </div>


                <!-- PRIORITY + STATUS -->

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <!-- PRIORITY -->

                    <div>

                        <label
                            class="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Priority
                        </label>

                        <select
                            v-model="form.priority"
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
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

                        <p
                            v-if="errors.priority"
                            class="text-sm text-red-600 mt-1"
                        >
                            {{ errors.priority[0] }}
                        </p>

                    </div>


                    <!-- STATUS -->

                    <div>

                        <label
                            class="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Status
                        </label>

                        <select
                            v-model="form.status"
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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

                            <option value="cancelled">
                                Cancelled
                            </option>
                        </select>

                        <p
                            v-if="errors.status"
                            class="text-sm text-red-600 mt-1"
                        >
                            {{ errors.status[0] }}
                        </p>

                    </div>

                </div>


                <!-- ASSIGN EMPLOYEE -->

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Assign Employee
                    </label>

                    <div
                        v-if="loadingEmployees"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-500"
                    >
                        Loading employees...
                    </div>

                    <select
                        v-else
                        v-model="form.assigned_to"
                        required
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    >
                        <option value="">
                            Select Employee
                        </option>

                        <option
                            v-for="employee in employees"
                            :key="employee.id"
                            :value="employee.id"
                        >
                            {{ employee.name }} - {{ employee.email }}
                        </option>
                    </select>

                    <p
                        v-if="errors.assigned_to"
                        class="mt-2 text-sm text-red-600"
                    >
                        {{ errors.assigned_to[0] }}
                    </p>

                    <p
                        v-else-if="!loading && employees.length === 0"
                        class="mt-2 text-sm text-orange-600"
                    >
                        No employees available.
                    </p>
                </div>


                <!-- DUE DATE -->

                <div>

                    <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Due Date
                    </label>

                    <input
                        v-model="form.due_date"
                        type="date"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />

                    <p
                        v-if="errors.due_date"
                        class="text-sm text-red-600 mt-1"
                    >
                        {{ errors.due_date[0] }}
                    </p>

                </div>


                <!-- ================================================= -->
                <!-- FOOTER -->
                <!-- ================================================= -->

                <div
                    class="flex justify-end gap-3 pt-5 border-t border-gray-200"
                >

                    <button
                        type="button"
                        @click="close"
                        :disabled="loading"
                        class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        :disabled="loading"
                        class="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span v-if="loading">
                            Saving...
                        </span>

                        <span v-else>
                            {{ props.task ? "Update Task" : "Create Task" }}
                        </span>
                    </button>

                </div>

            </form>

        </div>

    </div>

</template>
