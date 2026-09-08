import api from "./api";

const EmployeeService = {
  async getEmployees() {
    const response = await api.get("/employees");

    return response.data;
  },
  async getPerformance() {

    const response =
        await api.get(
            '/employees/performance'
        );

    return response.data;
  },
};

export default EmployeeService;
