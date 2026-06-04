import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { VacationRequestDetail } from "@/components/VacationRequestDetail";
import {
  getApprovalDecisionsByRequestIdFromDb,
  getDepartmentByIdFromDb,
  getEmployeeByIdFromDb,
  getVacationBalanceByEmployeeIdFromDb,
  getVacationRequestByIdFromDb,
} from "@/lib/prisma-queries";

type VacationRequestDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VacationRequestDetailPage({
  params,
}: VacationRequestDetailPageProps) {
  const { id } = await params;

  const request = await getVacationRequestByIdFromDb(id);

  if (!request) {
    notFound();
  }

  const employee = await getEmployeeByIdFromDb(request.employeeId);

  const departmentFromDb = employee?.departmentId
  ? await getDepartmentByIdFromDb(employee.departmentId)
  : undefined;

  const department = departmentFromDb
    ? {
        id: departmentFromDb.id,
        name: departmentFromDb.name,
        managerId: departmentFromDb.managerId,
        finalApproverId: departmentFromDb.finalApproverId ?? undefined,
      }
    : undefined;

  const vacationBalance = await getVacationBalanceByEmployeeIdFromDb(
    request.employeeId
  );

  const approvalDecisions = await getApprovalDecisionsByRequestIdFromDb(
    request.id
  );

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

      <VacationRequestDetail
        initialRequest={request}
        employee={employee}
        department={department}
        vacationBalance={vacationBalance}
        approvalDecisions={approvalDecisions}
      />
    </>
  );
}