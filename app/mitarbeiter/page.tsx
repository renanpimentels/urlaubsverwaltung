import { EmployeeCard } from "@/components/EmployeeCard";
import { PageHeader } from "@/components/PageHeader";
import { employees } from "@/lib/mock-data";

export default function EmployeesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Teamübersicht"
        title="Mitarbeiter"
        description="Übersicht über Mitarbeiter, Abteilungen und Urlaubssalden."
        action={
          <button className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800">
            Mitarbeiter hinzufügen
          </button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </section>
    </>
  );
}