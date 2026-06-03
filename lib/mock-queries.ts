import {
  companySettings,
  departments,
  employees,
  vacationBalances,
  vacationRequests,
} from "@/lib/mock-data";
import type { UserRole, VacationRequest } from "@/lib/types";

export function getCompanySettings() {
  return companySettings;
}

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

export function getManagedDepartmentsForEmployee(employeeId: string) {
  return departments.filter(
    (department) => department.managerId === employeeId
  );
}

export function getManagedDepartmentIdsForEmployee(employeeId: string) {
  return getManagedDepartmentsForEmployee(employeeId).map(
    (department) => department.id
  );
}

export function getVacationRequestById(id: string) {
  return vacationRequests.find((request) => request.id === id);
}

export function getVacationBalanceByEmployeeId(
  employeeId: string,
  year = new Date().getFullYear()
) {
  return vacationBalances.find(
    (balance) => balance.employeeId === employeeId && balance.year === year
  );
}

export function getVacationBalancesByEmployeeId(employeeId: string) {
  return vacationBalances.filter((balance) => balance.employeeId === employeeId);
}

export function getPendingVacationRequests() {
  return vacationRequests.filter((request) => request.status === "Ausstehend");
}

export function canViewAllEmployeeData(role: UserRole) {
  return role === "hr" || role === "admin";
}

export function canViewManagedDepartmentData(role: UserRole) {
  return role === "manager";
}

export function getVisibleVacationRequestsForUser(
  employeeId: string,
  role: UserRole
) {
  if (canViewAllEmployeeData(role)) {
    return vacationRequests;
  }

  if (canViewManagedDepartmentData(role)) {
    const managedDepartmentIds = getManagedDepartmentIdsForEmployee(employeeId);

    return vacationRequests.filter((request) => {
      const requestEmployee = getEmployeeById(request.employeeId);

      return (
        request.employeeId === employeeId ||
        (requestEmployee
          ? managedDepartmentIds.includes(requestEmployee.departmentId)
          : false)
      );
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

  if (canViewManagedDepartmentData(role)) {
    const managedDepartmentIds = getManagedDepartmentIdsForEmployee(employeeId);

    return employees.filter(
      (employee) =>
        employee.id === employeeId ||
        managedDepartmentIds.includes(employee.departmentId)
    );
  }

  return employees.filter((employee) => employee.id === employeeId);
}

export function getSelectableEmployeesForVacationRequest(
  employeeId: string,
  role: UserRole
) {
  if (canViewAllEmployeeData(role)) {
    return employees;
  }

  if (canViewManagedDepartmentData(role)) {
    const managedDepartmentIds = getManagedDepartmentIdsForEmployee(employeeId);

    return employees.filter((employee) =>
      managedDepartmentIds.includes(employee.departmentId)
    );
  }

  return employees.filter((employee) => employee.id === employeeId);
}

export function canUserViewEmployee(
  currentEmployeeId: string,
  role: UserRole,
  targetEmployeeId: string
) {
  if (canViewAllEmployeeData(role)) {
    return true;
  }

  if (currentEmployeeId === targetEmployeeId) {
    return true;
  }

  if (canViewManagedDepartmentData(role)) {
    const targetEmployee = getEmployeeById(targetEmployeeId);

    if (!targetEmployee) {
      return false;
    }

    const managedDepartmentIds =
      getManagedDepartmentIdsForEmployee(currentEmployeeId);

    return managedDepartmentIds.includes(targetEmployee.departmentId);
  }

  return false;
}

export function getNextApproverIdForVacationRequest(request: VacationRequest) {
  if (request.status !== "Ausstehend") {
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

export function getNextApproverIdForRequest(requestId: string) {
  const request = getVacationRequestById(requestId);

  if (!request) {
    return undefined;
  }

  return getNextApproverIdForVacationRequest(request);
}

export function getApprovableRequestsForEmployee(employeeId: string) {
  return getPendingVacationRequests().filter((request) => {
    const nextApproverId = getNextApproverIdForRequest(request.id);

    return nextApproverId === employeeId;
  });
}

export function getVisibleApprovalRequestsForUser(
  employeeId: string,
  role: UserRole
) {
  if (role === "employee") {
    return [];
  }

  if (canViewAllEmployeeData(role)) {
    return getPendingVacationRequests();
  }

  return getApprovableRequestsForEmployee(employeeId);
}


