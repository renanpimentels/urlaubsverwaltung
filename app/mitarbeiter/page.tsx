import { PageHeader } from "@/components/PageHeader";
import { employees } from "@/lib/mock-data";

export default function EmployeesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Teamübersicht"
        title="Mitarbeiter"
        description="Übersicht über Mitarbeiter, Abteilungen und Urlaubssalden."
        action={
          <button className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800">
            Mitarbeiter hinzufügen
          </button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {employees.map((employee) => (
          <article
            key={employee.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{employee.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{employee.role}</p>
              </div>

              <span
                className={
                  employee.isActive
                    ? "rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700"
                    : "rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-600"
                }
              >
                {employee.isActive ? "Aktiv" : "Inaktiv"}
              </span>
            </div>

            <div className="mb-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Abteilung</p>
              <p className="mt-1 font-medium">{employee.department}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Gesamt</p>
                <p className="mt-1 text-lg font-bold">
                  {employee.vacationDaysTotal}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Genutzt</p>
                <p className="mt-1 text-lg font-bold">
                  {employee.vacationDaysUsed}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Übrig</p>
                <p className="mt-1 text-lg font-bold text-teal-700">
                  {employee.vacationDaysRemaining}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}