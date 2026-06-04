"use server";

import { revalidatePath } from "next/cache";

import { currentUser } from "@/lib/current-user";
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

  const days = calculateBusinessDays(input.startDate, input.endDate);

  if (days <= 0) {
    throw new Error("The selected period has no calculated absence days.");
  }

  const updatedRequest = await prisma.vacationRequest.update({
    where: {
      id: request.id,
    },
    data: {
      absenceType: input.absenceType,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      days,
      comment: input.comment.trim() || null,
    },
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

