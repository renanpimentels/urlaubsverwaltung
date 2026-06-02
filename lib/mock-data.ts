import type {
  DashboardStat,
  Employee,
  UpcomingAbsence,
  VacationBalance,
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
    id: "req-001",
    employeeId: "emp-001",
    absenceType: "Urlaub",
    period: "03.06.2026 - 07.06.2026",
    days: 5,
    status: "Genehmigt",
    createdAt: "20.05.2026",
    comment: "Sommerurlaub",
  },
  {
    id: "req-002",
    employeeId: "emp-002",
    absenceType: "Urlaub",
    period: "15.07.2026 - 26.07.2026",
    days: 10,
    status: "Ausstehend",
    createdAt: "28.05.2026",
    comment: "Familienurlaub",
  },
  {
    id: "req-003",
    employeeId: "emp-003",
    absenceType: "Sonderurlaub",
    period: "12.08.2026 - 14.08.2026",
    days: 3,
    status: "Abgelehnt",
    createdAt: "30.05.2026",
    comment: "Privater Termin",
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

export const vacationBalances: VacationBalance[] = [
  {
    employeeId: "emp-001",
    total: 30,
    used: 12,
    pending: 0,
    available: 18,
  },
  {
    employeeId: "emp-002",
    total: 30,
    used: 8,
    pending: 10,
    available: 12,
  },
  {
    employeeId: "emp-003",
    total: 28,
    used: 14,
    pending: 0,
    available: 14,
  },
  {
    employeeId: "emp-004",
    total: 30,
    used: 20,
    pending: 0,
    available: 10,
  },
  {
    employeeId: "emp-005",
    total: 26,
    used: 26,
    pending: 0,
    available: 0,
  },
];