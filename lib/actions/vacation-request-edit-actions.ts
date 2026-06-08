"use server";

import { revalidatePath } from "next/cache";

import {
  applyVacationBalanceChange,
  getVacationBalanceYearFromDate,
} from "@/lib/actions/vacation-balance-service";
import { assertVacationRequestCanBeSaved } from "@/lib/actions/vacation-request-validation-service";

import { getActiveCurrentUserFromDb } from "@/lib/current-user-server";

import { prisma } from "@/lib/prisma";
import type { AbsenceType } from "@/lib/types";
import { calculateBusinessDays } from "@/lib/vacation-calculations";

type UpdateVacationRequestInput = {
  requestId: string;
  absenceType: AbsenceType;
  startDate: string;
  endDate: string;
  comment: string;
};

export async function updateVacationRequestAction(
  input: UpdateVacationRequestInput
) {

  const currentUser = await getActiveCurrentUserFromDb();

  const request = await prisma.vacationRequest.findUnique({
    where: {
      id: input.requestId,
    },
  });

  if (!request) {
    throw new Error("Vacation request not found.");
  }

  if (!currentUser.employeeId || request.employeeId !== currentUser.employeeId) {
    throw new Error("Only the owner can edit this request.");
  }

  if (request.status !== "Ausstehend") {
    throw new Error("Only pending requests can be edited.");
  }

  if (request.approvalStepsCompleted !== 0) {
    throw new Error("Requests with existing approvals cannot be edited.");
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

  const newDays = calculateBusinessDays(input.startDate, input.endDate);

  if (newDays <= 0) {
    throw new Error("The selected period has no calculated absence days.");
  }

  const oldBalanceYear = getVacationBalanceYearFromDate(request.startDate);
  const newStartDate = new Date(input.startDate);
  const newEndDate = new Date(input.endDate);
  const newBalanceYear = getVacationBalanceYearFromDate(newStartDate);

  const updatedRequest = await prisma.$transaction(async (transaction) => {
    await assertVacationRequestCanBeSaved(transaction, {
      employeeId: request.employeeId,
      absenceType: input.absenceType,
      startDate: newStartDate,
      endDate: newEndDate,
      days: newDays,
      excludeRequestId: request.id,
    });

    if (request.absenceType === "Urlaub") {
      await applyVacationBalanceChange(transaction, {
        employeeId: request.employeeId,
        year: oldBalanceYear,
        pendingDelta: -request.days,
      });
    }

    if (input.absenceType === "Urlaub") {
      await applyVacationBalanceChange(transaction, {
        employeeId: request.employeeId,
        year: newBalanceYear,
        pendingDelta: newDays,
      });
    }

    return transaction.vacationRequest.update({
      where: {
        id: request.id,
      },
      data: {
        absenceType: input.absenceType,
        startDate: newStartDate,
        endDate: newEndDate,
        days: newDays,
        comment: input.comment.trim() || null,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/urlaubsantraege");
  revalidatePath(`/urlaubsantraege/${request.id}`);
  revalidatePath(`/urlaubsantraege/${request.id}/bearbeiten`);

  return {
    id: updatedRequest.id,
    absenceType: updatedRequest.absenceType,
    startDate: updatedRequest.startDate.toISOString().slice(0, 10),
    endDate: updatedRequest.endDate.toISOString().slice(0, 10),
    days: updatedRequest.days,
    comment: updatedRequest.comment ?? "",
    message: "Der Antrag wurde gespeichert.",
  };
}