export type RequestStatus = "Genehmigt" | "Ausstehend" | "Abgelehnt";

export type AbsenceType = "Urlaub" | "Sonderurlaub";

export type UserRole = "employee" | "manager" | "hr" | "admin";


export type CompanySettings = {
  defaultVacationDaysPerYear: number;
};

export type VacationRequest = {
  id: string;
  employeeId: string;
  absenceType: AbsenceType;
  period: string;
  days: number;
  status: RequestStatus;
  createdAt: string;
  comment?: string;
  approvalStepsCompleted: number;
  approvalStepsRequired: number;
};

export type VacationBalance = {
  id: string;
  employeeId: string;
  year: number;
  total: number;
  used: number;
  pending: number;
  available: number;
  carriedOver: number;
  expiresAt?: string;
};

export type UpcomingAbsence = {
  name: string;
  department: string;
  period: string;
};

export type DashboardStat = {
  title: string;
  value: string;
  description: string;
  variant?: "default" | "warning";
};

export type Employee = {
  id: string;
  name: string;
  departmentId: string;
  role: string;
  employmentStartDate: string;
  contractVacationDaysPerYear: number;
  isActive: boolean;
};

export type Department = {
  id: string;
  name: string;
  managerId: string;
  finalApproverId?: string;
};