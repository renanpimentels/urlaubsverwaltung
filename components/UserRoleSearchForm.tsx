"use client";

import { useMemo, useState, useTransition } from "react";

import { updateUserRoleAction } from "@/lib/actions/settings-actions";
import type { UserRole } from "@/lib/types";

type UserForRoleManagement = {
  id: string;
  email: string;
  employeeId?: string;
  role: UserRole;
  isActive: boolean;
  employeeName?: string;
  employeePosition?: string;
  employeeIsActive?: boolean;
};

type UserRoleSearchFormProps = {
  users: UserForRoleManagement[];
};

const roleLabels: Record<UserRole, string> = {
  employee: "Employee",
  manager: "Manager / Approver",
  hr: "HR",
  admin: "Admin",
};

export function UserRoleSearchForm({ users }: UserRoleSearchFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("employee");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    if (normalizedSearchTerm.length < 2) {
      return [];
    }

    return users
      .filter((user) => {
        const searchableText = [
          user.email,
          user.employeeName,
          user.employeePosition,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedSearchTerm);
      })
      .slice(0, 8);
  }, [normalizedSearchTerm, users]);

  const selectedUser = users.find((user) => user.id === selectedUserId);

  function resetMessages() {
    setMessage("");
    setErrorMessage("");
  }

  function handleSelectUser(userId: string) {
    const user = users.find((currentUser) => currentUser.id === userId);

    if (!user) {
      return;
    }

    setSelectedUserId(user.id);
    setSelectedRole(user.role);
    setSearchTerm(user.employeeName ?? user.email);
    resetMessages();
  }

  function handleSubmit() {
    resetMessages();

    if (!selectedUser) {
      setErrorMessage("Bitte wähle zuerst einen Benutzer aus.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateUserRoleAction({
          userId: selectedUser.id,
          role: selectedRole,
        });

        setMessage(result.message);
      } catch {
        setErrorMessage(
          "Die Benutzerrolle konnte nicht gespeichert werden. Prüfe bitte, ob der Benutzer noch als Manager oder Final Approver einer Abteilung eingetragen ist."
        );
      }
    });
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-950">
          Benutzerrolle ändern
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Benutzer nach Name, Position oder E-Mail suchen und Rolle ändern.
        </p>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">
            Benutzer suchen
          </span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setSelectedUserId("");
              resetMessages();
            }}
            placeholder="Mindestens 2 Zeichen eingeben..."
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
          />
        </label>

        {normalizedSearchTerm.length > 0 && normalizedSearchTerm.length < 2 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            Gib mindestens 2 Zeichen ein, um Benutzer zu suchen.
          </div>
        ) : null}

        {filteredUsers.length > 0 && !selectedUser ? (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="divide-y divide-slate-100 bg-white">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user.id)}
                  className="block w-full px-3 py-2 text-left hover:bg-slate-50"
                >
                  <span className="block text-sm font-semibold text-slate-950">
                    {user.employeeName ?? user.email}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {user.email}
                    {user.employeePosition ? ` · ${user.employeePosition}` : ""}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-slate-500">
                    Aktuelle Rolle: {roleLabels[user.role]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {normalizedSearchTerm.length >= 2 &&
        filteredUsers.length === 0 &&
        !selectedUser ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            Kein Benutzer gefunden.
          </div>
        ) : null}

        {selectedUser ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-start">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-slate-950">
                  {selectedUser.employeeName ?? selectedUser.email}
                </h3>
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {selectedUser.email}
                </p>
                {selectedUser.employeePosition ? (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {selectedUser.employeePosition}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                    selectedUser.isActive
                      ? "bg-green-50 text-green-700 ring-green-200"
                      : "bg-slate-100 text-slate-600 ring-slate-200"
                  }`}
                >
                  {selectedUser.isActive ? "User aktiv" : "User inaktiv"}
                </span>

                {selectedUser.employeeId ? (
                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                      selectedUser.employeeIsActive
                        ? "bg-green-50 text-green-700 ring-green-200"
                        : "bg-slate-100 text-slate-600 ring-slate-200"
                    }`}
                  >
                    {selectedUser.employeeIsActive
                      ? "Mitarbeiter aktiv"
                      : "Mitarbeiter inaktiv"}
                  </span>
                ) : (
                  <span className="w-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                    Kein Mitarbeiter verknüpft
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Benutzerrolle
                </span>
                <select
                  value={selectedRole}
                  onChange={(event) => {
                    setSelectedRole(event.target.value as UserRole);
                    resetMessages();
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
                >
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <option key={role} value={role}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending || selectedRole === selectedUser.role}
                  className="w-fit rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Wird gespeichert..." : "Rolle speichern"}
                </button>

                {selectedRole !== selectedUser.role ? (
                  <p className="text-xs text-amber-700">
                    Änderung noch nicht gespeichert.
                  </p>
                ) : null}

                {message ? (
                  <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                    {message}
                  </p>
                ) : null}

                {errorMessage ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    {errorMessage}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}