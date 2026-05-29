import type {
  DashboardStat,
  Employee,
  UpcomingAbsence,
  VacationRequest,
} from "./types";


export const dashboardStats: DashboardStat[] = [
  {
    title: "Urlaubstage gesamt",
    value: "30",
    description: "Tage pro Jahr",
  },
  {
    title: "Genommen",
    value: "12",
    description: "bereits genehmigt",
  },
  {
    title: "Verfügbar",
    value: "18",
    description: "noch offen",
  },
  {
    title: "Ausstehend",
    value: "2",
    description: "Anträge in Prüfung",
    variant: "warning",
  },
];

export const vacationRequests: VacationRequest[] = [
  {
    title: "Sommerurlaub",
    employeeName: "Max Müller",
    department: "Entwicklung",
    period: "03.06.2026 - 07.06.2026",
    days: 5,
    status: "Genehmigt",
  },
  {
    title: "Familienurlaub",
    employeeName: "Anna Becker",
    department: "Entwicklung",
    period: "15.07.2026 - 26.07.2026",
    days: 10,
    status: "Ausstehend",
  },
  {
    title: "Kurzurlaub",
    employeeName: "Jonas Weber",
    department: "Support",
    period: "12.08.2026 - 14.08.2026",
    days: 3,
    status: "Abgelehnt",
  },
];

export const upcomingAbsences: UpcomingAbsence[] = [
  {
    name: "Anna Becker",
    department: "Entwicklung",
    period: "10.06.2026 - 14.06.2026",
  },
  {
    name: "Jonas Weber",
    department: "Support",
    period: "18.06.2026 - 21.06.2026",
  },
  {
    name: "Lisa Schneider",
    department: "Vertrieb",
    period: "01.07.2026 - 05.07.2026",
  },
];

export const employees: Employee[] = [
  {
    id: "emp-001",
    name: "Max Müller",
    department: "Entwicklung",
    role: "Frontend Entwickler",
    vacationDaysTotal: 30,
    vacationDaysUsed: 12,
    vacationDaysRemaining: 18,
    isActive: true,
  },
  {
    id: "emp-002",
    name: "Anna Becker",
    department: "Entwicklung",
    role: "Backend Entwicklerin",
    vacationDaysTotal: 30,
    vacationDaysUsed: 8,
    vacationDaysRemaining: 22,
    isActive: true,
  },
  {
    id: "emp-003",
    name: "Jonas Weber",
    department: "Support",
    role: "IT Support Specialist",
    vacationDaysTotal: 28,
    vacationDaysUsed: 14,
    vacationDaysRemaining: 14,
    isActive: true,
  },
  {
    id: "emp-004",
    name: "Lisa Schneider",
    department: "Vertrieb",
    role: "Account Managerin",
    vacationDaysTotal: 30,
    vacationDaysUsed: 20,
    vacationDaysRemaining: 10,
    isActive: true,
  },
  {
    id: "emp-005",
    name: "Thomas Wagner",
    department: "Administration",
    role: "Office Manager",
    vacationDaysTotal: 26,
    vacationDaysUsed: 26,
    vacationDaysRemaining: 0,
    isActive: false,
  },
];