"use client";

import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { VacationBalanceCard } from "@/components/VacationBalanceCard";
import { VacationRequestForm } from "@/components/VacationRequestForm";
import { getVacationBalanceByEmployeeId } from "@/lib/mock-queries";

const currentEmployeeId = "emp-001";

export default function NewVacationRequestPage() {
  const [requestedDays, setRequestedDays] = useState(0);

  const vacationBalance = getVacationBalanceByEmployeeId(currentEmployeeId);

  return (
    <>
      <PageHeader
        eyebrow="Neuer Antrag"
        title="Urlaubsantrag erstellen"
        description="Erfasse einen neuen Urlaubsantrag. In dieser Mockup-Version werden die Daten noch nicht gespeichert."
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <VacationRequestForm onRequestedDaysChange={setRequestedDays} />

        {vacationBalance ? (
          <VacationBalanceCard
            total={vacationBalance.total}
            used={vacationBalance.used}
            pending={vacationBalance.pending}
            available={vacationBalance.available}
            requestedDays={requestedDays > 0 ? requestedDays : undefined}
            description="Mockup-Übersicht für den aktuell ausgewählten Mitarbeiter."
          />
        ) : null}
      </section>
    </>
  );
}