import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { currentUser } from "@/lib/current-user";
import { formatDateRange } from "@/lib/date-formatters";
import {
  getDepartmentById,
  getEmployeeById,
  getVacationBalanceByEmployeeId,
  getVisibleUpcomingAbsencesForUser,
  getVisibleVacationRequestsForUser,
} from "@/lib/mock-queries";

export default function DashboardPage() {
  const currentEmployee = getEmployeeById(currentUser.employeeId);
  const vacationBalance = getVacationBalanceByEmployeeId(
    currentUser.employeeId
  );

  const visibleVacationRequests = getVisibleVacationRequestsForUser(
    currentUser.employeeId,
    currentUser.role
  );

  const visibleUpcomingAbsences = getVisibleUpcomingAbsencesForUser(
    currentUser.employeeId,
    currentUser.role
  );

  const dashboardStats = [
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

  return (
    <>
      <PageHeader
        eyebrow="Willkommen zurück"
        title={`Hallo, ${currentEmployee?.name ?? "Benutzer"}`}
        description="Hier ist deine aktuelle Urlaubsübersicht."
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

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Aktuelle Urlaubsanträge</h3>
              <p className="mt-1 text-sm text-slate-500">
                Anträge, die du aktuell sehen darfst.
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
            {visibleVacationRequests.map((request) => {
              const employee = getEmployeeById(request.employeeId);
              const department = employee
                ? getDepartmentById(employee.departmentId)
                : undefined;

              return (
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
              );
            })}

            {visibleVacationRequests.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Keine Urlaubsanträge gefunden.
              </div>
            ) : null}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-xl font-bold">Nächste Abwesenheiten</h3>
            <p className="mt-1 text-sm text-slate-500">
              Genehmigte Abwesenheiten, die du sehen darfst.
            </p>
          </div>

          <div className="grid gap-3">
            {visibleUpcomingAbsences.map((request) => {
              const employee = getEmployeeById(request.employeeId);
              const department = employee
                ? getDepartmentById(employee.departmentId)
                : undefined;

              return (
                <div
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <h4 className="font-semibold">
                    {employee ? employee.name : "Unbekannter Mitarbeiter"}
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    {department ? department.name : "Keine Abteilung"} ·{" "}
                    {formatDateRange(request.startDate, request.endDate)}
                  </p>
                </div>
              );
            })}

            {visibleUpcomingAbsences.length === 0 ? (
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