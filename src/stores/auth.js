import { defineStore } from "pinia";
import api from "@/services/api";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: JSON.parse(
            localStorage.getItem("user") || "null"
        ),

        token: localStorage.getItem("token") || null,
    }),

    getters: {
        isAuthenticated: (state) => {
            return !!state.token;
        },

        roles: (state) => {
            if (!state.user) {
                return [];
            }

            if (state.user.roles) {
                return state.user.roles;
            }

            return [];
        },

        roleNames: (state) => {
            if (!state.user?.roles) {
                return [];
            }

            return state.user.roles.map((role) => {
                return typeof role === "string" ? role : role.name;
            });
        },

        isAdmin() {
            return this.roleNames.includes("Admin");
        },

        isEmployee() {
            return this.roleNames.includes("Employee");
        },
    },


    actions: {

        async register(formData) {

            const response = await api.post(
                "/register",
                formData
            );

            this.token = response.data.token;
            this.user = response.data.user;

            localStorage.setItem("token", this.token);
            localStorage.setItem("user", JSON.stringify(this.user));
        },

        async login(formData) {

            const response = await api.post(
                "/login",
                formData
            );

            this.token = response.data.token;
            this.user = response.data.user;

            localStorage.setItem("token", this.token);
            localStorage.setItem("user", JSON.stringify(this.user));
        },

        async getUser() {

            const response = await api.get(
                "/user"
            );

            this.user = response.data.user ?? response.data.data ?? response.data;

            localStorage.setItem("user", JSON.stringify(this.user));
        },

        async logout() {

            try {
                await api.post("/logout");
            } finally {

                this.user = null;
                this.token = null;

                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        },
    },
});
