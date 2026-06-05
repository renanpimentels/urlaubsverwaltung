import { PageHeader } from "@/components/PageHeader";
import { VacationBalanceCard } from "@/components/VacationBalanceCard";
import { VacationRequestForm } from "@/components/VacationRequestForm";
import { getCurrentUserFromDb } from "@/lib/current-user-server";
import {
  getSelectableEmployeesForVacationRequestFromDb,
  getVacationBalanceByEmployeeIdFromDb,
} from "@/lib/prisma-queries";

export default async function NewVacationRequestPage() {
  const currentUser = await getCurrentUserFromDb();

  const selectableEmployees = await getSelectableEmployeesForVacationRequestFromDb(
    currentUser.employeeId,
    currentUser.role
  );

  const defaultEmployeeId =
    currentUser.employeeId &&
    selectableEmployees.some((employee) => employee.id === currentUser.employeeId)
      ? currentUser.employeeId
      : selectableEmployees[0]?.id ?? "";

  const vacationBalance = defaultEmployeeId
    ? await getVacationBalanceByEmployeeIdFromDb(defaultEmployeeId)
    : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Neuer Antrag"
        title="Urlaubsantrag erstellen"
        description="Erfasse einen neuen Urlaubsantrag."
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <VacationRequestForm
          selectableEmployees={selectableEmployees}
          defaultEmployeeId={defaultEmployeeId}
        />

        {vacationBalance ? (
          <VacationBalanceCard
            total={vacationBalance.total}
            used={vacationBalance.used}
            pending={vacationBalance.pending}
            available={vacationBalance.available}
            description="Übersicht für den vorausgewählten Mitarbeiter."
          />
        ) : (
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Urlaubssaldo</h2>
            <p className="mt-2 text-sm text-slate-500">
              Wähle einen Mitarbeiter aus, um den Urlaubssaldo zu prüfen.
            </p>
          </aside>
        )}
      </section>
    </>
  );
}