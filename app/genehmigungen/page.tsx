import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
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
          <article
            key={request.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <div className="mb-3">
                  <StatusBadge status={request.status} />
                </div>

                <h2 className="text-xl font-bold">{request.title}</h2>

                <p className="mt-2 font-medium text-slate-700">
                  {request.employeeName}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {request.department}
                </p>

                <p className="mt-3 text-slate-600">
                  {request.period} · {request.days} Tage
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Antrag wartet auf Entscheidung.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800">
                  Genehmigen
                </button>

                <button className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100">
                  Ablehnen
                </button>
              </div>
            </div>
          </article>
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