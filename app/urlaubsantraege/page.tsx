import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { VacationRequestCard } from "@/components/VacationRequestCard";
import { currentUser } from "@/lib/current-user";
import { getEmployeeById } from "@/lib/mock-queries";
import {
  getEmployeeByIdFromDb,
  getVisibleVacationRequestsForUserFromDb,
} from "@/lib/prisma-queries";

export default async function VacationRequestsPage() {
  const visibleRequests = await getVisibleVacationRequestsForUserFromDb(
    currentUser.employeeId,
    currentUser.role
  );

  const requestsWithEmployees = await Promise.all(
    visibleRequests.map(async (request) => {
      const employee =
        (await getEmployeeByIdFromDb(request.employeeId)) ??
        getEmployeeById(request.employeeId);

      return {
        request,
        employee,
      };
    })
  );

  return (
    <>
      <PageHeader
        eyebrow="Urlaubsanträge"
        title="Anträge"
        description="Übersicht über die Urlaubsanträge, die du gemäß deiner Rolle sehen darfst."
        action={
          <Link
            href="/urlaubsantraege/neu"
            className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            Neuen Antrag erstellen
          </Link>
        }
      />

      <section className="grid gap-4">
        {requestsWithEmployees.map(({ request, employee }) => (
          <VacationRequestCard
            key={request.id}
            request={request}
            employee={employee}
          />
        ))}

        {requestsWithEmployees.length === 0 ? (
          <article className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">Keine Anträge gefunden</h2>
            <p className="mt-2 text-slate-600">
              Für den aktuellen Benutzer sind keine Urlaubsanträge sichtbar.
            </p>
          </article>
        ) : null}
      </section>
    </>
  );
}