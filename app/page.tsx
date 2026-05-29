import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";

import {
  dashboardStats,
  upcomingAbsences,
  vacationRequests,
} from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <>
      <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-teal-700">
            Willkommen zurück
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Hallo, Max Müller
          </h2>
          <p className="mt-2 text-slate-600">
            Hier ist deine aktuelle Urlaubsübersicht.
          </p>
        </div>

        <button className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800">
          Neuen Antrag erstellen
        </button>
      </header>

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

            <a
              className="text-sm font-semibold text-teal-700"
              href="/urlaubsantraege"
            >
              Alle anzeigen
            </a>
          </div>

          <div className="grid gap-3">
            {vacationRequests.map((request) => (
              <div
                key={request.title}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <h4 className="font-semibold">{request.title}</h4>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {request.employeeName}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {request.department} · {request.period} · {request.days}{" "}
                    Tage
                  </p>
                </div>

                <StatusBadge status={request.status} />
              </div>
            ))}
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