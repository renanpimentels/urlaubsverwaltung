"use client";

import { useState, useTransition } from "react";

import { createDepartmentAction } from "@/lib/actions/settings-actions";
import type { Employee } from "@/lib/types";

type DepartmentCreateFormProps = {
  employees: Employee[];
};

export function DepartmentCreateForm({ employees }: DepartmentCreateFormProps) {
  const [name, setName] = useState("");
  const [managerId, setManagerId] = useState(employees[0]?.id ?? "");
  const [finalApproverId, setFinalApproverId] = useState("");
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

    if (!managerId) {
      setErrorMessage("Bitte wähle einen Manager aus.");
      return;
    }

    if (finalApproverId && finalApproverId === managerId) {
      setErrorMessage(
        "Manager und finaler Freigeber sollten unterschiedliche Personen sein."
      );
      return;
    }

    startTransition(async () => {
      try {
        const result = await createDepartmentAction({
          name,
          managerId,
          finalApproverId,
        });

        setName("");
        setManagerId(employees[0]?.id ?? "");
        setFinalApproverId("");
        setMessage(result.message);
      } catch {
        setErrorMessage("Die Abteilung konnte nicht erstellt werden.");
      }
    });
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Neue Abteilung</h2>
        <p className="mt-1 text-sm text-slate-500">
          Erstelle eine neue Abteilung und lege direkt die Freigabeverantwortung
          fest.
        </p>
      </div>

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
            placeholder="z. B. Einkauf"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Manager
            </span>
            <select
              value={managerId}
              onChange={(event) => {
                setManagerId(event.target.value);
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
              value={finalApproverId}
              onChange={(event) => {
                setFinalApproverId(event.target.value);
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
          {isPending ? "Wird erstellt..." : "Abteilung erstellen"}
        </button>
      </div>
    </article>
  );
}