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

  function handleSubmit() {
    const parsedValue = Number(value);

    setMessage("");
    setErrorMessage("");

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
    <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-end">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">
          Standard-Jahresurlaub
        </span>
        <input
          type="number"
          min={1}
          max={60}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setMessage("");
            setErrorMessage("");
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
          {isPending ? "Wird gespeichert..." : "Einstellungen speichern"}
        </button>

        {message ? (
          <p className="text-sm font-medium text-green-700">{message}</p>
        ) : null}

        {errorMessage ? (
          <p className="text-sm font-medium text-red-700">{errorMessage}</p>
        ) : null}
      </div>
    </div>
  );
}