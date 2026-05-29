export type RequestStatus = "Genehmigt" | "Ausstehend" | "Abgelehnt";

export type VacationRequest = {
  title: string;
  employeeName: string;
  department: string;
  period: string;
  days: number;
  status: RequestStatus;
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
  department: string;
  role: string;
  vacationDaysTotal: number;
  vacationDaysUsed: number;
  vacationDaysRemaining: number;
  isActive: boolean;
};