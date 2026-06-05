import { notFound } from "next/navigation";

import { EmployeeForm } from "@/components/EmployeeForm";
import { PageHeader } from "@/components/PageHeader";
import {
  canAccessSettingsRole,
  getCurrentUserFromDb,
} from "@/lib/current-user-server";
import {
  getCompanySettingsFromDb,
  getVisibleDepartmentsForUserFromDb,
} from "@/lib/prisma-queries";

export default async function NewEmployeePage() {
  const currentUser = await getCurrentUserFromDb();

  if (!canAccessSettingsRole(currentUser.role)) {
    notFound();
  }

  const companySettings = await getCompanySettingsFromDb();

  const departments = await getVisibleDepartmentsForUserFromDb(
    currentUser.employeeId,
    currentUser.role
  );

  return (
    <>
      <PageHeader
        eyebrow="Neuer Mitarbeiter"
        title="Mitarbeiter hinzufügen"
        description="Erfasse einen neuen Mitarbeiter. In dieser Version werden die Stammdaten aus dem System geladen."
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <EmployeeForm
          departments={departments.map((department) => ({
            id: department.id,
            name: department.name,
            managerId: department.managerId,
            finalApproverId: department.finalApproverId ?? undefined,
          }))}
          companySettings={
            companySettings
              ? {
                  defaultVacationDaysPerYear:
                    companySettings.defaultVacationDaysPerYear,
                }
              : {
                  defaultVacationDaysPerYear: 30,
                }
          }
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