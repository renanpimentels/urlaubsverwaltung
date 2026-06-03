"use client";

import Link from "next/link";
import { useState } from "react";

import type { CompanySettings, Department } from "@/lib/types";

type FormState = {
  name: string;
  departmentId: string;
  role: string;
  employmentStartDate: string;
  contractVacationDaysPerYear: number;
  isActive: boolean;
};

type EmployeeFormProps = {
  departments: Department[];
  companySettings: CompanySettings;
};

export function EmployeeForm({
  departments,
  companySettings,
}: EmployeeFormProps) {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    departmentId: departments[0]?.id ?? "",
    role: "",
    employmentStartDate: "",
    contractVacationDaysPerYear:
      companySettings.defaultVacationDaysPerYear,
    isActive: true,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function updateField(
    field: keyof FormState,
    value: string | number | boolean
  ) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleSubmit() {
    if (!formData.name.trim()) {
      setErrorMessage("Bitte gib einen Namen ein.");
      return;
    }

    if (!formData.departmentId) {
      setErrorMessage("Bitte wähle eine Abteilung aus.");
      return;
    }

    if (!formData.role.trim()) {
      setErrorMessage("Bitte gib eine Position ein.");
      return;
    }

    if (!formData.employmentStartDate) {
      setErrorMessage("Bitte wähle ein Eintrittsdatum aus.");
      return;
    }

    if (formData.contractVacationDaysPerYear <= 0) {
      setErrorMessage(
        "Der vertragliche Jahresurlaub muss größer als 0 sein."
      );
      return;
    }

    setSuccessMessage(
      `Der Mitarbeiter "${formData.name}" wurde lokal vorbereitet. In dieser Mockup-Version wird er noch nicht gespeichert.`
    );
  }

  return (
    <form className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Mitarbeiterdaten</h2>
        <p className="mt-1 text-sm text-slate-500">
          Erfasse Stammdaten und Vertragsinformationen für einen neuen
          Mitarbeiter.
        </p>
      </div>

      <div className="grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Name</span>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="z. B. Holly Flax"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Abteilung
            </span>
            <select
              value={formData.departmentId}
              onChange={(event) =>
                updateField("departmentId", event.target.value)
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
            >
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Position
            </span>
            <input
              type="text"
              value={formData.role}
              onChange={(event) => updateField("role", event.target.value)}
              placeholder="z. B. HR Representative"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
            />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Eintrittsdatum
            </span>
            <input
              type="date"
              value={formData.employmentStartDate}
              onChange={(event) =>
                updateField("employmentStartDate", event.target.value)
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Vertraglicher Jahresurlaub
            </span>
            <input
              type="number"
              min={1}
              value={formData.contractVacationDaysPerYear}
              onChange={(event) =>
                updateField(
                  "contractVacationDaysPerYear",
                  Number(event.target.value)
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
            />
            <span className="text-sm text-slate-500">
              Standardwert aus Einstellungen:{" "}
              {companySettings.defaultVacationDaysPerYear} Tage.
            </span>
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(event) =>
              updateField("isActive", event.target.checked)
            }
            className="h-5 w-5"
          />
          <span>
            <span className="block font-semibold text-slate-700">
              Mitarbeiter ist aktiv
            </span>
            <span className="text-sm text-slate-500">
              Aktive Mitarbeiter können im System Urlaubsanträge erstellen.
            </span>
          </span>
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
            Mitarbeiter erstellen
          </button>

          <Link
            href="/mitarbeiter"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
          >
            Abbrechen
          </Link>
        </div>
      </div>
    </form>
  );
}