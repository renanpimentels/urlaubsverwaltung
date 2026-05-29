import { StatusBadge } from "@/components/StatusBadge";
import { vacationRequests } from "@/lib/mock-data";

export default function VacationRequestsPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950 sm:px-10">
      <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-teal-700">
            Übersicht
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Urlaubsanträge
          </h1>
          <p className="mt-2 text-slate-600">
            Hier siehst du alle aktuellen Urlaubsanträge und deren Status.
          </p>
        </div>

        <button className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800">
          Neuen Antrag erstellen
        </button>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold">Aktuelle Anträge</h2>
          <p className="mt-1 text-sm text-slate-500">
            Mock-Daten für die erste Version der Anwendung.
          </p>
        </div>

        <div className="grid gap-3">
          {vacationRequests.map((request) => (
            <article
              key={request.title}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center"
            >
              <div>
                <h3 className="font-semibold">{request.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {request.period} · {request.days} Tage
                </p>
              </div>

              <StatusBadge status={request.status} />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}