"use client";

import { useState } from "react";

import type { Department, Employee } from "@/lib/types";

type DepartmentSettingsListProps = {
  departments: Department[];
  employees: Employee[];
};

export function DepartmentSettingsList({
  departments,
  employees,
}: DepartmentSettingsListProps) {
  const [editableDepartments, setEditableDepartments] =
    useState<Department[]>(departments);
  const [successMessage, setSuccessMessage] = useState("");

  function updateDepartmentManager(departmentId: string, managerId: string) {
    setEditableDepartments((currentDepartments) =>
      currentDepartments.map((department) =>
        department.id === departmentId
          ? {
              ...department,
              managerId,
            }
          : department
      )
    );

    setSuccessMessage("");
  }

  function updateDepartmentFinalApprover(
    departmentId: string,
    finalApproverId: string
  ) {
    setEditableDepartments((currentDepartments) =>
      currentDepartments.map((department) =>
        department.id === departmentId
          ? {
              ...department,
              finalApproverId:
                finalApproverId.length > 0 ? finalApproverId : undefined,
            }
          : department
      )
    );

    setSuccessMessage("");
  }

  function handleSave() {
    setSuccessMessage(
      "Die Abteilungseinstellungen wurden lokal aktualisiert. In dieser Mockup-Version werden sie noch nicht dauerhaft gespeichert."
    );
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h2 className="text-xl font-bold">Abteilungen</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manager und finale Genehmiger pro Abteilung.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800"
        >
          Einstellungen speichern
        </button>
      </div>

      {successMessage ? (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-4">
        {editableDepartments.map((department) => (
          <div
            key={department.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-4">
              <h3 className="font-semibold">{department.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                Abteilungs-ID: {department.id}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Manager
                </span>

                <select
                  value={department.managerId}
                  onChange={(event) =>
                    updateDepartmentManager(department.id, event.target.value)
                  }
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
                  value={department.finalApproverId ?? ""}
                  onChange={(event) =>
                    updateDepartmentFinalApprover(
                      department.id,
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
                >
                  <option value="">Nicht zugewiesen</option>

                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}