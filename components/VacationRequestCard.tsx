import Link from "next/link";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/StatusBadge";
import { getDepartmentById } from "@/lib/mock-queries";
import type { Employee, VacationRequest } from "@/lib/types";

import { formatDateRange } from "@/lib/date-formatters";

type VacationRequestCardProps = {
  request: VacationRequest;
  employee?: Employee;
  actions?: ReactNode;
};

export function VacationRequestCard({
  request,
  employee,
  actions,
}: VacationRequestCardProps) {
  const department = employee
    ? getDepartmentById(employee.departmentId)
    : undefined;

  return (
    <article className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center">
      <div>
        <h3 className="font-semibold">{request.absenceType}</h3>

        <p className="mt-1 text-sm font-medium text-slate-700">
          {employee ? employee.name : "Unbekannter Mitarbeiter"}
        </p>

        {request.comment ? (
          <p className="mt-1 text-sm text-slate-500">{request.comment}</p>
        ) : null}

        <p className="mt-1 text-sm text-slate-500">
          {department ? department.name : "Keine Abteilung"} ·{" "}
          {formatDateRange(request.startDate, request.endDate)} · {request.days} Tage
        </p>
      </div>

      <div className="flex flex-col items-start gap-3 md:items-end">
        <StatusBadge
          status={request.status}
          approvalStepsCompleted={request.approvalStepsCompleted}
          approvalStepsRequired={request.approvalStepsRequired}
        />

        <Link
          href={`/urlaubsantraege/${request.id}`}
          className="text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          Details anzeigen
        </Link>

        {actions ? (
          <div className="flex flex-col gap-3 sm:flex-row">{actions}</div>
        ) : null}
      </div>
    </article>
  );
}