"use server";

import { revalidatePath } from "next/cache";

import {
  applyVacationBalanceChange,
  getVacationBalanceYearFromDate,
} from "@/lib/actions/vacation-balance-service";
import {
  createNotificationWithTransaction,
  getNextApproverUserIdWithTransaction,
} from "@/lib/actions/notification-service";
import { getActiveCurrentUserFromDb } from "@/lib/current-user-server";
import { formatDateRange } from "@/lib/date-formatters";
import { prisma } from "@/lib/prisma";

export async function cancelVacationRequestAction(requestId: string) {
  const currentUser = await getActiveCurrentUserFromDb();

  const request = await prisma.vacationRequest.findUnique({
    where: {
      id: requestId,
    },
    include: {
      employee: {
        select: {
          name: true,
        },
      },
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

    const updatedVacationRequest = await transaction.vacationRequest.update({
      where: {
        id: request.id,
      },
      data: {
        status: "Storniert",
      },
    });

    const nextApproverUserId = await getNextApproverUserIdWithTransaction(
      transaction,
      {
        employeeId: request.employeeId,
        approvalStepsCompleted: request.approvalStepsCompleted,
        approvalStepsRequired: request.approvalStepsRequired,
      }
    );

    if (nextApproverUserId) {
      await createNotificationWithTransaction(transaction, {
        userId: nextApproverUserId,
        title: "Urlaubsantrag storniert",
        message: `${request.employee.name} hat den Antrag für ${formatDateRange(
          request.startDate.toISOString(),
          request.endDate.toISOString()
        )} storniert.`,
        href: `/urlaubsantraege/${request.id}`,
      });
    }

    return updatedVacationRequest;
  });

  revalidatePath("/");
  revalidatePath("/genehmigungen");
  revalidatePath("/urlaubsantraege");
  revalidatePath(`/urlaubsantraege/${request.id}`);

  return {
    status: updatedRequest.status,
    approvalStepsCompleted: updatedRequest.approvalStepsCompleted,
    message: "Der Antrag wurde storniert.",
  };
}