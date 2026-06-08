"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { updateEmployeeAction } from "@/lib/actions/employee-edit-actions";
import type { CompanySettings, Department, Employee } from "@/lib/types";

type EmployeeEditFormProps = {
  employee: Employee;
  email: string;
  departments: Department[];
  companySettings: CompanySettings;
};

type FormState = {
  name: string;
  email: string;
  departmentId: string;
  position: string;
  employmentStartDate: string;
  contractVacationDaysPerYear: number;
  isActive: boolean;
};

export function EmployeeEditForm({
  employee,
  email,
  departments,
  companySettings,
}: EmployeeEditFormProps) {
  const [formData, setFormData] = useState<FormState>({
    name: employee.name,
    email,
    departmentId: employee.departmentId,
    position: employee.role,
    employmentStartDate: employee.employmentStartDate,
    contractVacationDaysPerYear: employee.contractVacationDaysPerYear,
    isActive: employee.isActive,
  });

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetMessages() {
    setMessage("");
    setErrorMessage("");
  }

  function updateField(field: keyof FormState, value: string | number | boolean) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }));

    resetMessages();
  }

  function handleSubmit() {
    resetMessages();

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
        const result = await updateEmployeeAction({
          employeeId: employee.id,
          name: formData.name,
          email: formData.email,
          departmentId: formData.departmentId,
          position: formData.position,
          employmentStartDate: formData.employmentStartDate,
          contractVacationDaysPerYear:
            formData.contractVacationDaysPerYear,
          isActive: formData.isActive,
        });

        setMessage(result.message);
        } catch {
          setErrorMessage(
            "Der Mitarbeiter konnte nicht gespeichert werden. Prüfe bitte die Eingaben, ob die E-Mail bereits verwendet wird, ob offene Anträge bestehen oder ob der Mitarbeiter noch als Manager/Final Approver einer aktiven Abteilung eingetragen ist."
          );
        }
    });
  }

  return (
    <form className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Mitarbeiter bearbeiten</h2>
        <p className="mt-1 text-sm text-slate-500">
          Bearbeite Stammdaten, Vertragsinformationen und Benutzerzugang.
        </p>
      </div>

      <div className="grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Name</span>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">E-Mail</span>
          <input
            type="email"
            value={formData.email}
            onChange={(event) => updateField("email", event.target.value)}
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

        <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(event) => updateField("isActive", event.target.checked)}
            className="mt-1 h-5 w-5"
          />

          <span>
            <span className="block font-semibold text-slate-700">
              Mitarbeiter ist aktiv
            </span>
            <span className="text-sm text-slate-500">
              Wenn deaktiviert, wird auch der verknüpfte Benutzerzugang
              deaktiviert.
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

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Wird gespeichert..." : "Änderungen speichern"}
          </button>

          <Link
            href={`/mitarbeiter/${employee.id}`}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
          >
            Zurück zum Profil
          </Link>
        </div>
      </div>
    </form>
  );
}