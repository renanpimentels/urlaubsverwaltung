import Link from "next/link";

import type { Employee } from "@/lib/types";

type EmployeeCardProps = {
  employee: Employee;
  departmentName?: string;
};

export function EmployeeCard({ employee, departmentName }: EmployeeCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-full flex-col justify-between gap-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{employee.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{employee.role}</p>
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

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Abteilung:</span>{" "}
            {departmentName ?? "Keine Abteilung"}
          </div>
        </div>

        <Link
          href={`/mitarbeiter/${employee.id}`}
          className="rounded-xl bg-teal-700 px-5 py-3 text-center font-semibold text-white shadow-sm hover:bg-teal-800"
        >
          Profil anzeigen
        </Link>
      </div>
    </article>
  );
}