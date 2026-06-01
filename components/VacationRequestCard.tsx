import { StatusBadge } from "@/components/StatusBadge";
import type { VacationRequest } from "@/lib/types";
import type { ReactNode } from "react";

type VacationRequestCardProps = {
  request: VacationRequest;
  actions?: ReactNode;
};

export function VacationRequestCard({
  request,
  actions,
}: VacationRequestCardProps) {
  return (
    <article className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center">
      <div>
        <h3 className="font-semibold">{request.title}</h3>

        <p className="mt-1 text-sm font-medium text-slate-700">
          {request.employeeName}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {request.department} · {request.period} · {request.days} Tage
        </p>
      </div>

      <div className="flex flex-col items-start gap-3 md:items-end">
        <StatusBadge status={request.status} />

        {actions ? (
          <div className="flex flex-col gap-3 sm:flex-row">{actions}</div>
        ) : (
          <a
            href={`/urlaubsantraege/${request.id}`}
            className="text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            Details anzeigen
          </a>
        )}
      </div>
    </article>
  );
}