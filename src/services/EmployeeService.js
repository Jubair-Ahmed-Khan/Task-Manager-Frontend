import api from "./api";

const EmployeeService = {
  async getEmployees() {
    const response = await api.get("/employees");

    return response.data;
  },
};

export default EmployeeService;
