import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { VacationBalanceCard } from "@/components/VacationBalanceCard";
import { formatDate, formatDateRange } from "@/lib/date-formatters";
import {
  getApprovalDecisionsByRequestId,
  getDepartmentById,
  getEmployeeById,
  getVacationBalanceByEmployeeId,
  getVacationRequestById,
} from "@/lib/mock-queries";

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

  const employee = getEmployeeById(request.employeeId);
  const department = employee
    ? getDepartmentById(employee.departmentId)
    : undefined;

  const vacationBalance = getVacationBalanceByEmployeeId(request.employeeId);
  const approvalDecisions = getApprovalDecisionsByRequestId(request.id);

  return (
    <>
      <PageHeader
        eyebrow="Antragsdetails"
        title={request.absenceType}
        description="Detailansicht eines Urlaubsantrags."
        action={
          <Link
            href="/urlaubsantraege"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Zurück zur Übersicht
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-xl font-bold">Antrag</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Übersicht über Zeitraum, Mitarbeiter und Status.
                </p>
              </div>

              <StatusBadge
                status={request.status}
                approvalStepsCompleted={request.approvalStepsCompleted}
                approvalStepsRequired={request.approvalStepsRequired}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Mitarbeiter
                </p>
                <p className="mt-1 font-medium">
                  {employee ? employee.name : "Unbekannter Mitarbeiter"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Abteilung
                </p>
                <p className="mt-1 font-medium">
                  {department ? department.name : "Keine Abteilung"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Abwesenheitsart
                </p>
                <p className="mt-1 font-medium">{request.absenceType}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Zeitraum
                </p>
                <p className="mt-1 font-medium">
                  {formatDateRange(request.startDate, request.endDate)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Tage</p>
                <p className="mt-1 font-medium">{request.days} Tage</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Erstellt am
                </p>
                <p className="mt-1 font-medium">
                  {formatDate(request.createdAt)}
                </p>
              </div>

              {request.comment ? (
                <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                  <p className="text-sm font-semibold text-slate-500">
                    Bemerkung
                  </p>
                  <p className="mt-1 font-medium">{request.comment}</p>
                </div>
              ) : null}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Freigabehistorie</h2>
              <p className="mt-1 text-sm text-slate-500">
                Dokumentierte Entscheidungen zu diesem Antrag.
              </p>
            </div>

            <div className="grid gap-3">
              {approvalDecisions.map((decision) => {
                const approver = getEmployeeById(decision.approverEmployeeId);

                return (
                  <div
                    key={decision.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div>
                        <p className="font-semibold">
                          Schritt {decision.stepOrder}:{" "}
                          {decision.decision === "approved"
                            ? "Genehmigt"
                            : "Abgelehnt"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {approver
                            ? approver.name
                            : "Unbekannter Genehmiger"}{" "}
                          · {formatDate(decision.decidedAt)}
                        </p>
                      </div>
                    </div>

                    {decision.comment ? (
                      <p className="mt-3 text-sm text-slate-600">
                        {decision.comment}
                      </p>
                    ) : null}
                  </div>
                );
              })}

              {approvalDecisions.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Für diesen Antrag wurde noch keine Entscheidung dokumentiert.
                </div>
              ) : null}
            </div>
          </article>
        </div>

        <aside className="grid gap-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Aktionen</h2>
            <p className="mt-1 text-sm text-slate-500">
              Aktionen sind aktuell nur als Mockup vorbereitet.
            </p>

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
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Für diesen Antrag sind keine offenen Aktionen verfügbar.
                </div>
              )}
            </div>
          </article>

          {vacationBalance ? (
            <VacationBalanceCard
              total={vacationBalance.total}
              used={vacationBalance.used}
              pending={vacationBalance.pending}
              available={vacationBalance.available}
              requestedDays={
                request.absenceType === "Urlaub" ? request.days : undefined
              }
              title={`Urlaubssaldo ${vacationBalance.year}`}
              description="Mockup-Übersicht zur Bewertung dieses Antrags."
            />
          ) : null}

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Administrative Informationen</h2>

            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                <span className="text-slate-500">Antrags-ID</span>
                <span className="font-medium text-slate-800">
                  {request.id}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                <span className="text-slate-500">Mitarbeiter-ID</span>
                <span className="font-medium text-slate-800">
                  {request.employeeId}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                <span className="text-slate-500">Freigabe</span>
                <span className="font-medium text-slate-800">
                  {request.approvalStepsCompleted}/
                  {request.approvalStepsRequired}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Status</span>
                <span className="font-medium text-slate-800">
                  {request.status}
                </span>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </>
  );
}