import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { VacationRequestCard } from "@/components/VacationRequestCard";
import { currentUser } from "@/lib/current-user";
import {
  getEmployeeByIdFromDb,
  getVisibleApprovalRequestsForUserFromDb,
} from "@/lib/prisma-queries";

export default async function ApprovalsPage() {
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
    <>
      <PageHeader
        eyebrow="Genehmigungen"
        title="Ausstehende Freigaben"
        description="Prüfe und bearbeite Urlaubsanträge, für die du zuständig bist."
      />

      <section className="grid gap-4">
        {requestsWithEmployees.map(({ request, employee }) => (
          <VacationRequestCard
            key={request.id}
            request={request}
            employee={employee}
            showCreatedAt
            actions={
              <Link
                href={`/urlaubsantraege/${request.id}`}
                className="rounded-xl bg-teal-700 px-5 py-3 text-center font-semibold text-white shadow-sm hover:bg-teal-800"
              >
                Antrag beantworten
              </Link>
            }
          />
        ))}

        {requestsWithEmployees.length === 0 ? (
          <article className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">Keine Freigaben offen</h2>
            <p className="mt-2 text-slate-600">
              Für den aktuellen Benutzer sind keine ausstehenden Freigaben
              vorhanden.
            </p>
          </article>
        ) : null}
      </section>
    </>
  );
}