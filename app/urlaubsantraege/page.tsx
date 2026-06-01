import { PageHeader } from "@/components/PageHeader";
import { VacationRequestCard } from "@/components/VacationRequestCard";
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
            <VacationRequestCard key={request.title} request={request} />
          ))}
        </div>
      </section>
    </>
  );
}