"use client";

import { useState, useTransition } from "react";

import { updateCompanyPolicySettingsAction } from "@/lib/actions/settings-actions";
import { germanFederalStates } from "@/lib/german-federal-states";

type CompanyPolicySettingsFormProps = {
  allowPastVacationRequests: boolean;
  requireVacationRequestComment: boolean;
  minimumNoticeDays: number;
  allowHalfVacationDays: boolean;
  federalState: string;
};

export function CompanyPolicySettingsForm({
  allowPastVacationRequests,
  requireVacationRequestComment,
  minimumNoticeDays,
  allowHalfVacationDays,
  federalState,
}: CompanyPolicySettingsFormProps) {
  const [allowPast, setAllowPast] = useState(allowPastVacationRequests);
  const [requireComment, setRequireComment] = useState(
    requireVacationRequestComment
  );
  const [noticeDays, setNoticeDays] = useState(String(minimumNoticeDays));
  const [allowHalfDays, setAllowHalfDays] = useState(allowHalfVacationDays);
  const [selectedFederalState, setSelectedFederalState] = useState(
    federalState || "NW"
  );
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetMessages() {
    setMessage("");
    setErrorMessage("");
  }

  function handleSubmit() {
    resetMessages();

    const parsedNoticeDays = Number(noticeDays);

    if (!Number.isInteger(parsedNoticeDays)) {
      setErrorMessage("Bitte gib eine gültige Anzahl von Tagen ein.");
      return;
    }

    if (parsedNoticeDays < 0 || parsedNoticeDays > 365) {
      setErrorMessage("Die Vorlaufzeit muss zwischen 0 und 365 Tagen liegen.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateCompanyPolicySettingsAction({
          allowPastVacationRequests: allowPast,
          requireVacationRequestComment: requireComment,
          minimumNoticeDays: parsedNoticeDays,
          allowHalfVacationDays: allowHalfDays,
          federalState: selectedFederalState,
        });

        setMessage(result.message);
      } catch {
        setErrorMessage(
          "Die Unternehmensrichtlinien konnten nicht gespeichert werden."
        );
      }
    });
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-950">
          Unternehmensrichtlinien
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Regeln für das Erstellen und Bearbeiten von Urlaubsanträgen.
        </p>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <span className="text-sm font-medium text-slate-700">Bundesland</span>
          <select
            value={selectedFederalState}
            onChange={(event) => {
              setSelectedFederalState(event.target.value);
              resetMessages();
            }}
            className="max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
          >
            {germanFederalStates.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
          <span className="text-xs leading-5 text-slate-500">
            Wird für die Berechnung gesetzlicher Feiertage verwendet.
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <input
            type="checkbox"
            checked={allowPast}
            onChange={(event) => {
              setAllowPast(event.target.checked);
              resetMessages();
            }}
            className="mt-1 h-4 w-4"
          />

          <span>
            <span className="block text-sm font-medium text-slate-700">
              Anträge in der Vergangenheit erlauben
            </span>
            <span className="text-xs leading-5 text-slate-500">
              Wenn deaktiviert, dürfen neue Anträge nicht vor dem heutigen Datum
              beginnen.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <input
            type="checkbox"
            checked={requireComment}
            onChange={(event) => {
              setRequireComment(event.target.checked);
              resetMessages();
            }}
            className="mt-1 h-4 w-4"
          />

          <span>
            <span className="block text-sm font-medium text-slate-700">
              Kommentar beim Antrag erforderlich
            </span>
            <span className="text-xs leading-5 text-slate-500">
              Mitarbeiter müssen beim Erstellen oder Bearbeiten eines Antrags
              eine Bemerkung eingeben.
            </span>
          </span>
        </label>

        <label className="grid gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <span className="text-sm font-medium text-slate-700">
            Mindestvorlaufzeit
          </span>
          <input
            type="number"
            min={0}
            max={365}
            value={noticeDays}
            onChange={(event) => {
              setNoticeDays(event.target.value);
              resetMessages();
            }}
            className="max-w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
          />
          <span className="text-xs leading-5 text-slate-500">
            Tage zwischen Antragstellung und erstem Urlaubstag. 0 bedeutet keine
            Mindestvorlaufzeit.
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <input
            type="checkbox"
            checked={allowHalfDays}
            onChange={(event) => {
              setAllowHalfDays(event.target.checked);
              resetMessages();
            }}
            className="mt-1 h-4 w-4"
          />

          <span>
            <span className="block text-sm font-medium text-slate-700">
              Halbe Urlaubstage erlauben
            </span>
            <span className="text-xs leading-5 text-slate-500">
              Diese Option wird gespeichert; die konkrete Eingabe halber Tage
              wird später umgesetzt.
            </span>
          </span>
        </label>

        {message ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="w-fit rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Wird gespeichert..." : "Richtlinien speichern"}
        </button>
      </div>
    </article>
  );
}