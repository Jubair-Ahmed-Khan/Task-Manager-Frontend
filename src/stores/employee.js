import { defineStore } from "pinia";

import api from "@/services/api";

export const useEmployeeStore = defineStore("employee", {
  state: () => ({
    employees: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchEmployees() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get("/employees");

        this.employees = response.data?.data || [];

        return response;
      } catch (error) {
        this.error =
          error.response?.data?.message || "Failed to load employees.";

        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
