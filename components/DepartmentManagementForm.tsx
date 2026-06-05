"use client";

import { useState, useTransition } from "react";

import { updateDepartmentAction } from "@/lib/actions/settings-actions";
import type { Employee } from "@/lib/types";

type DepartmentManagementFormProps = {
  departmentId: string;
  departmentName: string;
  managerId: string;
  finalApproverId?: string | null;
  isActive: boolean;
  activeEmployeeCount: number;
  employees: Employee[];
};

export function DepartmentManagementForm({
  departmentId,
  departmentName,
  managerId,
  finalApproverId,
  isActive,
  activeEmployeeCount,
  employees,
}: DepartmentManagementFormProps) {
  const [name, setName] = useState(departmentName);
  const [selectedManagerId, setSelectedManagerId] = useState(managerId);
  const [selectedFinalApproverId, setSelectedFinalApproverId] = useState(
    finalApproverId ?? ""
  );
  const [selectedIsActive, setSelectedIsActive] = useState(isActive);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetMessages() {
    setMessage("");
    setErrorMessage("");
  }

  function handleSubmit() {
    resetMessages();

    if (!name.trim()) {
      setErrorMessage("Bitte gib einen Namen für die Abteilung ein.");
      return;
    }

    if (!selectedManagerId) {
      setErrorMessage("Bitte wähle einen Manager aus.");
      return;
    }

    if (
      selectedFinalApproverId &&
      selectedFinalApproverId === selectedManagerId
    ) {
      setErrorMessage(
        "Manager und finaler Freigeber sollten unterschiedliche Personen sein."
      );
      return;
    }

    if (!selectedIsActive && activeEmployeeCount > 0) {
      setErrorMessage(
        "Diese Abteilung kann nicht inaktiv gesetzt werden, solange aktive Mitarbeiter zugeordnet sind."
      );
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateDepartmentAction({
          departmentId,
          name,
          managerId: selectedManagerId,
          finalApproverId: selectedFinalApproverId,
          isActive: selectedIsActive,
        });

        setMessage(result.message);
      } catch {
        setErrorMessage("Die Abteilung konnte nicht gespeichert werden.");
      }
    });
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">
          Abteilungsname
        </span>
        <input
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            resetMessages();
          }}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Manager</span>
          <select
            value={selectedManagerId}
            onChange={(event) => {
              setSelectedManagerId(event.target.value);
              resetMessages();
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Final Approver
          </span>
          <select
            value={selectedFinalApproverId}
            onChange={(event) => {
              setSelectedFinalApproverId(event.target.value);
              resetMessages();
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
          >
            <option value="">Nicht definiert</option>

            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-start gap-3 rounded-2xl bg-white p-4">
        <input
          type="checkbox"
          checked={selectedIsActive}
          onChange={(event) => {
            setSelectedIsActive(event.target.checked);
            resetMessages();
          }}
          className="mt-1 h-5 w-5"
        />

        <span>
          <span className="block font-semibold text-slate-700">
            Abteilung ist aktiv
          </span>
          <span className="text-sm text-slate-500">
            Inaktive Abteilungen können nicht für neue Mitarbeiter ausgewählt
            werden.
          </span>
        </span>
      </label>

      {!selectedIsActive && activeEmployeeCount > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Diese Abteilung hat noch {activeEmployeeCount} aktive Mitarbeiter und
          kann deshalb nicht inaktiv gesetzt werden.
        </div>
      ) : null}

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
        {isPending ? "Wird gespeichert..." : "Abteilung speichern"}
      </button>
    </div>
  );
}