"use server";

import { revalidatePath } from "next/cache";

import {
  applyVacationBalanceChange,
  getVacationBalanceYearFromDate,
} from "@/lib/actions/vacation-balance-service";
import { getActiveCurrentUserFromDb } from "@/lib/current-user-server";
import { prisma } from "@/lib/prisma";

export async function cancelVacationRequestAction(requestId: string) {
  const currentUser = await getActiveCurrentUserFromDb();

  const request = await prisma.vacationRequest.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!request) {
    throw new Error("Vacation request not found.");
  }

  if (!currentUser.employeeId || request.employeeId !== currentUser.employeeId) {
    throw new Error("Only the owner can cancel this request.");
  }

  if (request.status !== "Ausstehend") {
    throw new Error("Only pending requests can be cancelled.");
  }

  if (request.approvalStepsCompleted !== 0) {
    throw new Error("Requests with existing approvals cannot be cancelled.");
  }

  const updatedRequest = await prisma.$transaction(async (transaction) => {
    if (request.absenceType === "Urlaub") {
      await applyVacationBalanceChange(transaction, {
        employeeId: request.employeeId,
        year: getVacationBalanceYearFromDate(request.startDate),
        pendingDelta: -request.days,
      });
    }

    return transaction.vacationRequest.update({
      where: {
        id: request.id,
      },
      data: {
        status: "Storniert",
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/urlaubsantraege");
  revalidatePath(`/urlaubsantraege/${request.id}`);

  return {
    status: updatedRequest.status,
    approvalStepsCompleted: updatedRequest.approvalStepsCompleted,
    message: "Der Antrag wurde storniert.",
  };
}