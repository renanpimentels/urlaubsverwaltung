"use client";

import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { VacationRequestCard } from "@/components/VacationRequestCard";
import { currentUser } from "@/lib/current-user";
import {
  getEmployeeById,
  getVisibleVacationRequestsForUser,
} from "@/lib/mock-queries";
import type { RequestStatus } from "@/lib/types";

type StatusFilter = RequestStatus | "Alle";

const statusFilters: StatusFilter[] = [
  "Ausstehend",
  "Genehmigt",
  "Abgelehnt",
  "Alle",
];

export default function VacationRequestsPage() {
  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilter>("Ausstehend");

  const currentEmployee = getEmployeeById(currentUser.employeeId);

  const visibleVacationRequests = getVisibleVacationRequestsForUser(
    currentUser.employeeId,
    currentUser.role
  );

  const filteredVacationRequests =
    selectedStatus === "Alle"
      ? visibleVacationRequests
      : visibleVacationRequests.filter(
          (request) => request.status === selectedStatus
        );

  return (
    <>
      <PageHeader
        eyebrow="Übersicht"
        title="Urlaubsanträge"
        description={`Hier siehst du die Urlaubsanträge, die für ${
          currentEmployee?.name ?? "den aktuellen Benutzer"
        } sichtbar sind.`}
        action={
          <Link
            href="/urlaubsantraege/neu"
            className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            Neuen Antrag erstellen
          </Link>
        }
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h2 className="text-xl font-bold">Aktuelle Anträge</h2>
            <p className="mt-1 text-sm text-slate-500">
              Die Liste wird anhand des mock currentUser und des ausgewählten
              Status gefiltert.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((status) => {
              const isActive = selectedStatus === status;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={
                    isActive
                      ? "rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
                      : "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  }
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Angezeigt:{" "}
          <span className="font-semibold text-slate-800">
            {filteredVacationRequests.length}
          </span>{" "}
          von{" "}
          <span className="font-semibold text-slate-800">
            {visibleVacationRequests.length}
          </span>{" "}
          sichtbaren Anträgen
        </div>

        <div className="grid gap-3">
          {filteredVacationRequests.map((request) => {
            const employee = getEmployeeById(request.employeeId);

            return (
              <VacationRequestCard
                key={request.id}
                request={request}
                employee={employee}
              />
            );
          })}

          {filteredVacationRequests.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Keine Urlaubsanträge für diesen Filter gefunden.
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}