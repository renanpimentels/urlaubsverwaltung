"use client";

import { useRouter } from "next/navigation";

type DepartmentOption = {
  id: string;
  name: string;
};

type VacationRequestFilterProps = {
  departments: DepartmentOption[];
  years: number[];
  selectedStatus?: string;
  selectedAbsenceType?: string;
  selectedDepartmentId?: string;
  selectedYear?: string;
};

const statusOptions = [
  {
    value: "Ausstehend",
    label: "Ausstehend",
  },
  {
    value: "Genehmigt",
    label: "Genehmigt",
  },
  {
    value: "Abgelehnt",
    label: "Abgelehnt",
  },
  {
    value: "Storniert",
    label: "Storniert",
  },
];

const absenceTypeOptions = [
  {
    value: "Urlaub",
    label: "Urlaub",
  },
  {
    value: "Sonderurlaub",
    label: "Sonderurlaub",
  },
];

export function VacationRequestFilter({
  departments,
  years,
  selectedStatus,
  selectedAbsenceType,
  selectedDepartmentId,
  selectedYear,
}: VacationRequestFilterProps) {
  const router = useRouter();

  function updateFilter(name: string, value: string) {
    const searchParams = new URLSearchParams(window.location.search);

    if (value) {
      searchParams.set(name, value);
    } else {
      searchParams.delete(name);
    }

    const queryString = searchParams.toString();

    router.push(queryString ? `/urlaubsantraege?${queryString}` : "/urlaubsantraege");
  }

  function resetFilters() {
    router.push("/urlaubsantraege");
  }

  const hasActiveFilters = Boolean(
    selectedStatus ||
      selectedAbsenceType ||
      selectedDepartmentId ||
      selectedYear
  );

  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h2 className="font-bold">Anträge filtern</h2>
          <p className="mt-1 text-sm text-slate-500">
            Grenze die Liste nach Status, Typ, Abteilung oder Jahr ein.
          </p>
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="w-fit rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Filter zurücksetzen
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Status</span>
          <select
            value={selectedStatus ?? ""}
            onChange={(event) => updateFilter("status", event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
          >
            <option value="">Alle Status</option>

            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Abwesenheitsart
          </span>
          <select
            value={selectedAbsenceType ?? ""}
            onChange={(event) =>
              updateFilter("absenceType", event.target.value)
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
          >
            <option value="">Alle Typen</option>

            {absenceTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Abteilung
          </span>
          <select
            value={selectedDepartmentId ?? ""}
            onChange={(event) =>
              updateFilter("departmentId", event.target.value)
            }
            disabled={departments.length <= 1}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">Alle sichtbaren Abteilungen</option>

            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Jahr</span>
          <select
            value={selectedYear ?? ""}
            onChange={(event) => updateFilter("year", event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
          >
            <option value="">Alle Jahre</option>

            {years.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}