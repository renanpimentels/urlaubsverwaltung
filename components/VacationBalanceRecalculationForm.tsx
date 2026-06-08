"use client";

import { useState, useTransition } from "react";

import { recalculateVacationBalancesAction } from "@/lib/actions/vacation-balance-recalculation-actions";

type VacationBalanceRecalculationFormProps = {
  currentYear: number;
};

export function VacationBalanceRecalculationForm({
  currentYear,
}: VacationBalanceRecalculationFormProps) {
  const [year, setYear] = useState(String(currentYear));
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetMessages() {
    setMessage("");
    setErrorMessage("");
  }

  function handleSubmit() {
    resetMessages();

    const parsedYear = Number(year);

    if (!Number.isInteger(parsedYear)) {
      setErrorMessage("Bitte gib ein gültiges Jahr ein.");
      return;
    }

    if (parsedYear < 2000 || parsedYear > currentYear + 2) {
      setErrorMessage(
        `Das Jahr muss zwischen 2000 und ${currentYear + 2} liegen.`
      );
      return;
    }

    startTransition(async () => {
      try {
        const result = await recalculateVacationBalancesAction({
          year: parsedYear,
        });

        setMessage(result.message);
      } catch {
        setErrorMessage("Die Urlaubssalden konnten nicht neu berechnet werden.");
      }
    });
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Urlaubssalden neu berechnen</h2>
        <p className="mt-1 text-sm text-slate-500">
          Berechnet die Urlaubssalden aktiver Mitarbeiter für ein Jahr neu,
          basierend auf genehmigten und ausstehenden Urlaubsanträgen.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Jahr</span>
          <input
            type="number"
            min={2000}
            max={currentYear + 2}
            value={year}
            onChange={(event) => {
              setYear(event.target.value);
              resetMessages();
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
          />
        </label>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-fit rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Wird berechnet..." : "Salden neu berechnen"}
          </button>

          {message ? (
            <p className="text-sm font-medium text-green-700">{message}</p>
          ) : null}

          {errorMessage ? (
            <p className="text-sm font-medium text-red-700">{errorMessage}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-800">Hinweis</p>
        <p className="mt-2 text-sm text-amber-700">
          Diese Aktion überschreibt used, pending, total und available für das
          gewählte Jahr. Der Wert carriedOver bleibt erhalten.
        </p>
      </div>
    </article>
  );
}