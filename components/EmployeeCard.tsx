import Link from "next/link";

import type { Employee } from "@/lib/types";

type EmployeeCardProps = {
  employee: Employee;
  departmentName?: string;
};

export function EmployeeCard({ employee, departmentName }: EmployeeCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow">
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-slate-950">
                {employee.name}
              </h2>

              <p className="mt-0.5 truncate text-sm text-slate-500">
                {employee.role}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                employee.isActive
                  ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                  : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {employee.isActive ? "Aktiv" : "Inaktiv"}
            </span>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <span className="font-medium text-slate-800">Abteilung:</span>{" "}
            <span>{departmentName ?? "Keine Abteilung"}</span>
          </div>
        </div>

        <Link
          href={`/mitarbeiter/${employee.id}`}
          className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Profil anzeigen
        </Link>
      </div>
    </article>
  );
}