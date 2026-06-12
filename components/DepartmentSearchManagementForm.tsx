"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { updateDepartmentAction } from "@/lib/actions/settings-actions";
import type { Employee } from "@/lib/types";

type DepartmentForManagement = {
  id: string;
  name: string;
  managerId: string;
  finalApproverId: string | null;
  approvalStepsRequired: number;
  isActive: boolean;
  employees: {
    id: string;
    isActive: boolean;
  }[];
};

type DepartmentSearchManagementFormProps = {
  departments: DepartmentForManagement[];
  employees: Employee[];
};

export function DepartmentSearchManagementForm({
  departments,
  employees,
}: DepartmentSearchManagementFormProps) {
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [name, setName] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [selectedFinalApproverId, setSelectedFinalApproverId] = useState("");
  const [selectedApprovalStepsRequired, setSelectedApprovalStepsRequired] =
    useState(2);
  const [selectedIsActive, setSelectedIsActive] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const isTwoStepApproval = selectedApprovalStepsRequired === 2;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!searchContainerRef.current) {
        return;
      }

      if (!searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredDepartments = useMemo(() => {
    const sortedDepartments = [...departments].sort((first, second) =>
      first.name.localeCompare(second.name)
    );

    if (!normalizedSearchTerm) {
      return sortedDepartments.slice(0, 10);
    }

    return sortedDepartments
      .filter((department) =>
        department.name.toLowerCase().includes(normalizedSearchTerm)
      )
      .slice(0, 10);
  }, [departments, normalizedSearchTerm]);

  const selectedDepartment = departments.find(
    (department) => department.id === selectedDepartmentId
  );

  const activeEmployeeCount =
    selectedDepartment?.employees.filter((employee) => employee.isActive)
      .length ?? 0;

  function resetMessages() {
    setMessage("");
    setErrorMessage("");
  }

  function clearSelectedDepartment() {
    setSelectedDepartmentId("");
    setName("");
    setSelectedManagerId("");
    setSelectedFinalApproverId("");
    setSelectedApprovalStepsRequired(2);
    setSelectedIsActive(true);
  }

  function handleSelectDepartment(departmentId: string) {
    const department = departments.find(
      (currentDepartment) => currentDepartment.id === departmentId
    );

    if (!department) {
      return;
    }

    const approvalStepsRequired =
      department.approvalStepsRequired === 1 ? 1 : 2;

    setSelectedDepartmentId(department.id);
    setSearchTerm(department.name);
    setName(department.name);
    setSelectedManagerId(department.managerId);
    setSelectedFinalApproverId(
      approvalStepsRequired === 2 ? department.finalApproverId ?? "" : ""
    );
    setSelectedApprovalStepsRequired(approvalStepsRequired);
    setSelectedIsActive(department.isActive);
    setIsSearchOpen(false);
    resetMessages();
  }

  function handleSubmit() {
    resetMessages();

    if (!selectedDepartment) {
      setErrorMessage("Bitte wähle zuerst eine Abteilung aus.");
      return;
    }

    if (!name.trim()) {
      setErrorMessage("Bitte gib einen Namen für die Abteilung ein.");
      return;
    }

    if (!selectedManagerId) {
      setErrorMessage("Bitte wähle einen Manager aus.");
      return;
    }

    if (isTwoStepApproval && !selectedFinalApproverId) {
      setErrorMessage(
        "Bitte wähle einen finalen Freigeber für die zweistufige Freigabe aus."
      );
      return;
    }

    if (isTwoStepApproval && selectedFinalApproverId === selectedManagerId) {
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
          departmentId: selectedDepartment.id,
          name,
          managerId: selectedManagerId,
          finalApproverId: isTwoStepApproval ? selectedFinalApproverId : "",
          approvalStepsRequired: selectedApprovalStepsRequired,
          isActive: selectedIsActive,
        });

        setMessage(result.message);
        setSearchTerm(name);
      } catch {
        setErrorMessage("Die Abteilung konnte nicht gespeichert werden.");
      }
    });
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-950">
          Abteilung verwalten
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Abteilung suchen und Status, Manager oder Freigabestufen bearbeiten.
        </p>
      </div>

      <div className="grid gap-4">
        <div ref={searchContainerRef} className="relative grid gap-1.5">
          <label
            htmlFor="department-search"
            className="text-sm font-medium text-slate-700"
          >
            Abteilung auswählen
          </label>

          <div className="flex gap-2">
            <input
              id="department-search"
              type="search"
              value={searchTerm}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setIsSearchOpen(true);
                clearSelectedDepartment();
                resetMessages();
              }}
              placeholder="Name eingeben oder auswählen..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
            />

            <button
              type="button"
              onClick={() => {
                setIsSearchOpen((currentValue) => !currentValue);
                resetMessages();
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Öffnen
            </button>
          </div>

          {isSearchOpen && filteredDepartments.length > 0 ? (
            <div className="absolute top-full z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="divide-y divide-slate-100">
                {filteredDepartments.map((department) => {
                  const activeCount = department.employees.filter(
                    (employee) => employee.isActive
                  ).length;

                  const isSelected = department.id === selectedDepartmentId;

                  return (
                    <button
                      key={department.id}
                      type="button"
                      onClick={() => handleSelectDepartment(department.id)}
                      className={`block w-full px-3 py-2 text-left hover:bg-slate-50 ${
                        isSelected ? "bg-slate-100" : "bg-white"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-slate-950">
                        {department.name}
                      </span>

                      <span className="mt-0.5 block text-xs text-slate-500">
                        {activeCount} aktiv · {department.employees.length}{" "}
                        gesamt · {department.isActive ? "Aktiv" : "Inaktiv"} ·{" "}
                        {department.approvalStepsRequired === 1
                          ? "1 Stufe"
                          : "2 Stufen"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {isSearchOpen && filteredDepartments.length === 0 ? (
            <div className="absolute top-full z-20 mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-lg">
              Keine Abteilung gefunden.
            </div>
          ) : null}
        </div>

        {selectedDepartment ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-start">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-slate-950">
                  {selectedDepartment.name}
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  {activeEmployeeCount} aktive Mitarbeiter ·{" "}
                  {selectedDepartment.employees.length} insgesamt
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                    selectedDepartment.isActive
                      ? "bg-green-50 text-green-700 ring-green-200"
                      : "bg-slate-100 text-slate-600 ring-slate-200"
                  }`}
                >
                  {selectedDepartment.isActive ? "Aktiv" : "Inaktiv"}
                </span>

                <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                  {selectedApprovalStepsRequired === 1 ? "1 Stufe" : "2 Stufen"}
                </span>
              </div>
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
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
                />
              </label>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Freigabestufen
                  </span>
                  <select
                    value={selectedApprovalStepsRequired}
                    onChange={(event) => {
                      const nextApprovalStepsRequired = Number(
                        event.target.value
                      );

                      setSelectedApprovalStepsRequired(
                        nextApprovalStepsRequired
                      );

                      if (nextApprovalStepsRequired === 1) {
                        setSelectedFinalApproverId("");
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
                    value={selectedManagerId}
                    onChange={(event) => {
                      setSelectedManagerId(event.target.value);
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
                    value={selectedFinalApproverId}
                    onChange={(event) => {
                      setSelectedFinalApproverId(event.target.value);
                      resetMessages();
                    }}
                    disabled={!isTwoStepApproval}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="">
                      {isTwoStepApproval
                        ? "Bitte auswählen"
                        : "Nicht erforderlich"}
                    </option>

                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={selectedIsActive}
                  onChange={(event) => {
                    setSelectedIsActive(event.target.checked);
                    resetMessages();
                  }}
                  className="mt-1 h-4 w-4"
                />

                <span>
                  <span className="block text-sm font-medium text-slate-700">
                    Abteilung ist aktiv
                  </span>
                  <span className="text-xs leading-5 text-slate-500">
                    Inaktive Abteilungen können nicht für neue Mitarbeiter
                    ausgewählt werden.
                  </span>
                </span>
              </label>

              {!selectedIsActive && activeEmployeeCount > 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                  Diese Abteilung hat noch {activeEmployeeCount} aktive
                  Mitarbeiter und kann deshalb nicht inaktiv gesetzt werden.
                </div>
              ) : null}

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
                {isPending ? "Wird gespeichert..." : "Abteilung speichern"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            Wähle eine Abteilung aus der Liste aus, um sie zu bearbeiten.
          </div>
        )}
      </div>
    </article>
  );
}