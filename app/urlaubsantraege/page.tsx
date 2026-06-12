import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { VacationRequestCard } from "@/components/VacationRequestCard";
import { VacationRequestFilter } from "@/components/VacationRequestFilter";
import { getActiveCurrentUserFromDb } from "@/lib/current-user-server";
import {
  getEmployeeByIdFromDb,
  getVisibleDepartmentsForUserFromDb,
  getVisibleVacationRequestsForUserFromDb,
} from "@/lib/prisma-queries";
import type { AbsenceType, RequestStatus } from "@/lib/types";

type VacationRequestsPageProps = {
  searchParams: Promise<{
    status?: string;
    absenceType?: string;
    departmentId?: string;
    year?: string;
  }>;
};

const validStatuses: RequestStatus[] = [
  "Ausstehend",
  "Genehmigt",
  "Abgelehnt",
  "Storniert",
];

const validAbsenceTypes: AbsenceType[] = ["Urlaub", "Sonderurlaub"];

function getYearFromDate(date: string) {
  return Number(date.slice(0, 4));
}

function getValidStatus(status: string | undefined) {
  if (!status) {
    return undefined;
  }

  return validStatuses.includes(status as RequestStatus)
    ? (status as RequestStatus)
    : undefined;
}

function getValidAbsenceType(absenceType: string | undefined) {
  if (!absenceType) {
    return undefined;
  }

  return validAbsenceTypes.includes(absenceType as AbsenceType)
    ? (absenceType as AbsenceType)
    : undefined;
}

export default async function VacationRequestsPage({
  searchParams,
}: VacationRequestsPageProps) {
  const currentUser = await getActiveCurrentUserFromDb();
  const { status, absenceType, departmentId, year } = await searchParams;

  const selectedStatus = getValidStatus(status);
  const selectedAbsenceType = getValidAbsenceType(absenceType);

  const visibleDepartments = await getVisibleDepartmentsForUserFromDb(
    currentUser.employeeId,
    currentUser.role
  );

  const selectedDepartmentId = visibleDepartments.some(
    (department) => department.id === departmentId
  )
    ? departmentId
    : undefined;

  const visibleRequests = await getVisibleVacationRequestsForUserFromDb(
    currentUser.employeeId,
    currentUser.role
  );

  const years = Array.from(
    new Set(visibleRequests.map((request) => getYearFromDate(request.startDate)))
  ).sort((firstYear, secondYear) => secondYear - firstYear);

  const selectedYear = years.includes(Number(year)) ? year : undefined;

  const requestsWithEmployees = await Promise.all(
    visibleRequests.map(async (request) => {
      const employee = await getEmployeeByIdFromDb(request.employeeId);

      return {
        request,
        employee,
      };
    })
  );

  const filteredRequestsWithEmployees = requestsWithEmployees.filter(
    ({ request, employee }) => {
      if (selectedStatus && request.status !== selectedStatus) {
        return false;
      }

      if (
        selectedAbsenceType &&
        request.absenceType !== selectedAbsenceType
      ) {
        return false;
      }

      if (
        selectedDepartmentId &&
        employee?.departmentId !== selectedDepartmentId
      ) {
        return false;
      }

      if (selectedYear && String(getYearFromDate(request.startDate)) !== selectedYear) {
        return false;
      }

      return true;
    }
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
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            Neuen Antrag erstellen
          </Link>
        }
      />

      <VacationRequestFilter
        departments={visibleDepartments.map((department) => ({
          id: department.id,
          name: department.name,
        }))}
        years={years}
        selectedStatus={selectedStatus}
        selectedAbsenceType={selectedAbsenceType}
        selectedDepartmentId={selectedDepartmentId}
        selectedYear={selectedYear}
      />

      <section className="grid gap-4">
        {filteredRequestsWithEmployees.map(({ request, employee }) => (
          <VacationRequestCard
            key={request.id}
            request={request}
            employee={employee}
          />
        ))}

        {filteredRequestsWithEmployees.length === 0 ? (
          <article className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">Keine Anträge gefunden</h2>
            <p className="mt-2 text-slate-600">
              Für die aktuelle Auswahl sind keine Urlaubsanträge sichtbar.
            </p>
          </article>
        ) : null}
      </section>
    </>
  );
}