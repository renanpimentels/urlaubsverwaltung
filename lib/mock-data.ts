import type {
  DashboardStat,
  Employee,
  UpcomingAbsence,
  VacationBalance,
  VacationRequest,
  Department
} from "./types";


export const departments: Department[] = [
  {
    id: "dep-001",
    name: "Entwicklung",
    managerId: "emp-001",
    finalApproverId: "emp-002",
  },
  {
    id: "dep-002",
    name: "Support",
    managerId: "emp-002",
    finalApproverId: "emp-001",
  },
  {
    id: "dep-003",
    name: "Administration",
    managerId: "emp-002",
    finalApproverId: "emp-001",
  },
];

export const employees: Employee[] = [
  {
    id: "emp-001",
    name: "Max Müller",
    departmentId: "dep-001",
    role: "Frontend Entwickler",
    employmentStartDate: "2024-03-01",
    contractVacationDaysPerYear: 30,
    isActive: true,
  },
  {
    id: "emp-002",
    name: "Anna Becker",
    departmentId: "dep-001",
    role: "Backend Entwicklerin",
    employmentStartDate: "2026-07-01",
    contractVacationDaysPerYear: 30,
    isActive: true,
  },
  {
    id: "emp-003",
    name: "Jonas Weber",
    departmentId: "dep-002",
    role: "Support Specialist",
    employmentStartDate: "2023-09-15",
    contractVacationDaysPerYear: 28,
    isActive: true,
  },
  {
    id: "emp-004",
    name: "Lisa Schneider",
    departmentId: "dep-003",
    role: "HR Managerin",
    employmentStartDate: "2022-01-01",
    contractVacationDaysPerYear: 30,
    isActive: true,
  },
  {
    id: "emp-005",
    name: "Tom Wagner",
    departmentId: "dep-002",
    role: "Werkstudent",
    employmentStartDate: "2026-04-01",
    contractVacationDaysPerYear: 26,
    isActive: false,
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
    approvalStepsCompleted: 2,
    approvalStepsRequired: 2,
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
    approvalStepsCompleted: 0,
    approvalStepsRequired: 2,
    comment: "Familienurlaub",
  },
  {
    id: "req-003",
    employeeId: "emp-003",
    absenceType: "Sonderurlaub",
    period: "12.08.2026 - 14.08.2026",
    days: 3,
    status: "Ausstehend",
    createdAt: "30.05.2026",
    approvalStepsCompleted: 0,
    approvalStepsRequired: 2,
    comment: "Privater Termin",
  },
];

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



export const vacationBalances: VacationBalance[] = [
  {
    id: "balance-2026-emp-001",
    employeeId: "emp-001",
    year: 2026,
    total: 30,
    used: 12,
    pending: 0,
    available: 18,
    carriedOver: 0,
  },
  {
    id: "balance-2026-emp-002",
    employeeId: "emp-002",
    year: 2026,
    total: 15,
    used: 8,
    pending: 10,
    available: 7,
    carriedOver: 0,
  },
  {
    id: "balance-2026-emp-003",
    employeeId: "emp-003",
    year: 2026,
    total: 28,
    used: 14,
    pending: 0,
    available: 14,
    carriedOver: 0,
  },
  {
    id: "balance-2026-emp-004",
    employeeId: "emp-004",
    year: 2026,
    total: 30,
    used: 20,
    pending: 0,
    available: 10,
    carriedOver: 0,
  },
  {
    id: "balance-2026-emp-005",
    employeeId: "emp-005",
    year: 2026,
    total: 20,
    used: 20,
    pending: 0,
    available: 0,
    carriedOver: 0,
  },
  {
    id: "balance-2025-emp-001",
    employeeId: "emp-001",
    year: 2025,
    total: 30,
    used: 27,
    pending: 0,
    available: 0,
    carriedOver: 3,
    expiresAt: "2026-03-31",
  },
];