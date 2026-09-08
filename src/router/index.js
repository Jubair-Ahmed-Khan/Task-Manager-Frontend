import { createRouter, createWebHistory } from "vue-router";

import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import Dashboard from "@/views/Dashboard.vue";
import Tasks from "@/views/Tasks.vue";
import MyTasks from "@/views/MyTasks.vue";
import Employees from "@/views/Employees.vue";
import TaskDetails from "@/views/TaskDetails.vue";
import EmployeePerformance from "@/views/EmployeePerformance.vue";

import DashboardLayout from "@/layouts/DashboardLayout.vue";


const router = createRouter({

    history: createWebHistory(),

    routes: [
        {
            path: "/login",
            name: "login",
            component: Login,
        },
        {
            path: "/register",
            name: "register",
            component: Register,
        },
        {
            path: "/",
            component: DashboardLayout,
            meta: {
                requiresAuth: true,
            },

            children: [
                {
                    path: "",
                    redirect: "/dashboard",
                },
                {
                    path: "dashboard",
                    name: "dashboard",
                    component: Dashboard,
                },
                {
                    path: "tasks",
                    name: "tasks",
                    component: Tasks,
                    meta: {
                        requiresAuth: true,
                        role: "Admin",
                    },
                },
                {
                    path: "tasks/:id",
                    name: "task-details",
                    component: TaskDetails,
                    meta: {
                        requiresAuth: true,
                    },

                    props: true,
                },
                {
                    path: "my-tasks",
                    name: "my-tasks",
                    component: MyTasks,
                    meta: {
                        requiresAuth: true,
                        role: "Employee",
                    },
                },
                {
                    path: "employees",
                    name: "employees",
                    component: Employees,
                    meta: {
                        requiresAuth: true,
                        role: "Admin",
                    },
                },
                {
                    path: "employee-performance",
                    name: "employee-performance",
                    component: EmployeePerformance,

                    meta: {
                        requiresAuth: true,
                        role: "Admin",
                    },
                },
            ],
        },
    ],
});


router.beforeEach(async (to) => {

    const token = localStorage.getItem("token");

    if (to.meta.requiresAuth && !token) 
    {
        return {
            name: "login",
        };
    }


    if ((to.name === "login" || to.name === "register") && token) 
    {
        return {
            name: "dashboard",
        };
    }

    if (to.meta.role && token) 
    {

        const storedUser = JSON.parse(
            localStorage.getItem("user") || "null"
        );

        const roles = storedUser?.roles || [];

        const roleNames = roles.map(
            (role) => {
                return typeof role === "string"
                    ? role
                    : role.name;
            }
        );


        if (!roleNames.includes(to.meta.role)) 
        {
            return {
                name: "dashboard",
            };
        }
    }


    return true;
});


export default router;