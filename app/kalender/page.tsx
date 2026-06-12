import Link from "next/link";

import { MonthlyAbsenceAgenda } from "@/components/MonthlyAbsenceAgenda";
import { PageHeader } from "@/components/PageHeader";
import { getActiveCurrentUserFromDb } from "@/lib/current-user-server";
import {
  formatCalendarMonthTitle,
  getCalendarMonthHref,
  getCurrentCalendarMonth,
  getDaysInCalendarMonth,
  getMonthDateRange,
  getNextCalendarMonth,
  getPreviousCalendarMonth,
  normalizeCalendarMonth,
} from "@/lib/calendar-helpers";
import {
  getDepartmentByIdFromDb,
  getEmployeeByIdFromDb,
  getVisibleVacationRequestsForUserByDateRangeFromDb,
} from "@/lib/prisma-queries";

type CalendarPageProps = {
  searchParams?: Promise<{
    year?: string;
    month?: string;
  }>;
};

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const currentUser = await getActiveCurrentUserFromDb();
  const resolvedSearchParams = await searchParams;

  const { year, month } = normalizeCalendarMonth({
    year: resolvedSearchParams?.year,
    month: resolvedSearchParams?.month,
  });

  const currentMonth = getCurrentCalendarMonth();
  const previousMonth = getPreviousCalendarMonth(year, month);
  const nextMonth = getNextCalendarMonth(year, month);
  const monthDateRange = getMonthDateRange(year, month);
  const days = getDaysInCalendarMonth(year, month);

  const requests = await getVisibleVacationRequestsForUserByDateRangeFromDb(
    currentUser.employeeId,
    currentUser.role,
    monthDateRange.startDate,
    monthDateRange.endDate
  );

  const entries = await Promise.all(
  requests.map(async (request) => {
    const employee = await getEmployeeByIdFromDb(request.employeeId);
    const department = employee?.departmentId
      ? await getDepartmentByIdFromDb(employee.departmentId)
      : null;

    return {
      request,
      employee,
      department,
    };
  })
);

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Kalender"
        title={formatCalendarMonthTitle(year, month)}
        description="Monatliche Übersicht über genehmigte und ausstehende Abwesenheiten."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={getCalendarMonthHref(previousMonth)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200"
            >
              Vorheriger Monat
            </Link>

            <Link
              href={getCalendarMonthHref(currentMonth)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200"
            >
              Heute
            </Link>

            <Link
              href={getCalendarMonthHref(nextMonth)}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              Nächster Monat
            </Link>
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Abwesenheiten</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {requests.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">im ausgewählten Monat</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Genehmigt</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {requests.filter((request) => request.status === "Genehmigt").length}
          </p>
          <p className="mt-1 text-sm text-slate-500">final freigegeben</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Ausstehend</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-amber-700">
            {requests.filter((request) => request.status === "Ausstehend").length}
          </p>
          <p className="mt-1 text-sm text-slate-500">noch in Prüfung</p>
        </article>
      </section>


        <MonthlyAbsenceAgenda days={days} entries={entries} />    

    </div>
  );
}