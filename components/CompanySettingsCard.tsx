"use client";

import { useState } from "react";

import type { CompanySettings } from "@/lib/types";

type CompanySettingsCardProps = {
  companySettings: CompanySettings;
};

export function CompanySettingsCard({
  companySettings,
}: CompanySettingsCardProps) {
  const [defaultVacationDaysPerYear, setDefaultVacationDaysPerYear] = useState(
    companySettings.defaultVacationDaysPerYear
  );
  const [successMessage, setSuccessMessage] = useState("");

  function handleSave() {
    setSuccessMessage(
      "Die globalen Urlaubseinstellungen wurden lokal aktualisiert. In dieser Mockup-Version werden sie noch nicht dauerhaft gespeichert."
    );
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Globale Urlaubseinstellungen</h2>
        <p className="mt-1 text-sm text-slate-500">
          Diese Werte dienen als Standard für neue Mitarbeiter.
        </p>
      </div>

      {successMessage ? (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-[1fr_auto] md:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Globaler Jahresurlaub
          </span>

          <input
            type="number"
            min={0}
            value={defaultVacationDaysPerYear}
            onChange={(event) => {
              setDefaultVacationDaysPerYear(Number(event.target.value));
              setSuccessMessage("");
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
          />

          <span className="text-sm text-slate-500">
            Beim Anlegen eines neuen Mitarbeiters wird dieser Wert als
            vertraglicher Jahresurlaub vorgeschlagen und kann individuell
            angepasst werden.
          </span>
        </label>

        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800"
        >
          Speichern
        </button>
      </div>
    </article>
  );
}