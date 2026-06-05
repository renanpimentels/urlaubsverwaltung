import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { currentUser } from "@/lib/current-user";
import { canAccessSettings } from "@/lib/mock-queries";
import {
  getCompanySettingsFromDb,
  getDepartmentsWithApproversFromDb,
} from "@/lib/prisma-queries";

export default async function SettingsPage() {
  if (!canAccessSettings(currentUser.role)) {
    notFound();
  }

  const companySettings = await getCompanySettingsFromDb();
  const departments = await getDepartmentsWithApproversFromDb();

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

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Standard-Jahresurlaub
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {companySettings?.defaultVacationDaysPerYear ?? 0}
              </p>
              <p className="mt-1 text-sm text-slate-500">Tage pro Jahr</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
              <p className="text-sm font-semibold text-slate-500">Hinweis</p>
              <p className="mt-2 text-sm text-slate-600">
                Der Standard-Jahresurlaub wird nur als Ausgangswert verwendet.
                Der individuelle vertragliche Jahresurlaub wird weiterhin pro
                Mitarbeiter gespeichert.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Abteilungen</h2>
            <p className="mt-1 text-sm text-slate-500">
              Übersicht der Abteilungen mit Manager und finalem Freigeber.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Abteilung</th>
                  <th className="px-4 py-3 font-semibold">Manager</th>
                  <th className="px-4 py-3 font-semibold">Final Approver</th>
                  <th className="px-4 py-3 font-semibold">Mitarbeiter</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {departments.map((department) => (
                  <tr key={department.id}>
                    <td className="px-4 py-4 font-semibold text-slate-950">
                      {department.name}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      <div>
                        <p className="font-medium">
                          {department.manager.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {department.manager.position}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {department.finalApprover ? (
                        <div>
                          <p className="font-medium">
                            {department.finalApprover.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {department.finalApprover.position}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400">
                          Nicht definiert
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {department.employees.length}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          department.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {department.isActive ? "Aktiv" : "Inaktiv"}
                      </span>
                    </td>
                  </tr>
                ))}

                {departments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Keine Abteilungen gefunden.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </>
  );
}