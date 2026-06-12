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
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-950">
          Urlaubssalden neu berechnen
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Salden aktiver Mitarbeiter für ein Jahr neu berechnen.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">Jahr</span>
          <input
            type="number"
            min={2000}
            max={currentYear + 2}
            value={year}
            onChange={(event) => {
              setYear(event.target.value);
              resetMessages();
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500 md:max-w-32"
          />
        </label>

        <div className="grid gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-fit rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Wird berechnet..." : "Neu berechnen"}
          </button>

          {message ? (
            <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
              {message}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
        <p className="text-sm font-medium text-amber-800">Hinweis</p>
        <p className="mt-1 text-xs leading-5 text-amber-700">
          Diese Aktion überschreibt used, pending, total und available für das
          gewählte Jahr. CarriedOver bleibt erhalten.
        </p>
      </div>
    </article>
  );
}