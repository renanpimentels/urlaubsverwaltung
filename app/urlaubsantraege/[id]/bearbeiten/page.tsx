import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { VacationRequestEditForm } from "@/components/VacationRequestEditForm";
import { currentUser } from "@/lib/current-user";
import {
  canEditOwnVacationRequest,
  getEmployeeById,
  getVacationRequestById,
} from "@/lib/mock-queries";

type EditVacationRequestPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditVacationRequestPage({
  params,
}: EditVacationRequestPageProps) {
  const { id } = await params;

  const request = getVacationRequestById(id);

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

  const employee = getEmployeeById(request.employeeId);

  return (
    <>
      <PageHeader
        eyebrow="Antrag bearbeiten"
        title={request.absenceType}
        description={`Bearbeite den Antrag${
          employee ? ` von ${employee.name}` : ""
        }. Änderungen sind nur möglich, solange noch keine Freigabe erfolgt ist.`}
        action={
          <Link
            href={`/urlaubsantraege/${request.id}`}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Zurück zum Antrag
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <VacationRequestEditForm request={request} />

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Bearbeitungsregel</h2>
          <p className="mt-1 text-sm text-slate-500">
            Dieser Antrag kann bearbeitet werden, weil er noch keine Freigabe
            erhalten hat.
          </p>

          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">Status</p>
              <p className="mt-1 text-sm text-slate-600">{request.status}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">Freigabestand</p>
              <p className="mt-1 text-sm text-slate-600">
                {request.approvalStepsCompleted}/
                {request.approvalStepsRequired}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">Hinweis</p>
              <p className="mt-1 text-sm text-amber-700">
                Nach der ersten Freigabe kann der Antrag nicht mehr direkt
                bearbeitet werden.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}