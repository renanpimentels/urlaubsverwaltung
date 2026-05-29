import type {
  DashboardStat,
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
    period: "03.06.2026 - 07.06.2026",
    days: 5,
    status: "Genehmigt",
  },
  {
    title: "Familienurlaub",
    period: "15.07.2026 - 26.07.2026",
    days: 10,
    status: "Ausstehend",
  },
  {
    title: "Kurzurlaub",
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