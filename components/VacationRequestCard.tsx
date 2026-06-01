import type { ReactNode } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import type { VacationRequest } from "@/lib/types";

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
        <div className="mb-3">
          <StatusBadge status={request.status} />
        </div>

        <h3 className="font-semibold">{request.title}</h3>

        <p className="mt-1 text-sm font-medium text-slate-700">
          {request.employeeName}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {request.department} · {request.period} · {request.days} Tage
        </p>
      </div>

      {actions ? <div className="flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
    </article>
  );
}