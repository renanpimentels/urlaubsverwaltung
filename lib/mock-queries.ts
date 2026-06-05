import {
  approvalDecisions,
  companySettings,
  departments,
  employees,
  users,
  vacationBalances,
  vacationRequests,
} from "@/lib/mock-data";
import type { UserRole, VacationRequest } from "@/lib/types";

export function getCompanySettings() {
  return companySettings;
}

export function getUserById(id: string) {
  return users.find((user) => user.id === id);
}

export function getUserByEmployeeId(employeeId: string) {
  return users.find((user) => user.employeeId === employeeId);
}

export function getCurrentEmployeeByUserId(userId: string) {
  const user = getUserById(userId);

  if (!user?.employeeId) {
    return undefined;
  }

  return getEmployeeById(user.employeeId);
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

export function getApprovalRelevantDepartmentsForEmployee(employeeId: string) {
  const employee = getEmployeeById(employeeId);

  return departments.filter(
    (department) =>
      department.managerId === employeeId ||
      department.finalApproverId === employeeId ||
      department.id === employee?.departmentId
  );
}

export function getApprovalRelevantDepartmentIdsForEmployee(employeeId: string) {
  return getApprovalRelevantDepartmentsForEmployee(employeeId).map(
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

// Alias para não quebrar código antigo, caso ainda exista algum import antigo.
export function canViewDepartmentEmployeeData(role: UserRole) {
  return canViewManagedDepartmentData(role);
}

export function getVisibleVacationRequestsForUser(
  employeeId: string | undefined,
  role: UserRole
) {
  if (canViewAllEmployeeData(role)) {
    return vacationRequests;
  }

  if (!employeeId) {
    return [];
  }

  if (canViewManagedDepartmentData(role)) {
    const visibleDepartmentIds =
      getApprovalRelevantDepartmentIdsForEmployee(employeeId);

    return vacationRequests.filter((request) => {
      const requestEmployee = getEmployeeById(request.employeeId);

      return (
        request.employeeId === employeeId ||
        (requestEmployee
          ? visibleDepartmentIds.includes(requestEmployee.departmentId)
          : false)
      );
    });
  }

  return vacationRequests.filter((request) => request.employeeId === employeeId);
}

export function getVisibleUpcomingAbsencesForUser(
  employeeId: string | undefined,
  role: UserRole
) {
  const visibleRequests = getVisibleVacationRequestsForUser(employeeId, role);

  return visibleRequests.filter((request) => request.status === "Genehmigt");
}

export function getVisibleEmployeesForUser(
  employeeId: string | undefined,
  role: UserRole
) {
  if (canViewAllEmployeeData(role)) {
    return employees;
  }

  if (!employeeId) {
    return [];
  }

  if (role === "employee") {
    return employees.filter((employee) => employee.id === employeeId);
  }

  if (canViewManagedDepartmentData(role)) {
    const visibleDepartmentIds =
      getApprovalRelevantDepartmentIdsForEmployee(employeeId);

    return employees.filter(
      (employee) =>
        employee.id === employeeId ||
        visibleDepartmentIds.includes(employee.departmentId)
    );
  }

  return [];
}

export function getSelectableEmployeesForVacationRequest(
  employeeId: string | undefined,
  role: UserRole
) {
  if (canViewAllEmployeeData(role)) {
    return employees;
  }

  if (!employeeId) {
    return [];
  }

  if (canViewManagedDepartmentData(role)) {
    const visibleDepartmentIds =
      getApprovalRelevantDepartmentIdsForEmployee(employeeId);

    return employees.filter(
      (employee) =>
        employee.id === employeeId ||
        visibleDepartmentIds.includes(employee.departmentId)
    );
  }

  return employees.filter((employee) => employee.id === employeeId);
}

export function canUserViewEmployee(
  currentEmployeeId: string | undefined,
  role: UserRole,
  targetEmployeeId: string
) {
  if (canViewAllEmployeeData(role)) {
    return true;
  }

  if (!currentEmployeeId) {
    return false;
  }

  if (currentEmployeeId === targetEmployeeId) {
    return true;
  }

  if (canViewManagedDepartmentData(role)) {
    const targetEmployee = getEmployeeById(targetEmployeeId);

    if (!targetEmployee) {
      return false;
    }

    const visibleDepartmentIds =
      getApprovalRelevantDepartmentIdsForEmployee(currentEmployeeId);

    return visibleDepartmentIds.includes(targetEmployee.departmentId);
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

export function getApprovableRequestsForEmployee(
  employeeId: string | undefined
) {
  if (!employeeId) {
    return [];
  }

  return getPendingVacationRequests().filter((request) => {
    const nextApproverId = getNextApproverIdForRequest(request.id);

    return nextApproverId === employeeId;
  });
}

export function getVisibleApprovalRequestsForUser(
  employeeId: string | undefined,
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

export function getApprovalDecisionsByRequestId(vacationRequestId: string) {
  return approvalDecisions
    .filter((decision) => decision.vacationRequestId === vacationRequestId)
    .sort((firstDecision, secondDecision) => {
      return firstDecision.stepOrder - secondDecision.stepOrder;
    });
}

export function getApprovalDecisionByRequestIdAndStep(
  vacationRequestId: string,
  stepOrder: number
) {
  return approvalDecisions.find(
    (decision) =>
      decision.vacationRequestId === vacationRequestId &&
      decision.stepOrder === stepOrder
  );
}

export function canCreateEmployee(role: UserRole) {
  return role === "hr" || role === "admin";
}

export function canAccessSettings(role: UserRole) {
  return role === "hr" || role === "admin";
}

export function canCancelOwnVacationRequest(
  request: VacationRequest,
  currentEmployeeId: string | undefined
) {
  return (
    Boolean(currentEmployeeId) &&
    request.employeeId === currentEmployeeId &&
    request.status === "Ausstehend" &&
    request.approvalStepsCompleted === 0
  );
}

export function canEditOwnVacationRequest(
  request: VacationRequest,
  currentEmployeeId: string | undefined
) {
  return (
    Boolean(currentEmployeeId) &&
    request.employeeId === currentEmployeeId &&
    request.status === "Ausstehend" &&
    request.approvalStepsCompleted === 0
  );
}

export function canApproveVacationRequestWithNextApprover(
  request: VacationRequest,
  nextApproverId: string | undefined,
  currentEmployeeId: string | undefined,
  role: UserRole
) {
  if (request.status !== "Ausstehend") {
    return false;
  }

  if (role === "hr" || role === "admin") {
    return true;
  }

  return Boolean(currentEmployeeId) && nextApproverId === currentEmployeeId;
}

export function isApprovalOverride(
  nextApproverId: string | undefined,
  currentEmployeeId: string | undefined,
  role: UserRole
) {
  if (role !== "hr" && role !== "admin") {
    return false;
  }

  return !currentEmployeeId || nextApproverId !== currentEmployeeId;
}