import { getDepartmentById } from "@/lib/mock-queries";
import type { Employee } from "@/lib/types";
import { formatDate } from "@/lib/date-formatters";


type EmployeeCardProps = {
  employee: Employee;
};

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const department = getDepartmentById(employee.departmentId);

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

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Gesamt</p>
            <p className="mt-1 text-2xl font-bold">
              {employee.vacationDaysTotal}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Genommen</p>
            <p className="mt-1 text-2xl font-bold">
              {employee.vacationDaysUsed}
            </p>
          </div>

          <div className="rounded-2xl bg-teal-50 p-4">
            <p className="text-sm font-semibold text-teal-700">Verfügbar</p>
            <p className="mt-1 text-2xl font-bold text-teal-800">
              {employee.vacationDaysRemaining}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}