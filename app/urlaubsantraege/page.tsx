import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { VacationRequestCard } from "@/components/VacationRequestCard";
import { currentUser } from "@/lib/current-user";
import {
  getEmployeeById,
  getVisibleVacationRequestsForUser,
} from "@/lib/mock-queries";

export default function VacationRequestsPage() {
  const currentEmployee = getEmployeeById(currentUser.employeeId);

  const visibleVacationRequests = getVisibleVacationRequestsForUser(
    currentUser.employeeId,
    currentUser.role
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
        <div className="mb-5">
          <h2 className="text-xl font-bold">Aktuelle Anträge</h2>
          <p className="mt-1 text-sm text-slate-500">
            Die Liste wird aktuell anhand des mock currentUser gefiltert.
          </p>
        </div>

        <div className="grid gap-3">
          {visibleVacationRequests.map((request) => {
            const employee = getEmployeeById(request.employeeId);

            return (
              <VacationRequestCard
                key={request.id}
                request={request}
                employee={employee}
              />
            );
          })}

          {visibleVacationRequests.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Keine Urlaubsanträge gefunden.
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}