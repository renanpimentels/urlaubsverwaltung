"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { createEmployeeAction } from "@/lib/actions/employee-create-actions";
import type { CompanySettings, Department } from "@/lib/types";

type FormState = {
  name: string;
  email: string;
  departmentId: string;
  position: string;
  employmentStartDate: string;
  contractVacationDaysPerYear: number;
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
    email: "",
    departmentId: departments[0]?.id ?? "",
    position: "",
    employmentStartDate: "",
    contractVacationDaysPerYear:
      companySettings.defaultVacationDaysPerYear,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateField(field: keyof FormState, value: string | number) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }));

    setErrorMessage("");
  }

  function handleSubmit() {
    if (!formData.name.trim()) {
      setErrorMessage("Bitte gib einen Namen ein.");
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage("Bitte gib eine E-Mail-Adresse ein.");
      return;
    }

    if (!formData.departmentId) {
      setErrorMessage("Bitte wähle eine Abteilung aus.");
      return;
    }

    if (!formData.position.trim()) {
      setErrorMessage("Bitte gib eine Position ein.");
      return;
    }

    if (!formData.employmentStartDate) {
      setErrorMessage("Bitte wähle ein Eintrittsdatum aus.");
      return;
    }

    if (
      !Number.isInteger(formData.contractVacationDaysPerYear) ||
      formData.contractVacationDaysPerYear < 1 ||
      formData.contractVacationDaysPerYear > 60
    ) {
      setErrorMessage(
        "Der vertragliche Jahresurlaub muss zwischen 1 und 60 Tagen liegen."
      );
      return;
    }

    startTransition(async () => {
      try {
        await createEmployeeAction({
          name: formData.name,
          email: formData.email,
          departmentId: formData.departmentId,
          position: formData.position,
          employmentStartDate: formData.employmentStartDate,
          contractVacationDaysPerYear:
            formData.contractVacationDaysPerYear,
        });
      } catch {
        setErrorMessage("Der Mitarbeiter konnte nicht erstellt werden.");
      }
    });
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

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">E-Mail</span>
          <input
            type="email"
            value={formData.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="z. B. holly.flax@example.com"
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
              value={formData.position}
              onChange={(event) => updateField("position", event.target.value)}
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
              max={60}
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

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Wird erstellt..." : "Mitarbeiter erstellen"}
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