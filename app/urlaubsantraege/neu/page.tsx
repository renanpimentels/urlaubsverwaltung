import { PageHeader } from "@/components/PageHeader";
import { VacationBalanceCard } from "@/components/VacationBalanceCard";
import { VacationRequestForm } from "@/components/VacationRequestForm";

export default function NewVacationRequestPage() {
  return (
    <>
      <PageHeader
        eyebrow="Neuer Antrag"
        title="Urlaubsantrag erstellen"
        description="Erfasse einen neuen Urlaubsantrag. In dieser Mockup-Version werden die Daten noch nicht gespeichert."
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <VacationRequestForm />

        <VacationBalanceCard
          total={30}
          used={8}
          pending={10}
          available={12}
          description="Mockup-Übersicht für den aktuell ausgewählten Mitarbeiter."
        />
      </section>
    </>
  );
}