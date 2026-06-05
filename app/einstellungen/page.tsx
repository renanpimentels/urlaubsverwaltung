import { notFound } from "next/navigation";

import { CompanySettingsForm } from "@/components/CompanySettingsForm";
import { DepartmentApproverForm } from "@/components/DepartmentApproverForm";
import { PageHeader } from "@/components/PageHeader";
import { currentUser } from "@/lib/current-user";
import { canAccessSettings } from "@/lib/mock-queries";
import {
  getCompanySettingsFromDb,
  getDepartmentsWithApproversFromDb,
  getEmployeesForSettingsSelectFromDb,
} from "@/lib/prisma-queries";

export default async function SettingsPage() {
  if (!canAccessSettings(currentUser.role)) {
    notFound();
  }

  const companySettings = await getCompanySettingsFromDb();
  const departments = await getDepartmentsWithApproversFromDb();
  const employees = await getEmployeesForSettingsSelectFromDb();

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Einstellungen"
        description="Verwalte globale Urlaubseinstellungen und Abteilungen."
      />

      <section className="grid gap-6">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Globale Urlaubseinstellungen</h2>
            <p className="mt-1 text-sm text-slate-500">
              Diese Werte dienen als Standard beim Erstellen neuer Mitarbeiter.
            </p>
          </div>

          <CompanySettingsForm
            defaultVacationDaysPerYear={
              companySettings?.defaultVacationDaysPerYear ?? 30
            }
          />

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Hinweis</p>
            <p className="mt-2 text-sm text-slate-600">
              Der Standard-Jahresurlaub wird nur als Ausgangswert verwendet. Der
              individuelle vertragliche Jahresurlaub wird weiterhin pro
              Mitarbeiter gespeichert.
            </p>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Abteilungen</h2>
            <p className="mt-1 text-sm text-slate-500">
              Übersicht der Abteilungen mit Manager und finalem Freigeber.
            </p>
          </div>

          <div className="grid gap-4">
            {departments.map((department) => (
              <div
                key={department.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <h3 className="text-lg font-bold">{department.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {department.employees.length} Mitarbeiter
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      department.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {department.isActive ? "Aktiv" : "Inaktiv"}
                  </span>
                </div>

                <div className="mb-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-semibold text-slate-500">
                      Aktueller Manager
                    </p>
                    <p className="mt-1 font-medium">
                      {department.manager.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {department.manager.position}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-semibold text-slate-500">
                      Aktueller Final Approver
                    </p>

                    {department.finalApprover ? (
                      <>
                        <p className="mt-1 font-medium">
                          {department.finalApprover.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {department.finalApprover.position}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-slate-500">
                        Nicht definiert
                      </p>
                    )}
                  </div>
                </div>

                <DepartmentApproverForm
                  departmentId={department.id}
                  managerId={department.managerId}
                  finalApproverId={department.finalApproverId}
                  employees={employees}
                />
              </div>
            ))}

            {departments.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                Keine Abteilungen gefunden.
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </>
  );
}