import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { VacationRequestDetail } from "@/components/VacationRequestDetail";
import { getVacationRequestById } from "@/lib/mock-queries";

type VacationRequestDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VacationRequestDetailPage({
  params,
}: VacationRequestDetailPageProps) {
  const { id } = await params;

  const request = getVacationRequestById(id);

  if (!request) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Antragsdetails"
        title={request.absenceType}
        description="Detailansicht eines Urlaubsantrags."
        action={
          <Link
            href="/urlaubsantraege"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Zurück zur Übersicht
          </Link>
        }
      />

      <VacationRequestDetail initialRequest={request} />
    </>
  );
}