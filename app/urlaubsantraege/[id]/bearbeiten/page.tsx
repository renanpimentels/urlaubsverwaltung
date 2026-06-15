import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { VacationRequestEditForm } from "@/components/VacationRequestEditForm";
import { getActiveCurrentUserFromDb } from "@/lib/current-user-server";
import { canEditOwnVacationRequest } from "@/lib/permissions";
import {
  getEmployeeByIdFromDb,
  getVacationRequestByIdFromDb,
} from "@/lib/prisma-queries";

type EditVacationRequestPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditVacationRequestPage({
  params,
}: EditVacationRequestPageProps) {
  const { id } = await params;

  const currentUser = await getActiveCurrentUserFromDb();
  const request = await getVacationRequestByIdFromDb(id);

  if (!request) {
    notFound();
  }

  const canEditRequest = canEditOwnVacationRequest(
    request,
    currentUser.employeeId
  );

  if (!canEditRequest) {
    notFound();
  }

  const employee = await getEmployeeByIdFromDb(request.employeeId);

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Antrag bearbeiten"
        title={request.absenceType}
        description={`Bearbeite den Antrag${
          employee ? ` von ${employee.name}` : ""
        }. Änderungen sind nur möglich, solange noch keine Freigabe erfolgt ist.`}
        action={
          <Link
            href={`/urlaubsantraege/${request.id}`}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200"
          >
            Zurück zum Antrag
          </Link>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <VacationRequestEditForm request={request} />

        <aside className="self-start rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">
            Bearbeitungsregel
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Dieser Antrag kann bearbeitet werden, weil er noch keine Freigabe
            erhalten hat.
          </p>

          <div className="mt-4 grid gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {request.status}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Freigabestand
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {request.approvalStepsCompleted}/
                {request.approvalStepsRequired}
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-sm font-medium text-amber-800">Hinweis</p>
              <p className="mt-1 text-sm leading-6 text-amber-700">
                Nach der ersten Freigabe kann der Antrag nicht mehr direkt
                bearbeitet werden.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}