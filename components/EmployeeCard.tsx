import { formatDate } from "@/lib/date-formatters";
import {
  getDepartmentById,
  getVacationBalanceByEmployeeId,
} from "@/lib/mock-queries";
import type { Employee } from "@/lib/types";
import { calculateProRatedVacationEntitlement } from "@/lib/vacation-entitlement";

import Link from "next/link";


type EmployeeCardProps = {
  employee: Employee;
};

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const department = getDepartmentById(employee.departmentId);
  const vacationBalance = getVacationBalanceByEmployeeId(employee.id);
  const currentYear = new Date().getFullYear();

  const calculatedEntitlement = calculateProRatedVacationEntitlement(
    employee.employmentStartDate,
    employee.contractVacationDaysPerYear,
    currentYear
  );

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{employee.name}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {department ? department.name : "Keine Abteilung"} · {employee.role}
          </p>
        </div>

        <span
          className={
            employee.isActive
              ? "rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700"
              : "rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600"
          }
        >
          {employee.isActive ? "Aktiv" : "Inaktiv"}
        </span>
      </div>

      <div className="grid gap-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">
            Eintrittsdatum
          </p>
          <p className="mt-1 font-medium">
            {formatDate(employee.employmentStartDate)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">
            Vertraglicher Jahresurlaub
          </p>
          <p className="mt-1 font-medium">
            {employee.contractVacationDaysPerYear} Tage
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">
            Berechneter Anspruch {currentYear}
          </p>
          <p className="mt-1 font-medium">{calculatedEntitlement} Tage</p>
          <p className="mt-1 text-sm text-slate-500">
            Mockup-Berechnung anhand des Eintrittsdatums.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">Saldojahr</p>
          <p className="mt-1 font-medium">{vacationBalance?.year ?? "—"}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Gesamt</p>
            <p className="mt-1 text-2xl font-bold">
              {vacationBalance?.total ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Genommen</p>
            <p className="mt-1 text-2xl font-bold">
              {vacationBalance?.used ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-teal-50 p-4">
            <p className="text-sm font-semibold text-teal-700">Verfügbar</p>
            <p className="mt-1 text-2xl font-bold text-teal-800">
              {vacationBalance?.available ?? 0}
            </p>
          </div>
        </div>

        <Link
          href={`/mitarbeiter/${employee.id}`}
          className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          Details anzeigen
        </Link>

      </div>
    </article>
  );
}