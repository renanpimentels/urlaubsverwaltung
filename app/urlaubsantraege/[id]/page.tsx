import Link from "next/link";
import { notFound } from "next/navigation";


import { VacationBalanceCard} from "@/components/VacationBalanceCard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { getVacationBalanceByEmployeeId, getVacationRequestById } from "@/lib/mock-queries";



type VacationRequestDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VacationRequestDetailPage({
  params,
}: VacationRequestDetailPageProps) {
  const { id } = await params;

  const request = getVacationRequestById(id);

  if (!request) {
    notFound();
  }

  const vacationBalance = getVacationBalanceByEmployeeId(request.employeeId);

  return (
    <>
      <PageHeader
        eyebrow="Antragsdetails"
        title={request.absenceType}
        description="Detailansicht eines Urlaubsantrags mit Status, Zeitraum und Mitarbeiterinformationen."
        action={<StatusBadge status={request.status} />}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Antrag</h2>

          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Mitarbeiter
              </p>
              <p className="mt-1 font-medium">{request.employeeName}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Abteilung</p>
              <p className="mt-1 font-medium">{request.department}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Zeitraum
                </p>
                <p className="mt-1 font-medium">{request.period}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Anzahl Tage
                </p>
                <p className="mt-1 font-medium">{request.days} Tage</p>
              </div>
            </div>

            {request.comment ? (
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Bemerkung
                </p>
                <p className="mt-1 font-medium">{request.comment}</p>
              </div>
            ) : null}

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Status</p>
              <div className="mt-2">
                <StatusBadge status={request.status} />
              </div>
            </div>
          </div>
        </article>

        <aside className="grid gap-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Aktionen</h2>

            <div className="mt-5 grid gap-3">
              {request.status === "Ausstehend" ? (
                <>
                  <button className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800">
                    Genehmigen
                  </button>

                  <button className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100">
                    Ablehnen
                  </button>
                </>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  Für diesen Antrag sind aktuell keine Aktionen verfügbar.
                </div>
              )}

              <Link
                href="/urlaubsantraege"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
              >
                Zurück zur Übersicht
              </Link>
            </div>
          </section>

          {vacationBalance ? (
              <VacationBalanceCard
                total={vacationBalance.total}
                used={vacationBalance.used}
                pending={vacationBalance.pending}
                available={vacationBalance.available}
                requestedDays={request.days}
                title="Urlaubssaldo"
                description="Mockup-Übersicht zur Bewertung dieses Antrags."
              />
            ) : null}
      
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Administrative Informationen</h2>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Antrag-ID
                </p>
                <p className="mt-1 font-medium">{request.id}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Erstellt am
                </p>
                <p className="mt-1 font-medium">{request.createdAt}</p>
              </div>
            </div>
          </section>

        </aside>
      </section>
    </>
  );
}