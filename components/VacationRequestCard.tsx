import Link from "next/link";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatDateRange } from "@/lib/date-formatters";
import type { Employee, VacationRequest } from "@/lib/types";

type VacationRequestCardProps = {
  request: VacationRequest;
  employee?: Employee;
  actions?: ReactNode;
  showCreatedAt?: boolean;
};

export function VacationRequestCard({
  request,
  employee,
  actions,
  showCreatedAt = false,
}: VacationRequestCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-950">
              {request.absenceType}
            </h2>

            <StatusBadge
              status={request.status}
              approvalStepsCompleted={request.approvalStepsCompleted}
              approvalStepsRequired={request.approvalStepsRequired}
            />

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              {request.days} Tage
            </span>
          </div>

          <div className="mt-3 grid gap-1.5 text-sm text-slate-600 sm:grid-cols-2">
            <p className="min-w-0">
              <span className="font-medium text-slate-800">Mitarbeiter:</span>{" "}
              <span className="break-words">
                {employee ? employee.name : "Unbekannter Mitarbeiter"}
              </span>
            </p>

            <p className="min-w-0">
              <span className="font-medium text-slate-800">Zeitraum:</span>{" "}
              <span>{formatDateRange(request.startDate, request.endDate)}</span>
            </p>

            {showCreatedAt ? (
              <p className="min-w-0">
                <span className="font-medium text-slate-800">
                  Erstellt am:
                </span>{" "}
                <span>{formatDate(request.createdAt)}</span>
              </p>
            ) : null}

            {request.comment ? (
              <p className="min-w-0 sm:col-span-2">
                <span className="font-medium text-slate-800">Bemerkung:</span>{" "}
                <span className="break-words">{request.comment}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:min-w-40">
          {actions ?? (
            <Link
              href={`/urlaubsantraege/${request.id}`}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Details anzeigen
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}