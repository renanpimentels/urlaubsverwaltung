import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { getActiveCurrentUserFromDb } from "@/lib/current-user-server";
import { formatDateRange } from "@/lib/date-formatters";
import {
  getDepartmentByIdFromDb,
  getEmployeeByIdFromDb,
  getVacationBalanceByEmployeeIdFromDb,
  getVisibleApprovalRequestsForUserFromDb,
  getVisibleEmployeesForUserFromDb,
  getVisibleUpcomingAbsencesForUserFromDb,
  getVisibleVacationRequestsForUserFromDb,
} from "@/lib/prisma-queries";

function getDashboardCopy(role: string) {
  if (role === "employee") {
    return {
      eyebrow: "Mein Urlaub",
      titlePrefix: "Hallo",
      description:
        "Hier siehst du deinen persönlichen Urlaubssaldo und deine aktuellen Anträge.",
    };
  }

  if (role === "manager") {
    return {
      eyebrow: "Teamübersicht",
      titlePrefix: "Hallo",
      description:
        "Hier siehst du offene Freigaben, sichtbare Anträge und kommende Abwesenheiten deiner Verantwortungsbereiche.",
    };
  }

  if (role === "hr") {
    return {
      eyebrow: "HR Übersicht",
      titlePrefix: "Hallo",
      description:
        "Hier siehst du eine Übersicht über Mitarbeiter, offene Freigaben und kommende Abwesenheiten.",
    };
  }

  return {
    eyebrow: "Administration",
    titlePrefix: "Hallo",
    description:
      "Hier siehst du eine administrative Gesamtübersicht über Urlaub, Mitarbeiter und Freigaben.",
  };
}

function getRequestStatusCount(
  requests: Awaited<ReturnType<typeof getVisibleVacationRequestsForUserFromDb>>,
  status: "Ausstehend" | "Genehmigt" | "Abgelehnt" | "Storniert"
) {
  return requests.filter((request) => request.status === status).length;
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-5 text-sm text-slate-500">
      {children}
    </div>
  );
}

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-sm shadow-slate-200/70 backdrop-blur sm:p-5 lg:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
            {title}
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {children}
    </article>
  );
}

function DashboardLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center justify-center rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 transition hover:border-teal-300 hover:bg-teal-100"
    >
      {children}
    </Link>
  );
}

export default async function DashboardPage() {
  const currentUser = await getActiveCurrentUserFromDb();
  const currentEmployeeId = currentUser.employeeId;

  if (!currentEmployeeId) {
    notFound();
  }

  const currentEmployee = await getEmployeeByIdFromDb(currentEmployeeId);
  const vacationBalance = await getVacationBalanceByEmployeeIdFromDb(
    currentEmployeeId
  );

  const visibleVacationRequests = await getVisibleVacationRequestsForUserFromDb(
    currentEmployeeId,
    currentUser.role
  );

  const visibleUpcomingAbsences = await getVisibleUpcomingAbsencesForUserFromDb(
    currentEmployeeId,
    currentUser.role
  );

  const visibleApprovalRequests = await getVisibleApprovalRequestsForUserFromDb(
    currentEmployeeId,
    currentUser.role
  );

  const visibleEmployees = await getVisibleEmployeesForUserFromDb(
    currentEmployeeId,
    currentUser.role
  );

  const pendingRequestsCount = getRequestStatusCount(
    visibleVacationRequests,
    "Ausstehend"
  );

  const approvedRequestsCount = getRequestStatusCount(
    visibleVacationRequests,
    "Genehmigt"
  );

  const dashboardCopy = getDashboardCopy(currentUser.role);

  const employeeStats = [
    {
      title: "Urlaubstage gesamt",
      value: String(vacationBalance?.total ?? 0),
      description: "vertraglicher Jahresanspruch",
    },
    {
      title: "Genommen",
      value: String(vacationBalance?.used ?? 0),
      description: "bereits genehmigt",
    },
    {
      title: "Verfügbar",
      value: String(vacationBalance?.available ?? 0),
      description: "noch offen",
    },
    {
      title: "Ausstehend",
      value: String(vacationBalance?.pending ?? 0),
      description: "Anträge in Prüfung",
      variant: "warning" as const,
    },
  ];

  const managerStats = [
    {
      title: "Offene Freigaben",
      value: String(visibleApprovalRequests.length),
      description: "Anträge, die du prüfen kannst",
      variant: "warning" as const,
    },
    {
      title: "Sichtbare Anträge",
      value: String(visibleVacationRequests.length),
      description: "in deinen Verantwortungsbereichen",
    },
    {
      title: "Kommende Abwesenheiten",
      value: String(visibleUpcomingAbsences.length),
      description: "genehmigte Abwesenheiten",
    },
    {
      title: "Mein verfügbarer Urlaub",
      value: String(vacationBalance?.available ?? 0),
      description: "persönlicher Resturlaub",
    },
  ];

  const hrAdminStats = [
    {
      title: "Mitarbeiter sichtbar",
      value: String(visibleEmployees.length),
      description: "gemäß deiner Berechtigung",
    },
    {
      title: "Offene Freigaben",
      value: String(visibleApprovalRequests.length),
      description: "unternehmensweit sichtbar",
      variant: "warning" as const,
    },
    {
      title: "Ausstehende Anträge",
      value: String(pendingRequestsCount),
      description: "noch nicht abgeschlossen",
    },
    {
      title: "Genehmigte Anträge",
      value: String(approvedRequestsCount),
      description: "im sichtbaren Bereich",
    },
  ];

  const dashboardStats =
    currentUser.role === "employee"
      ? employeeStats
      : currentUser.role === "manager"
        ? managerStats
        : hrAdminStats;

  const recentVacationRequests = visibleVacationRequests.slice(0, 6);
  const upcomingAbsences = visibleUpcomingAbsences.slice(0, 6);
  const approvalRequests = visibleApprovalRequests.slice(0, 5);

  const vacationRequestsWithEmployees = await Promise.all(
    recentVacationRequests.map(async (request) => {
      const employee = await getEmployeeByIdFromDb(request.employeeId);
      const department = employee?.departmentId
        ? await getDepartmentByIdFromDb(employee.departmentId)
        : undefined;

      return {
        request,
        employee,
        department,
      };
    })
  );

  const upcomingAbsencesWithEmployees = await Promise.all(
    upcomingAbsences.map(async (request) => {
      const employee = await getEmployeeByIdFromDb(request.employeeId);
      const department = employee?.departmentId
        ? await getDepartmentByIdFromDb(employee.departmentId)
        : undefined;

      return {
        request,
        employee,
        department,
      };
    })
  );

  const approvalRequestsWithEmployees = await Promise.all(
    approvalRequests.map(async (request) => {
      const employee = await getEmployeeByIdFromDb(request.employeeId);
      const department = employee?.departmentId
        ? await getDepartmentByIdFromDb(employee.departmentId)
        : undefined;

      return {
        request,
        employee,
        department,
      };
    })
  );

  return (
    <div className="grid gap-6 lg:gap-8">
      <PageHeader
        eyebrow={dashboardCopy.eyebrow}
        title={`${dashboardCopy.titlePrefix}, ${
          currentEmployee?.name ?? "Benutzer"
        }`}
        description={dashboardCopy.description}
        action={
          <Link
            href="/urlaubsantraege/neu"
            className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
          >
            Neuen Antrag erstellen
          </Link>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:gap-4 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            variant={stat.variant}
          />
        ))}
      </section>

      {currentUser.role !== "employee" ? (
        <SectionCard
          title="Offene Freigaben"
          description="Anträge, die du aktuell prüfen kannst."
          action={
            <DashboardLink href="/genehmigungen">
              Alle Freigaben anzeigen
            </DashboardLink>
          }
        >
          <div className="grid gap-3">
            {approvalRequestsWithEmployees.map(
              ({ request, employee, department }) => (
                <Link
                  key={request.id}
                  href={`/urlaubsantraege/${request.id}`}
                  className="group block rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-teal-200 hover:bg-teal-50/60"
                >
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-950">
                          {request.absenceType}
                        </h4>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                          {request.days} Tage
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {employee ? employee.name : "Unbekannter Mitarbeiter"}
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {department ? department.name : "Keine Abteilung"} ·{" "}
                        {formatDateRange(request.startDate, request.endDate)}
                      </p>
                    </div>

                    <div className="sm:justify-self-end">
                      <StatusBadge
                        status={request.status}
                        approvalStepsCompleted={
                          request.approvalStepsCompleted
                        }
                        approvalStepsRequired={request.approvalStepsRequired}
                      />
                    </div>
                  </div>
                </Link>
              )
            )}

            {approvalRequestsWithEmployees.length === 0 ? (
              <EmptyState>
                Aktuell gibt es keine offenen Freigaben für dich.
              </EmptyState>
            ) : null}
          </div>
        </SectionCard>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
        <SectionCard
          title={
            currentUser.role === "employee"
              ? "Meine Urlaubsanträge"
              : "Aktuelle Urlaubsanträge"
          }
          description={
            currentUser.role === "employee"
              ? "Deine zuletzt erstellten Anträge."
              : "Aktuelle Anträge, die du gemäß deiner Rolle sehen darfst."
          }
          action={<DashboardLink href="/urlaubsantraege">Alle anzeigen</DashboardLink>}
        >
          <div className="grid gap-3">
            {vacationRequestsWithEmployees.map(
              ({ request, employee, department }) => (
                <Link
                  key={request.id}
                  href={`/urlaubsantraege/${request.id}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-teal-200 hover:bg-teal-50/60"
                >
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-950">
                          {request.absenceType}
                        </h4>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                          {request.days} Tage
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {employee ? employee.name : "Unbekannter Mitarbeiter"}
                      </p>

                      {request.comment ? (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {request.comment}
                        </p>
                      ) : null}

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {department ? department.name : "Keine Abteilung"} ·{" "}
                        {formatDateRange(request.startDate, request.endDate)}
                      </p>
                    </div>

                    <div className="sm:justify-self-end">
                      <StatusBadge
                        status={request.status}
                        approvalStepsCompleted={
                          request.approvalStepsCompleted
                        }
                        approvalStepsRequired={request.approvalStepsRequired}
                      />
                    </div>
                  </div>
                </Link>
              )
            )}

            {vacationRequestsWithEmployees.length === 0 ? (
              <EmptyState>Keine Urlaubsanträge gefunden.</EmptyState>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title={
            currentUser.role === "employee"
              ? "Meine nächsten Abwesenheiten"
              : "Nächste Abwesenheiten"
          }
          description="Genehmigte Abwesenheiten, die du sehen darfst."
        >
          <div className="grid gap-3">
            {upcomingAbsencesWithEmployees.map(
              ({ request, employee, department }) => (
                <Link
                  key={request.id}
                  href={`/urlaubsantraege/${request.id}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-teal-200 hover:bg-teal-50/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate font-bold text-slate-950">
                        {employee ? employee.name : "Unbekannter Mitarbeiter"}
                      </h4>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {department ? department.name : "Keine Abteilung"}
                      </p>

                      <p className="mt-2 text-sm font-semibold text-teal-800">
                        {formatDateRange(request.startDate, request.endDate)}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                      {request.days} Tage
                    </span>
                  </div>
                </Link>
              )
            )}

            {upcomingAbsencesWithEmployees.length === 0 ? (
              <EmptyState>Keine kommenden Abwesenheiten gefunden.</EmptyState>
            ) : null}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}