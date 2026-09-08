<script setup>
import { onMounted, ref } from "vue";
import EmployeeService from "@/services/EmployeeService";

const employees = ref([]);
const loading = ref(false);
const error = ref("");


const loadPerformance = async () => {

    loading.value = true;

    try {

        const response =
            await EmployeeService.getPerformance();

        employees.value =
            response.data ?? [];

    } catch (err) {

        console.error(err);

        error.value =
            err.response?.data?.message ||
            "Unable to load employee performance.";

    } finally {

        loading.value = false;

    }
};


onMounted(() => {

    loadPerformance();

});
</script>


<template>

    <div class="space-y-6">

        <div>

            <h1 class="text-2xl font-bold text-gray-900">
                Employee Performance
            </h1>

            <p class="text-gray-500 mt-1">
                Monitor employee task performance.
            </p>

        </div>


        <div
            v-if="loading"
            class="bg-white rounded-xl p-10 text-center"
        >
            Loading performance...
        </div>


        <div
            v-else-if="error"
            class="bg-red-50 text-red-600 p-4 rounded-lg"
        >
            {{ error }}
        </div>


        <div
            v-else
            class="bg-white rounded-xl shadow overflow-hidden"
        >

            <div class="overflow-x-auto">

                <table class="w-full">

                    <thead class="bg-gray-50 border-b">

                        <tr>

                            <th class="text-left px-5 py-4">
                                Employee
                            </th>

                            <th class="text-center px-5 py-4">
                                Total
                            </th>

                            <th class="text-center px-5 py-4">
                                Completed
                            </th>

                            <th class="text-center px-5 py-4">
                                In Progress
                            </th>

                            <th class="text-center px-5 py-4">
                                Pending
                            </th>

                            <th class="text-center px-5 py-4">
                                Overdue
                            </th>

                            <th class="text-center px-5 py-4">
                                Completion
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        <tr
                            v-for="employee in employees"
                            :key="employee.id"
                            class="border-b hover:bg-gray-50"
                        >

                            <td class="px-5 py-4">

                                <div class="font-medium">
                                    {{ employee.name }}
                                </div>

                                <div class="text-sm text-gray-500">
                                    {{ employee.email }}
                                </div>

                            </td>


                            <td class="text-center px-5 py-4">
                                {{ employee.total_tasks }}
                            </td>


                            <td class="text-center px-5 py-4 text-green-600">
                                {{ employee.completed_tasks }}
                            </td>


                            <td class="text-center px-5 py-4 text-blue-600">
                                {{ employee.in_progress_tasks }}
                            </td>


                            <td class="text-center px-5 py-4 text-yellow-600">
                                {{ employee.pending_tasks }}
                            </td>


                            <td class="text-center px-5 py-4 text-red-600">
                                {{ employee.overdue_tasks }}
                            </td>


                            <td class="text-center px-5 py-4">

                                <div class="flex items-center gap-2">

                                    <div
                                        class="flex-1 h-2 bg-gray-200 rounded-full"
                                    >

                                        <div
                                            class="h-2 bg-green-500 rounded-full"
                                            :style="{
                                                width:
                                                    employee.completion_rate + '%'
                                            }"
                                        ></div>

                                    </div>

                                    <span class="text-sm font-medium">
                                        {{ employee.completion_rate }}%
                                    </span>

                                </div>

                            </td>

                        </tr>


                        <tr
                            v-if="employees.length === 0"
                        >

                            <td
                                colspan="7"
                                class="text-center py-10 text-gray-500"
                            >
                                No employees found.
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    </div>
</template>