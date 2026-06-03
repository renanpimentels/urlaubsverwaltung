import { EmployeeCard } from "@/components/EmployeeCard";
import { PageHeader } from "@/components/PageHeader";
import { currentUser } from "@/lib/current-user";
import {
  getEmployeeById,
  getVisibleEmployeesForUser,
} from "@/lib/mock-queries";

import Link from "next/link";

export default function EmployeesPage() {
  const currentEmployee = getEmployeeById(currentUser.employeeId);

  const visibleEmployees = getVisibleEmployeesForUser(
    currentUser.employeeId,
    currentUser.role
  );

  const canCreateEmployee = currentUser.role === "admin";

  return (
    <>
      <PageHeader
        eyebrow="Teamübersicht"
        title="Mitarbeiter"
        description={`Hier siehst du die Mitarbeiter, die für ${
          currentEmployee?.name ?? "den aktuellen Benutzer"
        } sichtbar sind.`}
        action={
          canCreateEmployee ? (
            <Link
              href="/mitarbeiter-erstellen"
              className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800"
            >
              Mitarbeiter hinzufügen
            </Link>
          ) : null
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleEmployees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}

        {visibleEmployees.length === 0 ? (
          <article className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">Keine Mitarbeiter gefunden</h2>
            <p className="mt-2 text-slate-600">
              Für den aktuellen Benutzer sind keine Mitarbeiter sichtbar.
            </p>
          </article>
        ) : null}
      </section>
    </>
  );
}