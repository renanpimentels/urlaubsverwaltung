import { notFound } from "next/navigation";

import { EmployeeForm } from "@/components/EmployeeForm";
import { PageHeader } from "@/components/PageHeader";
import { currentUser } from "@/lib/current-user";
import { companySettings, departments } from "@/lib/mock-data";
import { canCreateEmployee } from "@/lib/mock-queries";

export default function NewEmployeePage() {
  if (!canCreateEmployee(currentUser.role)) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Neuer Mitarbeiter"
        title="Mitarbeiter hinzufügen"
        description="Erfasse einen neuen Mitarbeiter. In dieser Mockup-Version werden die Daten noch nicht gespeichert."
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <EmployeeForm
          departments={departments}
          companySettings={companySettings}
        />

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Hinweise</h2>
          <p className="mt-1 text-sm text-slate-500">
            Diese Informationen werden später für Urlaubssaldo,
            Genehmigungswege und Berechtigungen verwendet.
          </p>

          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">
                Vertraglicher Jahresurlaub
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Der Wert wird mit dem globalen Standard aus den Einstellungen
                vorbelegt, kann aber pro Mitarbeiter angepasst werden.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">Eintrittsdatum</p>
              <p className="mt-1 text-sm text-slate-600">
                Das Eintrittsdatum wird später für die anteilige Berechnung des
                Urlaubsanspruchs im Eintrittsjahr genutzt.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">Abteilung</p>
              <p className="mt-1 text-sm text-slate-600">
                Die Abteilung bestimmt später, welcher Manager und welcher
                finale Genehmiger für Urlaubsanträge zuständig sind.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}