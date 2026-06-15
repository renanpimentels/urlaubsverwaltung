"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { updateVacationRequestAction } from "@/lib/actions/vacation-request-edit-actions";
import type { AbsenceType, VacationRequest } from "@/lib/types";
import { calculateBusinessDays } from "@/lib/vacation-calculations";

type VacationRequestEditFormProps = {
  request: VacationRequest;
};

type FormState = {
  startDate: string;
  endDate: string;
  absenceType: AbsenceType;
  comment: string;
};

export function VacationRequestEditForm({
  request,
}: VacationRequestEditFormProps) {
  const [formData, setFormData] = useState<FormState>({
    startDate: request.startDate,
    endDate: request.endDate,
    absenceType: request.absenceType,
    comment: request.comment ?? "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const requestedDays = calculateBusinessDays(
    formData.startDate,
    formData.endDate
  );

  function resetMessages() {
    setErrorMessage("");
    setSuccessMessage("");
  }

  function updateField(field: keyof FormState, value: string) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }));

    resetMessages();
  }

  function updateAbsenceType(value: AbsenceType) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      absenceType: value,
    }));

    resetMessages();
  }

  function handleSubmit() {
    resetMessages();

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

    startTransition(async () => {
      try {
        const result = await updateVacationRequestAction({
          requestId: request.id,
          absenceType: formData.absenceType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          comment: formData.comment,
        });

        setFormData({
          startDate: result.startDate,
          endDate: result.endDate,
          absenceType: result.absenceType,
          comment: result.comment,
        });

        setSuccessMessage(
          `${result.message} Neuer Zeitraum: ${result.days} Abwesenheitstage.`
        );
      } catch {
        setErrorMessage(
          "Der Antrag konnte nicht gespeichert werden. Prüfe bitte die Unternehmensrichtlinien, den verfügbaren Urlaubssaldo oder mögliche Überschneidungen."
        );
      }
    });
  }

  return (
    <form className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-950">
          Antrag bearbeiten
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Du kannst diesen Antrag bearbeiten, solange noch keine Freigabe erfolgt
          ist.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">
              Startdatum
            </span>
            <input
              type="date"
              value={formData.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">
              Enddatum
            </span>
            <input
              type="date"
              value={formData.endDate}
              onChange={(event) => updateField("endDate", event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
            />
          </label>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="text-sm font-medium text-slate-700">
            Zeitraum-Auswertung
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Beantragte Abwesenheitstage
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                {requestedDays}
              </p>
            </div>

            <div className="max-w-sm text-sm leading-6 text-slate-500">
              <p>
                Wochenenden werden in dieser Version nicht mitgezählt. Feiertage
                werden später ergänzt.
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

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">
            Abwesenheitsart
          </span>
          <select
            value={formData.absenceType}
            onChange={(event) =>
              updateAbsenceType(event.target.value as AbsenceType)
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
          >
            <option value="Urlaub">Urlaub</option>
            <option value="Sonderurlaub">Sonderurlaub</option>
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">Bemerkung</span>
          <textarea
            rows={4}
            value={formData.comment}
            onChange={(event) => updateField("comment", event.target.value)}
            placeholder="Optionale Bemerkung zum Antrag..."
            className="resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
          />
        </label>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Wird gespeichert..." : "Änderungen speichern"}
          </button>

          <Link
            href={`/urlaubsantraege/${request.id}`}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200"
          >
            Zurück zum Antrag
          </Link>
        </div>
      </div>
    </form>
  );
}