"use server";

import { redirect } from "next/navigation";

import {
  applyVacationBalanceChange,
  getVacationBalanceYearFromDate,
} from "@/lib/actions/vacation-balance-service";
import { assertCompanyPolicyAllowsVacationRequest } from "@/lib/actions/company-policy-validation-service";
import { assertVacationRequestCanBeSaved } from "@/lib/actions/vacation-request-validation-service";
import { getActiveCurrentUserFromDb } from "@/lib/current-user-server";
import { calculateBusinessDaysWithHolidays } from "@/lib/holiday-calendar";
import { prisma } from "@/lib/prisma";
import type { AbsenceType, UserRole } from "@/lib/types";

type CreateVacationRequestInput = {
  employeeId: string;
  absenceType: AbsenceType;
  startDate: string;
  endDate: string;
  comment: string;
};

async function getResponsibleDepartmentIdsForEmployee(employeeId: string) {
  const departments = await prisma.department.findMany({
    where: {
      OR: [
        {
          managerId: employeeId,
        },
        {
          finalApproverId: employeeId,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return departments.map((department) => department.id);
}

async function canCreateVacationRequestForEmployee(
  selectedEmployeeId: string,
  currentEmployeeId: string | undefined,
  role: UserRole
) {
  if (role === "hr" || role === "admin") {
    return true;
  }

  if (!currentEmployeeId) {
    return false;
  }

  if (selectedEmployeeId === currentEmployeeId) {
    return true;
  }

  if (role === "manager") {
    const selectedEmployee = await prisma.employee.findUnique({
      where: {
        id: selectedEmployeeId,
      },
      select: {
        departmentId: true,
      },
    });

    if (!selectedEmployee?.departmentId) {
      return false;
    }

    const responsibleDepartmentIds =
      await getResponsibleDepartmentIdsForEmployee(currentEmployeeId);

    return responsibleDepartmentIds.includes(selectedEmployee.departmentId);
  }

  return false;
}

export async function createVacationRequestAction(
  input: CreateVacationRequestInput
) {
  const currentUser = await getActiveCurrentUserFromDb();

  if (!input.employeeId) {
    throw new Error("Employee is required.");
  }

  if (!input.startDate) {
    throw new Error("Start date is required.");
  }

  if (!input.endDate) {
    throw new Error("End date is required.");
  }

  if (input.endDate < input.startDate) {
    throw new Error("End date cannot be before start date.");
  }

  const canCreate = await canCreateVacationRequestForEmployee(
    input.employeeId,
    currentUser.employeeId,
    currentUser.role
  );

  if (!canCreate) {
    throw new Error("Current user cannot create a request for this employee.");
  }

  const employee = await prisma.employee.findUnique({
    where: {
      id: input.employeeId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found.");
  }

  const companySettings = await prisma.companySettings.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  const days = calculateBusinessDaysWithHolidays(
    input.startDate,
    input.endDate,
    companySettings?.federalState
  );

  if (days <= 0) {
    throw new Error("The selected period has no calculated absence days.");
  }

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  let createdRequestId = "";

  await prisma.$transaction(async (transaction) => {
    await assertCompanyPolicyAllowsVacationRequest(transaction, {
      startDate,
      comment: input.comment,
    });

    await assertVacationRequestCanBeSaved(transaction, {
      employeeId: input.employeeId,
      absenceType: input.absenceType,
      startDate,
      endDate,
      days,
    });

    const request = await transaction.vacationRequest.create({
      data: {
        employeeId: input.employeeId,
        createdByUserId: currentUser.id,
        absenceType: input.absenceType,
        startDate,
        endDate,
        days,
        status: "Ausstehend",
        approvalStepsCompleted: 0,
        approvalStepsRequired: 2,
        comment: input.comment.trim() || null,
      },
    });

    createdRequestId = request.id;

    if (input.absenceType === "Urlaub") {
      await applyVacationBalanceChange(transaction, {
        employeeId: input.employeeId,
        year: getVacationBalanceYearFromDate(startDate),
        pendingDelta: days,
      });
    }
  });

  redirect(`/urlaubsantraege/${createdRequestId}`);
}