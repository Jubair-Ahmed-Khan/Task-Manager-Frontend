import api from "./api";

const TaskService = {
  async getTasks(params = {}) {
    const response = await api.get("/tasks", {
      params,
    });

    return response.data;
  },

  async getTask(id) {
    const response = await api.get(`/tasks/${id}`);

    return response.data;
  },

  async createTask(data) {
    const response = await api.post("/tasks", data);

    return response.data;
  },

  async updateTask(id, data) {
    const response = await api.put(`/tasks/${id}`, data);

    return response.data;
  },

  // async updateTaskStatus(
  //     id,
  //     status
  // ) {

  //     const response = await api.patch(
  //         `/tasks/${id}/status`,
  //         {
  //             status,
  //         }
  //     )

  //     return response.data
  // },

  async updateStatus(id, status) {
    const response = await api.patch(`/tasks/${id}/status`, {
      status,
    });

    return response.data;
  },

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);

    return response.data;
  },
};

export default TaskService;
