export type RequestStatus = "Genehmigt" | "Ausstehend" | "Abgelehnt";

export type VacationRequest = {
  title: string;
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