import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";

import {
  dashboardStats,
  upcomingAbsences,
  vacationRequests,
} from "@/lib/mock-data";

import { getDepartmentById, getEmployeeById } from "@/lib/mock-queries";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Willkommen zurück"
        title="Hallo, Max Müller"
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
                Deine letzten Anträge und deren Status.
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
            {vacationRequests.map((request) => {
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
                      {request.period} · {request.days} Tage
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
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-xl font-bold">Nächste Abwesenheiten</h3>
            <p className="mt-1 text-sm text-slate-500">
              Wer demnächst nicht im Büro ist.
            </p>
          </div>

          <div className="grid gap-3">
            {upcomingAbsences.map((absence) => (
              <div
                key={absence.name}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <h4 className="font-semibold">{absence.name}</h4>
                <p className="mt-1 text-sm text-slate-500">
                  {absence.department} · {absence.period}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}