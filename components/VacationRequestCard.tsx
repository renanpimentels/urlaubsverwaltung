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
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold">{request.absenceType}</h2>

            <StatusBadge
              status={request.status}
              approvalStepsCompleted={request.approvalStepsCompleted}
              approvalStepsRequired={request.approvalStepsRequired}
            />
          </div>

          <div className="mt-4 grid gap-2 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-800">
                Mitarbeiter:
              </span>{" "}
              {employee ? employee.name : "Unbekannter Mitarbeiter"}
            </p>

            <p>
              <span className="font-semibold text-slate-800">Zeitraum:</span>{" "}
              {formatDateRange(request.startDate, request.endDate)}
            </p>

            <p>
              <span className="font-semibold text-slate-800">Tage:</span>{" "}
              {request.days}
            </p>

            {showCreatedAt ? (
              <p>
                <span className="font-semibold text-slate-800">
                  Erstellt am:
                </span>{" "}
                {formatDate(request.createdAt)}
              </p>
            ) : null}

            {request.comment ? (
              <p>
                <span className="font-semibold text-slate-800">
                  Bemerkung:
                </span>{" "}
                {request.comment}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-48">
          {actions ?? (
            <Link
              href={`/urlaubsantraege/${request.id}`}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
            >
              Details anzeigen
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}