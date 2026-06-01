import { PageHeader } from "@/components/PageHeader";
import { VacationRequestCard } from "@/components/VacationRequestCard";
import { vacationRequests } from "@/lib/mock-data";

const pendingRequests = vacationRequests.filter(
  (request) => request.status === "Ausstehend"
);

export default function ApprovalsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Manager-Bereich"
        title="Genehmigungen"
        description="Prüfe offene Urlaubsanträge und entscheide über Genehmigung oder Ablehnung."
        action={
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800">
            {pendingRequests.length} offene Anträge
          </div>
        }
      />

      <section className="grid gap-4">
        {pendingRequests.map((request) => (
          <VacationRequestCard
            key={request.title}
            request={request}
            actions={
              <>
                <button className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800">
                  Genehmigen
                </button>

                <button className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100">
                  Ablehnen
                </button>
              </>
            }
          />
        ))}

        {pendingRequests.length === 0 && (
          <article className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">Keine offenen Anträge</h2>
            <p className="mt-2 text-slate-600">
              Aktuell gibt es keine Urlaubsanträge, die geprüft werden müssen.
            </p>
          </article>
        )}
      </section>
    </>
  );
}