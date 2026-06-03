import { DepartmentSettingsList } from "@/components/DepartmentSettingsList";
import { PageHeader } from "@/components/PageHeader";
import { companySettings, departments, employees } from "@/lib/mock-data";

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

        <DepartmentSettingsList
          departments={departments}
          employees={employees}
        />
      </section>
    </>
  );
}