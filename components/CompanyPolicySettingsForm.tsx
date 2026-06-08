"use client";

import { useState, useTransition } from "react";

import { updateCompanyPolicySettingsAction } from "@/lib/actions/settings-actions";

type CompanyPolicySettingsFormProps = {
  allowPastVacationRequests: boolean;
  requireVacationRequestComment: boolean;
  minimumNoticeDays: number;
  allowHalfVacationDays: boolean;
};

export function CompanyPolicySettingsForm({
  allowPastVacationRequests,
  requireVacationRequestComment,
  minimumNoticeDays,
  allowHalfVacationDays,
}: CompanyPolicySettingsFormProps) {
  const [allowPast, setAllowPast] = useState(allowPastVacationRequests);
  const [requireComment, setRequireComment] = useState(
    requireVacationRequestComment
  );
  const [noticeDays, setNoticeDays] = useState(String(minimumNoticeDays));
  const [allowHalfDays, setAllowHalfDays] = useState(allowHalfVacationDays);
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
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Unternehmensrichtlinien</h2>
        <p className="mt-1 text-sm text-slate-500">
          Definiere Regeln für das Erstellen und Bearbeiten von
          Urlaubsanträgen.
        </p>
      </div>

      <div className="grid gap-4">
        <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={allowPast}
            onChange={(event) => {
              setAllowPast(event.target.checked);
              resetMessages();
            }}
            className="mt-1 h-5 w-5"
          />

          <span>
            <span className="block font-semibold text-slate-700">
              Anträge in der Vergangenheit erlauben
            </span>
            <span className="text-sm text-slate-500">
              Wenn deaktiviert, dürfen neue Anträge nicht vor dem heutigen Datum
              beginnen.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={requireComment}
            onChange={(event) => {
              setRequireComment(event.target.checked);
              resetMessages();
            }}
            className="mt-1 h-5 w-5"
          />

          <span>
            <span className="block font-semibold text-slate-700">
              Kommentar beim Antrag erforderlich
            </span>
            <span className="text-sm text-slate-500">
              Wenn aktiviert, müssen Mitarbeiter beim Erstellen oder Bearbeiten
              eines Antrags eine Bemerkung eingeben.
            </span>
          </span>
        </label>

        <label className="grid gap-2 rounded-2xl bg-slate-50 p-4">
          <span className="text-sm font-semibold text-slate-700">
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
            className="max-w-56 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
          />
          <span className="text-sm text-slate-500">
            Anzahl der Tage zwischen Antragstellung und erstem Urlaubstag. 0
            bedeutet keine Mindestvorlaufzeit.
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={allowHalfDays}
            onChange={(event) => {
              setAllowHalfDays(event.target.checked);
              resetMessages();
            }}
            className="mt-1 h-5 w-5"
          />

          <span>
            <span className="block font-semibold text-slate-700">
              Halbe Urlaubstage erlauben
            </span>
            <span className="text-sm text-slate-500">
              Diese Option wird gespeichert, aber die konkrete Eingabe halber
              Tage wird später umgesetzt.
            </span>
          </span>
        </label>

        {message ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="w-fit rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Wird gespeichert..." : "Richtlinien speichern"}
        </button>
      </div>
    </article>
  );
}