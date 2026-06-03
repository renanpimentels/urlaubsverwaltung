"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { AbsenceType, Employee } from "@/lib/types";
import { calculateBusinessDays } from "@/lib/vacation-calculations";

type FormState = {
  employeeId: string;
  startDate: string;
  endDate: string;
  absenceType: AbsenceType;
  comment: string;
};

type VacationRequestFormProps = {
  selectableEmployees: Employee[];
  defaultEmployeeId: string;
  onEmployeeChange?: (employeeId: string) => void;
  onRequestedDaysChange?: (requestedDays: number) => void;
  onAbsenceTypeChange?: (absenceType: AbsenceType) => void;
};

const initialFormState: FormState = {
  employeeId: "",
  startDate: "",
  endDate: "",
  absenceType: "Urlaub",
  comment: "",
};

export function VacationRequestForm({
  selectableEmployees,
  defaultEmployeeId,
  onEmployeeChange,
  onRequestedDaysChange,
  onAbsenceTypeChange,
}: VacationRequestFormProps) {
  const [formData, setFormData] = useState<FormState>({
    ...initialFormState,
    employeeId: defaultEmployeeId,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const requestedDays = calculateBusinessDays(
    formData.startDate,
    formData.endDate
  );

  const isEmployeeSelectionDisabled = selectableEmployees.length <= 1;

  useEffect(() => {
    onRequestedDaysChange?.(requestedDays);
  }, [onRequestedDaysChange, requestedDays]);

  useEffect(() => {
    onEmployeeChange?.(formData.employeeId);
  }, [formData.employeeId, onEmployeeChange]);

  useEffect(() => {
    onAbsenceTypeChange?.(formData.absenceType);
  }, [formData.absenceType, onAbsenceTypeChange]);

  function updateField(field: keyof FormState, value: string) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  function updateAbsenceType(value: AbsenceType) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      absenceType: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleSubmit() {
    if (!formData.employeeId) {
      setErrorMessage("Bitte wähle einen Mitarbeiter aus.");
      return;
    }

    if (!formData.startDate) {
      setErrorMessage("Bitte wähle ein Startdatum aus.");
      return;
    }

    if (!formData.endDate) {
      setErrorMessage("Bitte wähle ein Enddatum aus.");
      return;
    }

    if (formData.endDate < formData.startDate) {
      setErrorMessage("Das Enddatum darf nicht vor dem Startdatum liegen.");
      return;
    }

    if (requestedDays <= 0) {
      setErrorMessage(
        "Für den ausgewählten Zeitraum wurden keine Abwesenheitstage berechnet."
      );
      return;
    }

    setSuccessMessage(
      `Der Antrag über ${requestedDays} Abwesenheitstage wurde erfolgreich vorbereitet. In dieser Mockup-Version wird er noch nicht gespeichert.`
    );
  }

  return (
    <form className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Antragsdaten</h2>
        <p className="mt-1 text-sm text-slate-500">
          Wähle Zeitraum, Abwesenheitsart und füge optional eine Bemerkung
          hinzu.
        </p>
      </div>

      <div className="grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Mitarbeiter
          </span>

          <select
            value={formData.employeeId}
            disabled={isEmployeeSelectionDisabled}
            onChange={(event) => updateField("employeeId", event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600 disabled:bg-slate-100 disabled:text-slate-500"
          >
            {selectableEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>

          {isEmployeeSelectionDisabled ? (
            <p className="text-sm text-slate-500">
              Für normale Mitarbeiter ist nur der eigene Antrag möglich.
            </p>
          ) : null}
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Startdatum
            </span>
            <input
              type="date"
              value={formData.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Enddatum
            </span>
            <input
              type="date"
              value={formData.endDate}
              onChange={(event) => updateField("endDate", event.target.value)}
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
                Wochenenden werden in dieser Mockup-Version nicht mitgezählt.
                Feiertage werden später ergänzt.
              </p>

              {formData.absenceType === "Sonderurlaub" ? (
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
            value={formData.absenceType}
            onChange={(event) =>
              updateAbsenceType(event.target.value as AbsenceType)
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
            value={formData.comment}
            onChange={(event) => updateField("comment", event.target.value)}
            placeholder="Optionale Bemerkung zum Antrag..."
            className="resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
          />
        </label>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            Antrag erstellen
          </button>

          <Link
            href="/urlaubsantraege"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
          >
            Abbrechen
          </Link>
        </div>
      </div>
    </form>
  );
}