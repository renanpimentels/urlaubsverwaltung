"use client";

import { useState, useTransition } from "react";

import { updateDepartmentApproversAction } from "@/lib/actions/settings-actions";
import type { Employee } from "@/lib/types";

type DepartmentApproverFormProps = {
  departmentId: string;
  managerId: string;
  finalApproverId?: string | null;
  employees: Employee[];
};

export function DepartmentApproverForm({
  departmentId,
  managerId,
  finalApproverId,
  employees,
}: DepartmentApproverFormProps) {
  const [selectedManagerId, setSelectedManagerId] = useState(managerId);
  const [selectedFinalApproverId, setSelectedFinalApproverId] = useState(
    finalApproverId ?? ""
  );
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setMessage("");
    setErrorMessage("");

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

    startTransition(async () => {
      try {
        const result = await updateDepartmentApproversAction({
          departmentId,
          managerId: selectedManagerId,
          finalApproverId: selectedFinalApproverId,
        });

        setMessage(result.message);
      } catch {
        setErrorMessage(
          "Die Freigaberegeln konnten nicht gespeichert werden."
        );
      }
    });
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-xs font-semibold text-slate-500">Manager</span>
          <select
            value={selectedManagerId}
            onChange={(event) => {
              setSelectedManagerId(event.target.value);
              setMessage("");
              setErrorMessage("");
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Final Approver
          </span>
          <select
            value={selectedFinalApproverId}
            onChange={(event) => {
              setSelectedFinalApproverId(event.target.value);
              setMessage("");
              setErrorMessage("");
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
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

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="w-fit rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Speichert..." : "Speichern"}
        </button>

        {message ? (
          <p className="text-xs font-medium text-green-700">{message}</p>
        ) : null}

        {errorMessage ? (
          <p className="text-xs font-medium text-red-700">{errorMessage}</p>
        ) : null}
      </div>
    </div>
  );
}