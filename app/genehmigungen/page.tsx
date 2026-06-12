import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { VacationRequestCard } from "@/components/VacationRequestCard";
import { getActiveCurrentUserFromDb } from "@/lib/current-user-server";
import {
  getEmployeeByIdFromDb,
  getVisibleApprovalRequestsForUserFromDb,
} from "@/lib/prisma-queries";

export default async function ApprovalsPage() {
  const currentUser = await getActiveCurrentUserFromDb();

  const approvalRequests = await getVisibleApprovalRequestsForUserFromDb(
    currentUser.employeeId,
    currentUser.role
  );

  const requestsWithEmployees = await Promise.all(
    approvalRequests.map(async (request) => {
      const employee = await getEmployeeByIdFromDb(request.employeeId);

      return {
        request,
        employee,
      };
    })
  );

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Genehmigungen"
        title="Ausstehende Freigaben"
        description="Prüfe und bearbeite Urlaubsanträge, für die du zuständig bist."
      />

      <section className="grid gap-3">
        {requestsWithEmployees.map(({ request, employee }) => (
          <VacationRequestCard
            key={request.id}
            request={request}
            employee={employee}
            showCreatedAt
            actions={
              <Link
                href={`/urlaubsantraege/${request.id}`}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                Antrag beantworten
              </Link>
            }
          />
        ))}

        {requestsWithEmployees.length === 0 ? (
          <article className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">
              Keine Freigaben offen
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Für den aktuellen Benutzer sind keine ausstehenden Freigaben
              vorhanden.
            </p>
          </article>
        ) : null}
      </section>
    </div>
  );
}