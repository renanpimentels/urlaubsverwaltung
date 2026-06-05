"use client";

import { useRouter } from "next/navigation";

type DepartmentOption = {
  id: string;
  name: string;
};

type EmployeeDepartmentFilterProps = {
  departments: DepartmentOption[];
  selectedDepartmentId?: string;
  disabled?: boolean;
};

export function EmployeeDepartmentFilter({
  departments,
  selectedDepartmentId,
  disabled = false,
}: EmployeeDepartmentFilterProps) {
  const router = useRouter();

  function handleChange(departmentId: string) {
    if (!departmentId) {
      router.push("/mitarbeiter");
      return;
    }

    router.push(`/mitarbeiter?departmentId=${departmentId}`);
  }

  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_280px] md:items-end">
        <div>
          <h2 className="font-bold">Abteilung filtern</h2>
          <p className="mt-1 text-sm text-slate-500">
            Wähle eine Abteilung aus, um die Mitarbeiterliste einzugrenzen.
          </p>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Abteilung
          </span>

          <select
            value={selectedDepartmentId ?? ""}
            onChange={(event) => handleChange(event.target.value)}
            disabled={disabled || departments.length <= 1}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600 disabled:bg-slate-100 disabled:text-slate-500"
          >
            {departments.length > 1 ? (
              <option value="">Alle sichtbaren Abteilungen</option>
            ) : null}

            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}