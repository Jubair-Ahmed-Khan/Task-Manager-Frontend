<script setup>
import { onMounted, ref } from "vue";
import EmployeeService from "@/services/EmployeeService";

const employees = ref([]);
const loading = ref(false);
const error = ref("");

const loadEmployees = async () => {
    loading.value = true;
    error.value = "";

    try {
        const response = await EmployeeService.getEmployees();

        employees.value = response?.data ?? [];

    } catch (err) {

        console.error("Failed to load employees:", err);

        error.value = err.response?.data?.message ?? "Unable to load employees.";

    } finally {
        loading.value = false;
    }
};


onMounted(() => {
    loadEmployees();
});
</script>


<template>

    <div class="p-6">

        <div class="mb-6">

            <h1 class="text-2xl font-bold text-gray-800">
                Employees
            </h1>

            <p class="text-gray-500 mt-1">
                View employees in your organization.
            </p>

        </div>

        <div v-if="error" class="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {{ error }}
        </div>

        <div v-if="loading" class="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            Loading employees...
        </div>

        <div v-else-if="employees.length === 0" class="bg-white rounded-xl border border-gray-200 p-10 text-center">

            <div class="text-4xl mb-3">
                👥
            </div>

            <h3 class="text-lg font-semibold text-gray-700">
                No employees found
            </h3>

            <p class="text-gray-500 mt-1">
                There are currently no employees.
            </p>

        </div>

        <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">

            <div class="overflow-x-auto">

                <table class="w-full">

                    <thead class="bg-gray-50 border-b">

                        <tr>

                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                #
                            </th>

                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                Name
                            </th>

                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                Email
                            </th>

                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                Joined
                            </th>

                        </tr>

                    </thead>


                    <tbody class="divide-y">

                        <tr
                            v-for="(employee, index) in employees"
                            :key="employee.id"
                            class="hover:bg-gray-50"
                        >

                            <td class="px-6 py-4 text-gray-500">
                                {{ index + 1 }}
                            </td>

                            <td class="px-6 py-4">

                                <div class="flex items-center">

                                    <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold mr-3">
                                        {{ employee.name?.charAt(0)?.toUpperCase() }}
                                    </div>

                                    <span class="font-medium text-gray-800">
                                        {{ employee.name }}
                                    </span>

                                </div>

                            </td>

                            <td class="px-6 py-4 text-gray-600">
                                {{ employee.email }}
                            </td>

                            <td class="px-6 py-4 text-gray-500">

                                {{
                                    employee.created_at
                                        ? new Date(
                                            employee.created_at
                                        ).toLocaleDateString("en-GB")
                                        : "-"
                                }}

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    </div>

</template>
