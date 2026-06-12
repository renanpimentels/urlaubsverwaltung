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
  const [approvalStepsRequired, setApprovalStepsRequired] = useState(2);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const isTwoStepApproval = approvalStepsRequired === 2;

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

    if (isTwoStepApproval && !finalApproverId) {
      setErrorMessage(
        "Bitte wähle einen finalen Freigeber für die zweistufige Freigabe aus."
      );
      return;
    }

    if (isTwoStepApproval && finalApproverId === managerId) {
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
          finalApproverId: isTwoStepApproval ? finalApproverId : "",
          approvalStepsRequired,
        });

        setName("");
        setManagerId(employees[0]?.id ?? "");
        setFinalApproverId("");
        setApprovalStepsRequired(2);
        setMessage(result.message);
      } catch {
        setErrorMessage("Die Abteilung konnte nicht erstellt werden.");
      }
    });
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-950">
          Neue Abteilung
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Abteilung erstellen und Freigabeverantwortung festlegen.
        </p>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">
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
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">
              Freigabestufen
            </span>
            <select
              value={approvalStepsRequired}
              onChange={(event) => {
                const nextApprovalStepsRequired = Number(event.target.value);

                setApprovalStepsRequired(nextApprovalStepsRequired);

                if (nextApprovalStepsRequired === 1) {
                  setFinalApproverId("");
                }

                resetMessages();
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
            >
              <option value={1}>1 Stufe</option>
              <option value={2}>2 Stufen</option>
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">
              Manager
            </span>
            <select
              value={managerId}
              onChange={(event) => {
                setManagerId(event.target.value);
                resetMessages();
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">
              Final Approver
            </span>
            <select
              value={finalApproverId}
              onChange={(event) => {
                setFinalApproverId(event.target.value);
                resetMessages();
              }}
              disabled={!isTwoStepApproval}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="">
                {isTwoStepApproval ? "Bitte auswählen" : "Nicht erforderlich"}
              </option>

              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="text-xs leading-5 text-slate-500">
          Bei einer Stufe genehmigt der Manager final. Bei zwei Stufen wird
          zusätzlich ein finaler Freigeber benötigt.
        </p>

        {message ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="w-fit rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Wird erstellt..." : "Abteilung erstellen"}
        </button>
      </div>
    </article>
  );
}