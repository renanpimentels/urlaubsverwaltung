import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { getCurrentUserFromDb } from "@/lib/current-user-server";
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

export default async function DashboardPage() {
  const currentUser = await getCurrentUserFromDb();
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
    <>
      <PageHeader
        eyebrow={dashboardCopy.eyebrow}
        title={`${dashboardCopy.titlePrefix}, ${
          currentEmployee?.name ?? "Benutzer"
        }`}
        description={dashboardCopy.description}
        action={
          <Link
            href="/urlaubsantraege/neu"
            className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            Neuen Antrag erstellen
          </Link>
        }
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h3 className="text-xl font-bold">Offene Freigaben</h3>
              <p className="mt-1 text-sm text-slate-500">
                Anträge, die du aktuell prüfen kannst.
              </p>
            </div>

            <Link
              className="text-sm font-semibold text-teal-700"
              href="/genehmigungen"
            >
              Alle Freigaben anzeigen
            </Link>
          </div>

          <div className="grid gap-3">
            {approvalRequestsWithEmployees.map(
              ({ request, employee, department }) => (
                <Link
                  key={request.id}
                  href={`/urlaubsantraege/${request.id}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h4 className="font-semibold">{request.absenceType}</h4>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {employee ? employee.name : "Unbekannter Mitarbeiter"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {department ? department.name : "Keine Abteilung"} ·{" "}
                        {formatDateRange(request.startDate, request.endDate)} ·{" "}
                        {request.days} Tage
                      </p>
                    </div>

                    <StatusBadge
                      status={request.status}
                      approvalStepsCompleted={request.approvalStepsCompleted}
                      approvalStepsRequired={request.approvalStepsRequired}
                    />
                  </div>
                </Link>
              )
            )}

            {approvalRequestsWithEmployees.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Aktuell gibt es keine offenen Freigaben für dich.
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">
                {currentUser.role === "employee"
                  ? "Meine Urlaubsanträge"
                  : "Aktuelle Urlaubsanträge"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {currentUser.role === "employee"
                  ? "Deine zuletzt erstellten Anträge."
                  : "Aktuelle Anträge, die du gemäß deiner Rolle sehen darfst."}
              </p>
            </div>

            <Link
              className="text-sm font-semibold text-teal-700"
              href="/urlaubsantraege"
            >
              Alle anzeigen
            </Link>
          </div>

          <div className="grid gap-3">
            {vacationRequestsWithEmployees.map(
              ({ request, employee, department }) => (
                <div
                  key={request.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <h4 className="font-semibold">{request.absenceType}</h4>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {employee ? employee.name : "Unbekannter Mitarbeiter"}
                    </p>

                    {request.comment ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {request.comment}
                      </p>
                    ) : null}

                    <p className="mt-1 text-sm text-slate-500">
                      {department ? department.name : "Keine Abteilung"} ·{" "}
                      {formatDateRange(request.startDate, request.endDate)} ·{" "}
                      {request.days} Tage
                    </p>
                  </div>

                  <StatusBadge
                    status={request.status}
                    approvalStepsCompleted={request.approvalStepsCompleted}
                    approvalStepsRequired={request.approvalStepsRequired}
                  />
                </div>
              )
            )}

            {vacationRequestsWithEmployees.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Keine Urlaubsanträge gefunden.
              </div>
            ) : null}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-xl font-bold">
              {currentUser.role === "employee"
                ? "Meine nächsten Abwesenheiten"
                : "Nächste Abwesenheiten"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Genehmigte Abwesenheiten, die du sehen darfst.
            </p>
          </div>

          <div className="grid gap-3">
            {upcomingAbsencesWithEmployees.map(
              ({ request, employee, department }) => (
                <Link
                  key={request.id}
                  href={`/urlaubsantraege/${request.id}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100"
                >
                  <h4 className="font-semibold">
                    {employee ? employee.name : "Unbekannter Mitarbeiter"}
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    {department ? department.name : "Keine Abteilung"} ·{" "}
                    {formatDateRange(request.startDate, request.endDate)}
                  </p>
                </Link>
              )
            )}

            {upcomingAbsencesWithEmployees.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Keine kommenden Abwesenheiten gefunden.
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </>
  );
}