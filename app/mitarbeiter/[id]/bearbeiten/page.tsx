import Link from "next/link";
import { notFound } from "next/navigation";

import { EmployeeEditForm } from "@/components/EmployeeEditForm";
import { PageHeader } from "@/components/PageHeader";
import {
  canAccessSettingsRole,
  getCurrentUserFromDb,
} from "@/lib/current-user-server";
import {
  getCompanySettingsFromDb,
  getEmployeeByIdFromDb,
  getUserByEmployeeIdFromDb,
  getVisibleDepartmentsForUserFromDb,
} from "@/lib/prisma-queries";

type EmployeeEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EmployeeEditPage({
  params,
}: EmployeeEditPageProps) {
  const currentUser = await getCurrentUserFromDb();

  if (!canAccessSettingsRole(currentUser.role)) {
    notFound();
  }

  const { id } = await params;

  const employee = await getEmployeeByIdFromDb(id);

  if (!employee) {
    notFound();
  }

  const user = await getUserByEmployeeIdFromDb(employee.id);

  if (!user) {
    notFound();
  }

  const departments = await getVisibleDepartmentsForUserFromDb(
    currentUser.employeeId,
    currentUser.role
  );

  const companySettings = await getCompanySettingsFromDb();

  return (
    <>
      <PageHeader
        eyebrow="Mitarbeiter bearbeiten"
        title={employee.name}
        description="Bearbeite Stammdaten, Vertragsinformationen und Benutzerzugang."
        action={
          <Link
            href={`/mitarbeiter/${employee.id}`}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Zurück zum Profil
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <EmployeeEditForm
          employee={employee}
          email={user.email}
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
            Änderungen wirken sich direkt auf den Mitarbeiter, den verknüpften
            Benutzer und den aktuellen Urlaubssaldo aus.
          </p>

          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">E-Mail</p>
              <p className="mt-1 text-sm text-slate-600">
                Die E-Mail gehört zum verknüpften Benutzerkonto.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">
                Vertraglicher Jahresurlaub
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Wenn dieser Wert geändert wird, wird der Urlaubssaldo des
                aktuellen Jahres neu berechnet.
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">Inaktiv setzen</p>
              <p className="mt-1 text-sm text-amber-700">
                Wenn der Mitarbeiter deaktiviert wird, wird auch der
                Benutzerzugang deaktiviert.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}