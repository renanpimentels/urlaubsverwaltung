import { PageHeader } from "@/components/PageHeader";
import { VacationBalanceCard } from "@/components/VacationBalanceCard";
import { VacationRequestForm } from "@/components/VacationRequestForm";
//import { vacationBalances } from "@/lib/mock-data";
import { getVacationBalanceByEmployeeId } from "@/lib/mock-queries";

const currentEmployeeId = "emp-001";

export default function NewVacationRequestPage() {
  
  const vacationBalance = getVacationBalanceByEmployeeId(currentEmployeeId);

  return (
    <>
      <PageHeader
        eyebrow="Neuer Antrag"
        title="Urlaubsantrag erstellen"
        description="Erfasse einen neuen Urlaubsantrag. In dieser Mockup-Version werden die Daten noch nicht gespeichert."
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <VacationRequestForm />

        {vacationBalance ? (
          <VacationBalanceCard
            total={vacationBalance.total}
            used={vacationBalance.used}
            pending={vacationBalance.pending}
            available={vacationBalance.available}
            description="Mockup-Übersicht für den aktuell ausgewählten Mitarbeiter."
          />
        ) : null}
      </section>
    </>
  );
}