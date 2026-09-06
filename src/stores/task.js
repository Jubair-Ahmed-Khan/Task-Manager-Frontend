import { defineStore } from "pinia";

import TaskService from "@/services/TaskService";

export const useTaskStore = defineStore("task", {
  state: () => ({
    tasks: [],
    currentTask: null,
    loading: false,
    error: null,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    },
  }),

  actions: {
    async fetchTasks(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await TaskService.getTasks(params);

        this.tasks = response.data?.data || [];

        const meta = response.data;

        this.pagination = {
          current_page: meta?.current_page || 1,

          last_page: meta?.last_page || 1,

          per_page: meta?.per_page || 10,

          total: meta?.total || 0,
        };

        return response;
      } catch (error) {
        this.error = error.response?.data?.message || "Failed to load tasks.";

        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTask(id) {
      this.loading = true;
      this.error = null;
      this.currentTask = null;

      try {
        const response = await TaskService.getTask(id);

        console.log("Task API response:", response);

        this.currentTask = response?.data ?? null;

        console.log("Current task:", this.currentTask);

        return response;
      } catch (error) {
        this.currentTask = null;
        this.error = error.response?.data?.message || "Failed to load task.";

        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createTask(data) {
      try {
        const response = await TaskService.createTask(data);

        return response;
      } catch (error) {
        throw error;
      }
    },

    async updateTask(id, data) {
      try {
        const response = await TaskService.updateTask(id, data);

        return response;
      } catch (error) {
        throw error;
      }
    },

    async updateTaskStatus(id, status) {
      try {
        const response = await TaskService.updateTaskStatus(id, status);
        const task = this.tasks.find((task) => task.id === id);

        if (task) {
          task.status = response.data?.status || status;
        }

        if (this.currentTask && this.currentTask.id === id) {
          this.currentTask.status = response.data?.status || status;
        }

        return response;
      } catch (error) {
        throw error;
      }
    },

    async deleteTask(id) {
      try {
        const response = await TaskService.deleteTask(id);

        this.tasks = this.tasks.filter((task) => task.id !== id);

        return response;
      } catch (error) {
        throw error;
      }
    },
  },
});
