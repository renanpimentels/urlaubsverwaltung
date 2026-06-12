import { notFound } from "next/navigation";

import { CompanyPolicySettingsForm } from "@/components/CompanyPolicySettingsForm";
import { CompanySettingsForm } from "@/components/CompanySettingsForm";
import { DepartmentCreateForm } from "@/components/DepartmentCreateForm";
import { DepartmentSearchManagementForm } from "@/components/DepartmentSearchManagementForm";
import { PageHeader } from "@/components/PageHeader";
import { UserRoleSearchForm } from "@/components/UserRoleSearchForm";
import { VacationBalanceRecalculationForm } from "@/components/VacationBalanceRecalculationForm";
import {
  canAccessSettingsRole,
  getActiveCurrentUserFromDb,
} from "@/lib/current-user-server";
import {
  getCompanySettingsFromDb,
  getDepartmentsWithApproversFromDb,
  getEmployeesForSettingsSelectFromDb,
  getUsersWithEmployeesForSettingsFromDb,
} from "@/lib/prisma-queries";

export default async function SettingsPage() {
  const currentUser = await getActiveCurrentUserFromDb();

  if (!canAccessSettingsRole(currentUser.role)) {
    notFound();
  }

  const companySettings = await getCompanySettingsFromDb();
  const departments = await getDepartmentsWithApproversFromDb();
  const employees = await getEmployeesForSettingsSelectFromDb();
  const users = await getUsersWithEmployeesForSettingsFromDb();

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Administration"
        title="Einstellungen"
        description="Globale Urlaubseinstellungen, Richtlinien, Abteilungen, Freigaberegeln und Benutzerrollen verwalten."
      />

      <section className="grid gap-4">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-950">
              Globale Urlaubseinstellungen
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Standardwerte für neu angelegte Mitarbeiter.
            </p>
          </div>

          <CompanySettingsForm
            defaultVacationDaysPerYear={
              companySettings?.defaultVacationDaysPerYear ?? 30
            }
          />

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-sm font-medium text-slate-700">Hinweis</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Der Standard-Jahresurlaub wird nur als Ausgangswert verwendet. Der
              individuelle vertragliche Jahresurlaub wird weiterhin pro
              Mitarbeiter gespeichert.
            </p>
          </div>
        </article>

        <CompanyPolicySettingsForm
          allowPastVacationRequests={
            companySettings?.allowPastVacationRequests ?? false
          }
          requireVacationRequestComment={
            companySettings?.requireVacationRequestComment ?? false
          }
          minimumNoticeDays={companySettings?.minimumNoticeDays ?? 0}
          allowHalfVacationDays={companySettings?.allowHalfVacationDays ?? false}
          federalState={companySettings?.federalState ?? "NW"}
        />

        <VacationBalanceRecalculationForm
          currentYear={new Date().getFullYear()}
        />

        <DepartmentCreateForm employees={employees} />

        <DepartmentSearchManagementForm
          departments={departments}
          employees={employees}
        />

        <UserRoleSearchForm users={users} />
      </section>
    </div>
  );
}