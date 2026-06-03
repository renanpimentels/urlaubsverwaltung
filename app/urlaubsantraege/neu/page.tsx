"use client";

import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { VacationBalanceCard } from "@/components/VacationBalanceCard";
import { VacationRequestForm } from "@/components/VacationRequestForm";
import { currentUser } from "@/lib/current-user";
import {
  getSelectableEmployeesForVacationRequest,
  getVacationBalanceByEmployeeId,
} from "@/lib/mock-queries";
import type { AbsenceType } from "@/lib/types";

export default function NewVacationRequestPage() {
  const selectableEmployees = getSelectableEmployeesForVacationRequest(
    currentUser.employeeId,
    currentUser.role
  );

  const defaultEmployeeId = selectableEmployees[0]?.id ?? currentUser.employeeId;

  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState(defaultEmployeeId);
  const [requestedDays, setRequestedDays] = useState(0);
  const [selectedAbsenceType, setSelectedAbsenceType] =
    useState<AbsenceType>("Urlaub");

  const vacationBalance = getVacationBalanceByEmployeeId(selectedEmployeeId);

  const consumesVacationBalance = selectedAbsenceType === "Urlaub";

  const requestedVacationDays =
    consumesVacationBalance && requestedDays > 0 ? requestedDays : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Neuer Antrag"
        title="Urlaubsantrag erstellen"
        description="Erfasse einen neuen Urlaubsantrag. In dieser Mockup-Version werden die Daten noch nicht gespeichert."
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <VacationRequestForm
          selectableEmployees={selectableEmployees}
          defaultEmployeeId={defaultEmployeeId}
          onEmployeeChange={setSelectedEmployeeId}
          onRequestedDaysChange={setRequestedDays}
          onAbsenceTypeChange={setSelectedAbsenceType}
        />

        {vacationBalance ? (
          <VacationBalanceCard
            total={vacationBalance.total}
            used={vacationBalance.used}
            pending={vacationBalance.pending}
            available={vacationBalance.available}
            requestedDays={requestedVacationDays}
            description="Mockup-Übersicht für den aktuell ausgewählten Mitarbeiter."
          />
        ) : null}
      </section>
    </>
  );
}