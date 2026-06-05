import type { UserRole, VacationRequest } from "@/lib/types";

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