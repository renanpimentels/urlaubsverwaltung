import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { vacationRequests } from "@/lib/mock-data";

export default function VacationRequestsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Übersicht"
        title="Urlaubsanträge"
        description="Hier siehst du alle aktuellen Urlaubsanträge und deren Status."
        action={
          <button className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800">
            Neuen Antrag erstellen
          </button>
        }
      />

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

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {request.employeeName}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {request.department} · {request.period} · {request.days} Tage
                </p>
              </div>

              <StatusBadge status={request.status} />
            </article>
          ))}
        </div>
      </section>
    </>
  );
}