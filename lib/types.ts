export type UserRole = "employee" | "manager" | "hr" | "admin";

export type User = {
  id: string;
  employeeId?: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export type CompanySettings = {
  defaultVacationDaysPerYear: number;
};

export type RequestStatus =
  | "Genehmigt"
  | "Ausstehend"
  | "Abgelehnt"
  | "Storniert";

export type AbsenceType = "Urlaub" | "Sonderurlaub";

export type ApprovalDecisionType = "approved" | "rejected";

export type Department = {
  id: string;
  name: string;
  managerId: string;
  finalApproverId?: string;
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

export type VacationRequest = {
  id: string;
  employeeId: string;
  absenceType: AbsenceType;
  startDate: string;
  endDate: string;
  days: number;
  status: RequestStatus;
  createdAt: string;
  approvalStepsCompleted: number;
  approvalStepsRequired: number;
  comment?: string;
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

export type ApprovalDecision = {
  id: string;
  vacationRequestId: string;
  approverEmployeeId: string;
  stepOrder: number;
  decision: ApprovalDecisionType;
  decidedAt: string;
  comment?: string;
};

export type ApprovalDecisionWithApprover = {
  id: string;
  vacationRequestId: string;
  approverEmployeeId: string;
  stepOrder: number;
  decision: "approved" | "rejected";
  decidedAt: string;
  decidedAtDateTime?: string;
  comment?: string;
  approverName: string;
  expectedApproverEmployeeId?: string;
  expectedApproverName?: string;
  decidedByUserId?: string;
  decidedByUserEmail?: string;
  decidedByEmployeeId?: string;
  decidedByEmployeeName?: string;
  isOverride?: boolean;
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