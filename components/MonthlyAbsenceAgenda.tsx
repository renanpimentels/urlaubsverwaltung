import Link from "next/link";

import { StatusBadge } from "@/components/StatusBadge";
import { isDateWithinDateRange, type CalendarDay } from "@/lib/calendar-helpers";
import { formatDateRange } from "@/lib/date-formatters";
import type { RequestStatus } from "@/lib/types";

type CalendarRequest = {
  id: string;
  employeeId: string;
  createdByUserId?: string;
  absenceType: "Urlaub" | "Sonderurlaub";
  startDate: string;
  endDate: string;
  days: number;
  status: RequestStatus;
  approvalStepsCompleted: number;
  approvalStepsRequired: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
};

type CalendarEmployee = {
  id: string;
  name: string;
  departmentId?: string;
  role: string;
  position: string;
  employmentStartDate: string;
  contractVacationDaysPerYear: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type CalendarDepartment = {
  id: string;
  name: string;
  managerId: string;
  finalApproverId: string | null;
  approvalStepsRequired: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type MonthlyAbsenceAgendaProps = {
  days: CalendarDay[];
  entries: {
    request: CalendarRequest;
    employee?: CalendarEmployee;
    department?: CalendarDepartment | null;
  }[];
};

export function MonthlyAbsenceAgenda({
  days,
  entries,
}: MonthlyAbsenceAgendaProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-950">
          Monatsübersicht
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Genehmigte und ausstehende Abwesenheiten im ausgewählten Monat.
        </p>
      </div>

      <div className="grid gap-2">
        {days.map((day) => {
          const dayEntries = entries.filter(({ request }) =>
            isDateWithinDateRange({
              date: day.date,
              startDate: request.startDate,
              endDate: request.endDate,
            })
          );

          return (
            <section
              key={day.date}
              className={`rounded-lg border px-3 py-2.5 ${
                day.isToday
                  ? "border-slate-400 bg-slate-100"
                  : day.isWeekend
                    ? "border-slate-200 bg-slate-50"
                    : "border-slate-200 bg-white"
              }`}
            >
              <div className="grid gap-3 lg:grid-cols-[88px_minmax(0,1fr)]">
                <div className="flex items-center gap-2 lg:block">
                  <p className="text-sm font-semibold text-slate-950">
                    {day.weekdayShort}
                  </p>
                  <p className="text-sm text-slate-500">
                    {String(day.dayOfMonth).padStart(2, "0")}.
                    {day.date.slice(5, 7)}.
                  </p>
                </div>

                <div className="grid gap-2">
                  {dayEntries.length > 0 ? (
                    dayEntries.map(({ request, employee, department }) => (
                      <Link
                        key={`${day.date}-${request.id}`}
                        href={`/urlaubsantraege/${request.id}`}
                        className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition hover:border-slate-300 hover:bg-slate-100"
                      >
                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-950">
                                {employee?.name ?? "Unbekannter Mitarbeiter"}
                              </p>

                              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                {request.absenceType}
                              </span>

                              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                {request.days} Tage
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                              {department?.name ?? "Keine Abteilung"} ·{" "}
                              {formatDateRange(
                                request.startDate,
                                request.endDate
                              )}
                            </p>
                          </div>

                          <div className="sm:justify-self-end">
                            <StatusBadge
                              status={request.status}
                              approvalStepsCompleted={
                                request.approvalStepsCompleted
                              }
                              approvalStepsRequired={
                                request.approvalStepsRequired
                              }
                            />
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">
                      Keine Abwesenheiten
                    </p>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </article>
  );
}