import api from "./api";

const DashboardService = {
  getDashboard() {
    return api.get("/dashboard");
  },
};

export default DashboardService;
