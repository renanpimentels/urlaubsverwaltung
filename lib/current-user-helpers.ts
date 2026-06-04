import { currentUser } from "@/lib/current-user";
import { getEmployeeById } from "@/lib/mock-queries";

export function getCurrentUserEmployeeId() {
  return currentUser.employeeId;
}

export function getCurrentUserEmployee() {
  if (!currentUser.employeeId) {
    return undefined;
  }

  return getEmployeeById(currentUser.employeeId);
}

export function hasCurrentUserEmployee() {
  return Boolean(currentUser.employeeId);
}