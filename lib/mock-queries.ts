import {
  departments,
  employees,
  vacationBalances,
  vacationRequests,
} from "@/lib/mock-data";

import type { UserRole } from "@/lib/types";


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

export function getNextApproverIdForRequest(requestId: string) {
  const request = getVacationRequestById(requestId);

  if (!request || request.status !== "Ausstehend") {
    return undefined;
  }

  const department = getDepartmentByEmployeeId(request.employeeId);

  if (!department) {
    return undefined;
  }

  if (request.approvalStepsCompleted === 0) {
    return department.managerId;
  }

  if (request.approvalStepsCompleted === 1) {
    return department.finalApproverId;
  }

  return undefined;
}

export function getApprovableRequestsForEmployee(employeeId: string) {
  return getPendingVacationRequests().filter((request) => {
    const nextApproverId = getNextApproverIdForRequest(request.id);

    return nextApproverId === employeeId;
  });
}


export function canViewAllEmployeeData(role: UserRole) {
  return role === "hr" || role === "admin";
}

export function canViewDepartmentEmployeeData(role: UserRole) {
  return role === "manager";
}

export function getVisibleVacationRequestsForUser(
  employeeId: string,
  role: UserRole
) {
  if (canViewAllEmployeeData(role)) {
    return vacationRequests;
  }

  const currentEmployee = getEmployeeById(employeeId);

  if (!currentEmployee) {
    return [];
  }

  if (canViewDepartmentEmployeeData(role)) {
    return vacationRequests.filter((request) => {
      const requestEmployee = getEmployeeById(request.employeeId);

      return requestEmployee?.departmentId === currentEmployee.departmentId;
    });
  }

  return vacationRequests.filter((request) => request.employeeId === employeeId);
}

export function getVisibleUpcomingAbsencesForUser(
  employeeId: string,
  role: UserRole
) {
  const visibleRequests = getVisibleVacationRequestsForUser(employeeId, role);

  return visibleRequests.filter((request) => request.status === "Genehmigt");
}

export function getVisibleEmployeesForUser(employeeId: string, role: UserRole) {
  if (canViewAllEmployeeData(role)) {
    return employees;
  }

  const currentEmployee = getEmployeeById(employeeId);

  if (!currentEmployee) {
    return [];
  }

  if (canViewDepartmentEmployeeData(role)) {
    return employees.filter(
      (employee) => employee.departmentId === currentEmployee.departmentId
    );
  }

  return employees.filter((employee) => employee.id === employeeId);
}