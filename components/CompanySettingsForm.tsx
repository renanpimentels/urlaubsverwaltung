"use client";

import { useState, useTransition } from "react";

import { updateCompanySettingsAction } from "@/lib/actions/settings-actions";

type CompanySettingsFormProps = {
  defaultVacationDaysPerYear: number;
};

export function CompanySettingsForm({
  defaultVacationDaysPerYear,
}: CompanySettingsFormProps) {
  const [value, setValue] = useState(String(defaultVacationDaysPerYear));
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetMessages() {
    setMessage("");
    setErrorMessage("");
  }

  function handleSubmit() {
    const parsedValue = Number(value);

    resetMessages();

    if (!Number.isInteger(parsedValue)) {
      setErrorMessage("Bitte gib eine ganze Zahl ein.");
      return;
    }

    if (parsedValue < 1 || parsedValue > 60) {
      setErrorMessage("Der Wert muss zwischen 1 und 60 liegen.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateCompanySettingsAction({
          defaultVacationDaysPerYear: parsedValue,
        });

        setMessage(result.message);
      } catch {
        setErrorMessage(
          "Die globalen Urlaubseinstellungen konnten nicht gespeichert werden."
        );
      }
    });
  }

  return (
    <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
      <label className="grid gap-1.5">
        <span className="text-sm font-medium text-slate-700">
          Standard-Jahresurlaub
        </span>

        <input
          type="number"
          min={1}
          max={60}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
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
          {isPending ? "Wird gespeichert..." : "Speichern"}
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
  );
}