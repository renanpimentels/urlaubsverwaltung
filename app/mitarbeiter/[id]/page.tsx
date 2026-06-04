import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { VacationBalanceCard } from "@/components/VacationBalanceCard";
import { currentUser } from "@/lib/current-user";
import { formatDate, formatDateRange } from "@/lib/date-formatters";
import { canUserViewEmployee } from "@/lib/mock-queries";
import {
  getDepartmentByIdFromDb,
  getEmployeeByIdFromDb,
  getVacationBalanceByEmployeeIdFromDb,
  getVacationBalancesByEmployeeIdFromDb,
  getVacationRequestsByEmployeeIdFromDb,
} from "@/lib/prisma-queries";

type EmployeeDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  const { id } = await params;

  const employee = await getEmployeeByIdFromDb(id);

  if (!employee) {
    notFound();
  }

  const canViewEmployee = canUserViewEmployee(
    currentUser.employeeId,
    currentUser.role,
    employee.id
  );

  if (!canViewEmployee) {
    notFound();
  }

  const department = employee.departmentId
    ? await getDepartmentByIdFromDb(employee.departmentId)
    : undefined;

  const currentBalance = await getVacationBalanceByEmployeeIdFromDb(employee.id);
  const allBalances = await getVacationBalancesByEmployeeIdFromDb(employee.id);
  const employeeRequests = await getVacationRequestsByEmployeeIdFromDb(
    employee.id
  );

  const carriedOverBalances = allBalances.filter(
    (balance) => balance.carriedOver > 0
  );

  return (
    <>
      <PageHeader
        eyebrow="Mitarbeiterprofil"
        title={employee.name}
        description="Übersicht über Stammdaten, Urlaubssaldo und Anträge dieses Mitarbeiters."
        action={
          <Link
            href="/mitarbeiter"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Zurück
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Stammdaten</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
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
                  Position
                </p>
                <p className="mt-1 font-medium">{employee.role}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Eintrittsdatum
                </p>
                <p className="mt-1 font-medium">
                  {formatDate(employee.employmentStartDate)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Vertraglicher Jahresurlaub
                </p>
                <p className="mt-1 font-medium">
                  {employee.contractVacationDaysPerYear} Tage
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Status</p>
                <p className="mt-1 font-medium">
                  {employee.isActive ? "Aktiv" : "Inaktiv"}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Urlaubsanträge</h2>
              <p className="mt-1 text-sm text-slate-500">
                Anträge dieses Mitarbeiters.
              </p>
            </div>

            <div className="grid gap-3">
              {employeeRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="font-semibold">{request.absenceType}</h3>

                    {request.comment ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {request.comment}
                      </p>
                    ) : null}

                    <p className="mt-1 text-sm text-slate-500">
                      {formatDateRange(request.startDate, request.endDate)} ·{" "}
                      {request.days} Tage
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <StatusBadge
                      status={request.status}
                      approvalStepsCompleted={request.approvalStepsCompleted}
                      approvalStepsRequired={request.approvalStepsRequired}
                    />

                    <Link
                      href={`/urlaubsantraege/${request.id}`}
                      className="text-sm font-semibold text-teal-700 hover:text-teal-800"
                    >
                      Antrag öffnen
                    </Link>
                  </div>
                </div>
              ))}

              {employeeRequests.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Keine Anträge für diesen Mitarbeiter gefunden.
                </div>
              ) : null}
            </div>
          </article>
        </div>

        <aside className="grid gap-6">
          {currentBalance ? (
            <VacationBalanceCard
              total={currentBalance.total}
              used={currentBalance.used}
              pending={currentBalance.pending}
              available={currentBalance.available}
              title={`Urlaubssaldo ${currentBalance.year}`}
              description="Aktueller Urlaubssaldo dieses Mitarbeiters."
            />
          ) : null}

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Resturlaub</h2>
            <p className="mt-1 text-sm text-slate-500">
              Übertragene Urlaubstage aus Vorjahren.
            </p>

            <div className="mt-5 grid gap-3">
              {carriedOverBalances.map((balance) => (
                <div
                  key={balance.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
                >
                  <p className="font-semibold">
                    {balance.carriedOver} Tage aus {balance.year}
                  </p>

                  {balance.expiresAt ? (
                    <p className="mt-1">
                      Ablaufdatum: {formatDate(balance.expiresAt)}
                    </p>
                  ) : null}
                </div>
              ))}

              {carriedOverBalances.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Kein Resturlaub aus Vorjahren vorhanden.
                </div>
              ) : null}
            </div>
          </article>
        </aside>
      </section>
    </>
  );
}