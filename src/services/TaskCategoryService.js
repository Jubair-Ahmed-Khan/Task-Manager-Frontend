// import api from "./api";

// const TaskCategoryService = {
//     async getCategories(activeOnly = false) {
//         const response = await api.get("/task-categories", {
//             params: {
//                 active_only: activeOnly,
//             },
//         });

//         return response.data;
//     },

//     async createCategory(data) {
//         const response = await api.post(
//             "/task-categories",
//             data
//         );

//         return response.data;
//     },

//     async updateCategory(id, data) {
//         const response = await api.put(
//             `/task-categories/${id}`,
//             data
//         );

//         return response.data;
//     },

//     async deleteCategory(id) {
//         const response = await api.delete(
//             `/task-categories/${id}`
//         );

//         return response.data;
//     },
// };

// export default TaskCategoryService;

import api from "./api";

const TaskCategoryService = {
    async getCategories(activeOnly = false) {
        const response = await api.get("/task-categories", {
            params: {
                active_only: activeOnly,
            },
        });

        return response.data;
    },

    async createCategory(data) {
        const response = await api.post(
            "/task-categories",
            data
        );

        return response.data;
    },

    async updateCategory(id, data) {
        const response = await api.put(
            `/task-categories/${id}`,
            data
        );

        return response.data;
    },

    async deleteCategory(id) {
        const response = await api.delete(
            `/task-categories/${id}`
        );

        return response.data;
    },
};

export default TaskCategoryService;