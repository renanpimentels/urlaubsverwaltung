import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { VacationBalanceCard } from "@/components/VacationBalanceCard";
import { getCurrentUserFromDb } from "@/lib/current-user-server";
import { formatDate, formatDateRange } from "@/lib/date-formatters";
import {
  canUserViewEmployeeFromDb,
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
  const currentUser = await getCurrentUserFromDb();
  const { id } = await params;

  const employee = await getEmployeeByIdFromDb(id);

  if (!employee) {
    notFound();
  }

  const canViewEmployee = await canUserViewEmployeeFromDb(
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

  const currentVacationBalance = await getVacationBalanceByEmployeeIdFromDb(
    employee.id
  );

  const vacationBalances = await getVacationBalancesByEmployeeIdFromDb(
    employee.id
  );

  const vacationRequests = await getVacationRequestsByEmployeeIdFromDb(
    employee.id
  );

  return (
    <>
      <PageHeader
        eyebrow="Mitarbeiterprofil"
        title={employee.name}
        description="Detailansicht eines Mitarbeiters mit Urlaubssaldo und Anträgen."
        action={
          <Link
            href="/mitarbeiter"
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
                <h2 className="text-xl font-bold">Stammdaten</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Grundlegende Mitarbeiterinformationen.
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  employee.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {employee.isActive ? "Aktiv" : "Inaktiv"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Name</p>
                <p className="mt-1 font-medium">{employee.name}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Position
                </p>
                <p className="mt-1 font-medium">{employee.role}</p>
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
                  Eintrittsdatum
                </p>
                <p className="mt-1 font-medium">
                  {formatDate(employee.employmentStartDate)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-sm font-semibold text-slate-500">
                  Vertraglicher Jahresurlaub
                </p>
                <p className="mt-1 font-medium">
                  {employee.contractVacationDaysPerYear} Tage pro Jahr
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
              {vacationRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <h3 className="font-semibold">{request.absenceType}</h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {formatDateRange(request.startDate, request.endDate)} ·{" "}
                        {request.days} Tage
                      </p>

                      {request.comment ? (
                        <p className="mt-1 text-sm text-slate-500">
                          {request.comment}
                        </p>
                      ) : null}
                    </div>

                    <StatusBadge
                      status={request.status}
                      approvalStepsCompleted={request.approvalStepsCompleted}
                      approvalStepsRequired={request.approvalStepsRequired}
                    />
                  </div>
                </div>
              ))}

              {vacationRequests.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Für diesen Mitarbeiter wurden keine Urlaubsanträge gefunden.
                </div>
              ) : null}
            </div>
          </article>
        </div>

        <aside className="grid gap-6">
          {currentVacationBalance ? (
            <VacationBalanceCard
              total={currentVacationBalance.total}
              used={currentVacationBalance.used}
              pending={currentVacationBalance.pending}
              available={currentVacationBalance.available}
              title={`Urlaubssaldo ${currentVacationBalance.year}`}
              description="Aktueller Urlaubssaldo dieses Mitarbeiters."
            />
          ) : null}

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Saldohistorie</h2>
            <p className="mt-1 text-sm text-slate-500">
              Übersicht der gespeicherten Urlaubssalden.
            </p>

            <div className="mt-5 grid gap-3">
              {vacationBalances.map((balance) => (
                <div
                  key={balance.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm"
                >
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-slate-800">
                      {balance.year}
                    </span>
                    <span className="text-slate-600">
                      {balance.available} verfügbar
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2 text-slate-500">
                    <span>{balance.used} genommen</span>
                    <span>{balance.pending} offen</span>
                    <span>{balance.total} gesamt</span>
                  </div>
                </div>
              ))}

              {vacationBalances.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Keine Salden gefunden.
                </div>
              ) : null}
            </div>
          </article>
        </aside>
      </section>
    </>
  );
}