"use client";

import { useState, useTransition } from "react";

import { createVacationRequestAction } from "@/lib/actions/vacation-request-create-actions";
import { calculateBusinessDays } from "@/lib/vacation-calculations";
import type { AbsenceType, Employee } from "@/lib/types";

type VacationRequestFormProps = {
  selectableEmployees: Employee[];
  defaultEmployeeId: string;
  onEmployeeChange?: (employeeId: string) => void;
  onRequestedDaysChange?: (days: number) => void;
  onAbsenceTypeChange?: (absenceType: AbsenceType) => void;
};

export function VacationRequestForm({
  selectableEmployees,
  defaultEmployeeId,
  onEmployeeChange,
  onRequestedDaysChange,
  onAbsenceTypeChange,
}: VacationRequestFormProps) {
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId);
  const [absenceType, setAbsenceType] = useState<AbsenceType>("Urlaub");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const requestedDays = calculateBusinessDays(startDate, endDate);

  function handleEmployeeChange(value: string) {
    setEmployeeId(value);
    setErrorMessage("");
    onEmployeeChange?.(value);
  }

  function handleAbsenceTypeChange(value: AbsenceType) {
    setAbsenceType(value);
    setErrorMessage("");
    onAbsenceTypeChange?.(value);
  }

  function handleStartDateChange(value: string) {
    setStartDate(value);
    setErrorMessage("");

    const days = calculateBusinessDays(value, endDate);
    onRequestedDaysChange?.(days);
  }

  function handleEndDateChange(value: string) {
    setEndDate(value);
    setErrorMessage("");

    const days = calculateBusinessDays(startDate, value);
    onRequestedDaysChange?.(days);
  }

  function handleSubmit() {
    if (!employeeId) {
      setErrorMessage("Bitte wähle einen Mitarbeiter aus.");
      return;
    }

    if (!startDate) {
      setErrorMessage("Bitte wähle ein Startdatum aus.");
      return;
    }

    if (!endDate) {
      setErrorMessage("Bitte wähle ein Enddatum aus.");
      return;
    }

    if (endDate < startDate) {
      setErrorMessage("Das Enddatum darf nicht vor dem Startdatum liegen.");
      return;
    }

    if (requestedDays <= 0) {
      setErrorMessage(
        "Für den ausgewählten Zeitraum wurden keine Abwesenheitstage berechnet."
      );
      return;
    }

    startTransition(async () => {
      try {
        await createVacationRequestAction({
          employeeId,
          absenceType,
          startDate,
          endDate,
          comment,
        });
      } catch {
        setErrorMessage("Der Antrag konnte nicht erstellt werden. Prüfe bitte die Unternehmensrichtlinien, den verfügbaren Urlaubssaldo oder mögliche Überschneidungen.");
      }
    });
  }

  return (
    <form className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Antragsdaten</h2>
        <p className="mt-1 text-sm text-slate-500">
          Wähle Zeitraum, Abwesenheitsart und Mitarbeiter aus.
        </p>
      </div>

      <div className="grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Mitarbeiter
          </span>
          <select
            value={employeeId}
            onChange={(event) => handleEmployeeChange(event.target.value)}
            disabled={selectableEmployees.length <= 1}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600 disabled:bg-slate-100 disabled:text-slate-500"
          >
            {selectableEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Startdatum
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => handleStartDateChange(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Enddatum
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => handleEndDateChange(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">
            Zeitraum-Auswertung
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Beantragte Abwesenheitstage
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-950">
                {requestedDays}
              </p>
            </div>

            <div className="max-w-sm text-sm text-slate-500">
              <p>
                Wochenenden werden in dieser Version nicht mitgezählt. Feiertage
                werden später ergänzt.
              </p>

              {absenceType === "Sonderurlaub" ? (
                <p className="mt-2 text-amber-700">
                  Sonderurlaub wird als Abwesenheit berechnet, reduziert aber
                  den regulären Urlaubssaldo nicht automatisch.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Abwesenheitsart
          </span>
          <select
            value={absenceType}
            onChange={(event) =>
              handleAbsenceTypeChange(event.target.value as AbsenceType)
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
          >
            <option value="Urlaub">Urlaub</option>
            <option value="Sonderurlaub">Sonderurlaub</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Bemerkung
          </span>
          <textarea
            rows={5}
            value={comment}
            onChange={(event) => {
              setComment(event.target.value);
              setErrorMessage("");
            }}
            placeholder="Optionale Bemerkung zum Antrag..."
            className="resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
          />
        </label>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Wird erstellt..." : "Antrag erstellen"}
          </button>
        </div>
      </div>
    </form>
  );
}