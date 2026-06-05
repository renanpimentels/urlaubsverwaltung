"use server";

import { redirect } from "next/navigation";

import {
  applyVacationBalanceChange,
  getVacationBalanceYearFromDate,
} from "@/lib/actions/vacation-balance-service";
import { currentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import type { AbsenceType, UserRole } from "@/lib/types";
import { calculateBusinessDays } from "@/lib/vacation-calculations";

type CreateVacationRequestInput = {
  employeeId: string;
  absenceType: AbsenceType;
  startDate: string;
  endDate: string;
  comment: string;
};

async function getManagedDepartmentIdsForEmployee(employeeId: string) {
  const departments = await prisma.department.findMany({
    where: {
      managerId: employeeId,
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

    const managedDepartmentIds = await getManagedDepartmentIdsForEmployee(
      currentEmployeeId
    );

    return managedDepartmentIds.includes(selectedEmployee.departmentId);
  }

  return false;
}

export async function createVacationRequestAction(
  input: CreateVacationRequestInput
) {
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

  const days = calculateBusinessDays(input.startDate, input.endDate);

  if (days <= 0) {
    throw new Error("The selected period has no calculated absence days.");
  }

  const startDate = new Date(input.startDate);
  let createdRequestId = "";

  await prisma.$transaction(async (transaction) => {
    const request = await transaction.vacationRequest.create({
      data: {
        employeeId: input.employeeId,
        createdByUserId: currentUser.id,
        absenceType: input.absenceType,
        startDate,
        endDate: new Date(input.endDate),
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