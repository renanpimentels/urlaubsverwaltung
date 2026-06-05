import Link from "next/link";

import { EmployeeCard } from "@/components/EmployeeCard";
import { EmployeeDepartmentFilter } from "@/components/EmployeeDepartmentFilter";
import { PageHeader } from "@/components/PageHeader";
import { getCurrentUserFromDb } from "@/lib/current-user-server";
import { canCreateEmployee } from "@/lib/permissions";
import {
  getDepartmentByIdFromDb,
  getEmployeeByIdFromDb,
  getVisibleDepartmentsForUserFromDb,
  getVisibleEmployeesForUserByDepartmentFromDb,
} from "@/lib/prisma-queries";

type EmployeesPageProps = {
  searchParams: Promise<{
    departmentId?: string;
  }>;
};

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  const currentUser = await getCurrentUserFromDb();
  const { departmentId } = await searchParams;

  const visibleDepartments = await getVisibleDepartmentsForUserFromDb(
    currentUser.employeeId,
    currentUser.role
  );

  const validSelectedDepartment = visibleDepartments.some(
    (department) => department.id === departmentId
  )
    ? departmentId
    : undefined;

  const selectedDepartmentId =
    currentUser.role === "employee"
      ? visibleDepartments[0]?.id
      : validSelectedDepartment;

  const visibleEmployees = await getVisibleEmployeesForUserByDepartmentFromDb(
    currentUser.employeeId,
    currentUser.role,
    selectedDepartmentId
  );

  const currentEmployee = currentUser.employeeId
    ? await getEmployeeByIdFromDb(currentUser.employeeId)
    : undefined;

  const canCreateNewEmployee = canCreateEmployee(currentUser.role);
  const filterDisabled =
    currentUser.role === "employee" || visibleDepartments.length <= 1;

  const employeesWithDepartments = await Promise.all(
    visibleEmployees.map(async (employee) => {
      const department = employee.departmentId
        ? await getDepartmentByIdFromDb(employee.departmentId)
        : undefined;

      return {
        employee,
        departmentName: department?.name,
      };
    })
  );

  return (
    <>
      <PageHeader
        eyebrow="Teamübersicht"
        title="Mitarbeiter"
        description={`Hier siehst du die Mitarbeiter, die für ${
          currentEmployee?.name ?? "den aktuellen Benutzer"
        } sichtbar sind.`}
        action={
          canCreateNewEmployee ? (
            <Link
              href="/mitarbeiter-erstellen"
              className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800"
            >
              Mitarbeiter hinzufügen
            </Link>
          ) : null
        }
      />

      <EmployeeDepartmentFilter
        departments={visibleDepartments.map((department) => ({
          id: department.id,
          name: department.name,
        }))}
        selectedDepartmentId={selectedDepartmentId}
        disabled={filterDisabled}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {employeesWithDepartments.map(({ employee, departmentName }) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            departmentName={departmentName}
          />
        ))}

        {employeesWithDepartments.length === 0 ? (
          <article className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">Keine Mitarbeiter gefunden</h2>
            <p className="mt-2 text-slate-600">
              Für die aktuelle Auswahl sind keine Mitarbeiter sichtbar.
            </p>
          </article>
        ) : null}
      </section>
    </>
  );
}