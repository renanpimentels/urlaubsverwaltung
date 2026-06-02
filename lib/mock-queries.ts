import {
  departments,
  employees,
  vacationBalances,
  vacationRequests,
} from "@/lib/mock-data";

export function getDepartmentById(id: string) {
  return departments.find((department) => department.id === id);
}

export function getEmployeeById(id: string) {
  return employees.find((employee) => employee.id === id);
}

export function getDepartmentByEmployeeId(employeeId: string) {
  const employee = getEmployeeById(employeeId);

  if (!employee) {
    return undefined;
  }

  return getDepartmentById(employee.departmentId);
}

export function getVacationRequestById(id: string) {
  return vacationRequests.find((request) => request.id === id);
}

export function getVacationBalanceByEmployeeId(employeeId: string) {
  return vacationBalances.find((balance) => balance.employeeId === employeeId);
}

export function getPendingVacationRequests() {
  return vacationRequests.filter((request) => request.status === "Ausstehend");
}