import { PageHeader } from "@/components/PageHeader";
import { companySettings, departments } from "@/lib/mock-data";
import { getEmployeeById } from "@/lib/mock-queries";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Einstellungen"
        description="Zentrale Einstellungen für Urlaubsregeln, Abteilungen und Genehmigungswege."
      />

      <section className="grid gap-6">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Globale Urlaubseinstellungen</h2>
            <p className="mt-1 text-sm text-slate-500">
              Diese Werte dienen als Standard für neue Mitarbeiter.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">
              Globaler Jahresurlaub
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-950">
              {companySettings.defaultVacationDaysPerYear} Tage
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Beim Anlegen eines neuen Mitarbeiters wird dieser Wert als
              vertraglicher Jahresurlaub vorgeschlagen und kann individuell
              angepasst werden.
            </p>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Abteilungen</h2>
            <p className="mt-1 text-sm text-slate-500">
              Übersicht über Abteilungen, Manager und finale Genehmiger.
            </p>
          </div>

          <div className="grid gap-3">
            {departments.map((department) => {
              const manager = getEmployeeById(department.managerId);

              const finalApprover = department.finalApproverId
                ? getEmployeeById(department.finalApproverId)
                : undefined;

              return (
                <div
                  key={department.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <h3 className="font-semibold">{department.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Abteilungs-ID: {department.id}
                      </p>
                    </div>

                    <div className="grid gap-3 text-sm md:min-w-80">
                      <div className="rounded-xl bg-white p-3">
                        <p className="font-semibold text-slate-500">Manager</p>
                        <p className="mt-1 text-slate-900">
                          {manager ? manager.name : "Nicht zugewiesen"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3">
                        <p className="font-semibold text-slate-500">
                          Final Approver
                        </p>
                        <p className="mt-1 text-slate-900">
                          {finalApprover
                            ? finalApprover.name
                            : "Nicht zugewiesen"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </>
  );
}