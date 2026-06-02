export type RequestStatus = "Genehmigt" | "Ausstehend" | "Abgelehnt";

export type AbsenceType = "Urlaub" | "Sonderurlaub";

export type VacationRequest = {
  id: string;
  absenceType: AbsenceType;
  employeeName: string;
  department: string;
  period: string;
  days: number;
  status: RequestStatus;
  createdAt: string;
  comment?: string;
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