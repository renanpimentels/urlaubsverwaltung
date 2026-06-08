import { notFound } from "next/navigation";

import { CompanySettingsForm } from "@/components/CompanySettingsForm";
import { DepartmentCreateForm } from "@/components/DepartmentCreateForm";
import { DepartmentSearchManagementForm } from "@/components/DepartmentSearchManagementForm";
import { PageHeader } from "@/components/PageHeader";
import { UserRoleSearchForm } from "@/components/UserRoleSearchForm";
import {
  canAccessSettingsRole,
  getCurrentUserFromDb,
} from "@/lib/current-user-server";
import {
  getCompanySettingsFromDb,
  getDepartmentsWithApproversFromDb,
  getEmployeesForSettingsSelectFromDb,
  getUsersWithEmployeesForSettingsFromDb,
} from "@/lib/prisma-queries";

export default async function SettingsPage() {
  const currentUser = await getCurrentUserFromDb();

  if (!canAccessSettingsRole(currentUser.role)) {
    notFound();
  }

  const companySettings = await getCompanySettingsFromDb();
  const departments = await getDepartmentsWithApproversFromDb();
  const employees = await getEmployeesForSettingsSelectFromDb();
  const users = await getUsersWithEmployeesForSettingsFromDb();

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Einstellungen"
        description="Verwalte globale Urlaubseinstellungen, Abteilungen, Freigaberegeln und Benutzerrollen."
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

        <DepartmentCreateForm employees={employees} />

        <DepartmentSearchManagementForm
          departments={departments}
          employees={employees}
        />

        <UserRoleSearchForm users={users} />
      </section>
    </>
  );
}