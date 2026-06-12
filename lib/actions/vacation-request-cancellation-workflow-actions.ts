"use server";

import { revalidatePath } from "next/cache";

import {
  createNotificationWithTransaction,
  createNotificationsForUsersWithTransaction,
  getRequestOwnerNotificationTargetWithTransaction,
  getUserIdByEmployeeIdWithTransaction,
} from "@/lib/actions/notification-service";
import {
  applyVacationBalanceChange,
  getVacationBalanceYearFromDate,
} from "@/lib/actions/vacation-balance-service";
import { getActiveCurrentUserFromDb } from "@/lib/current-user-server";
import { formatDateRange } from "@/lib/date-formatters";
import { prisma } from "@/lib/prisma";

async function getResponsibleEmployeeIdsForVacationRequest(employeeId: string) {
  const employee = await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
    select: {
      departmentId: true,
    },
  });

  if (!employee?.departmentId) {
    return [];
  }

  const department = await prisma.department.findUnique({
    where: {
      id: employee.departmentId,
    },
    select: {
      managerId: true,
      finalApproverId: true,
      approvalStepsRequired: true,
    },
  });

  if (!department) {
    return [];
  }

  if (department.approvalStepsRequired <= 1) {
    return [department.managerId];
  }

  return [department.managerId, department.finalApproverId].filter(
    (responsibleEmployeeId): responsibleEmployeeId is string =>
      Boolean(responsibleEmployeeId)
  );
}

async function canCurrentUserDecideCancellationRequest(input: {
  currentEmployeeId?: string | null;
  role: string;
  requestEmployeeId: string;
}) {
  if (input.role === "hr" || input.role === "admin") {
    return true;
  }

  if (!input.currentEmployeeId) {
    return false;
  }

  const responsibleEmployeeIds =
    await getResponsibleEmployeeIdsForVacationRequest(input.requestEmployeeId);

  return responsibleEmployeeIds.includes(input.currentEmployeeId);
}

export async function requestVacationRequestCancellationAction(
  vacationRequestId: string,
  reason: string
) {
  const currentUser = await getActiveCurrentUserFromDb();
  const trimmedReason = reason.trim();

  if (!trimmedReason) {
    throw new Error("Cancellation reason is required.");
  }

  const request = await prisma.vacationRequest.findUnique({
    where: {
      id: vacationRequestId,
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
    throw new Error("Only the owner can request cancellation.");
  }

  const canRequestCancellation =
    request.status === "Genehmigt" ||
    (request.status === "Ausstehend" && request.approvalStepsCompleted > 0);

  if (!canRequestCancellation) {
    throw new Error("This vacation request cannot use cancellation workflow.");
  }

  const existingPendingCancellation =
    await prisma.cancellationRequest.findFirst({
      where: {
        vacationRequestId: request.id,
        status: "Ausstehend",
      },
    });

  if (existingPendingCancellation) {
    throw new Error("There is already a pending cancellation request.");
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.cancellationRequest.create({
      data: {
        vacationRequestId: request.id,
        requestedByUserId: currentUser.id,
        status: "Ausstehend",
        reason: trimmedReason,
      },
    });

    const responsibleEmployeeIds = await getResponsibleEmployeeIdsForVacationRequest(
      request.employeeId
    );

    const responsibleUserIds = (
      await Promise.all(
        responsibleEmployeeIds.map((responsibleEmployeeId) =>
          getUserIdByEmployeeIdWithTransaction(
            transaction,
            responsibleEmployeeId
          )
        )
      )
    ).filter((userId): userId is string => Boolean(userId));

    await createNotificationsForUsersWithTransaction(
      transaction,
      responsibleUserIds.map((userId) => ({
        userId,
        title: "Stornierung beantragt",
        message: `${request.employee.name} hat die Stornierung des Antrags für ${formatDateRange(
          request.startDate.toISOString(),
          request.endDate.toISOString()
        )} beantragt.`,
        href: `/urlaubsantraege/${request.id}`,
      }))
    );
  });

  revalidatePath("/");
  revalidatePath("/genehmigungen");
  revalidatePath("/urlaubsantraege");
  revalidatePath(`/urlaubsantraege/${request.id}`);

  return {
    message: "Die Stornierung wurde beantragt.",
  };
}

export async function approveVacationRequestCancellationAction(
  cancellationRequestId: string,
  decisionComment = ""
) {
  const currentUser = await getActiveCurrentUserFromDb();

  const cancellationRequest = await prisma.cancellationRequest.findUnique({
    where: {
      id: cancellationRequestId,
    },
    include: {
      vacationRequest: {
        include: {
          employee: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!cancellationRequest) {
    throw new Error("Cancellation request not found.");
  }

  if (cancellationRequest.status !== "Ausstehend") {
    throw new Error("Only pending cancellation requests can be approved.");
  }

  const request = cancellationRequest.vacationRequest;

  const canDecide = await canCurrentUserDecideCancellationRequest({
    currentEmployeeId: currentUser.employeeId,
    role: currentUser.role,
    requestEmployeeId: request.employeeId,
  });

  if (!canDecide) {
    throw new Error("Current user cannot approve this cancellation request.");
  }

  await prisma.$transaction(async (transaction) => {
    if (request.absenceType === "Urlaub") {
      if (request.status === "Genehmigt") {
        await applyVacationBalanceChange(transaction, {
          employeeId: request.employeeId,
          year: getVacationBalanceYearFromDate(request.startDate),
          usedDelta: -request.days,
        });
      }

      if (request.status === "Ausstehend") {
        await applyVacationBalanceChange(transaction, {
          employeeId: request.employeeId,
          year: getVacationBalanceYearFromDate(request.startDate),
          pendingDelta: -request.days,
        });
      }
    }

    await transaction.vacationRequest.update({
      where: {
        id: request.id,
      },
      data: {
        status: "Storniert",
      },
    });

    await transaction.cancellationRequest.update({
      where: {
        id: cancellationRequest.id,
      },
      data: {
        status: "Genehmigt",
        decidedByUserId: currentUser.id,
        decidedAt: new Date(),
        decisionComment: decisionComment.trim() || null,
      },
    });

    const ownerUserId = await getRequestOwnerNotificationTargetWithTransaction(
      transaction,
      request.employeeId
    );

    if (ownerUserId) {
      await createNotificationWithTransaction(transaction, {
        userId: ownerUserId,
        title: "Stornierung genehmigt",
        message: `Deine Stornierung für ${formatDateRange(
          request.startDate.toISOString(),
          request.endDate.toISOString()
        )} wurde genehmigt.`,
        href: `/urlaubsantraege/${request.id}`,
      });
    }
  });

  revalidatePath("/");
  revalidatePath("/genehmigungen");
  revalidatePath("/urlaubsantraege");
  revalidatePath(`/urlaubsantraege/${request.id}`);

  return {
    message: "Die Stornierung wurde genehmigt.",
  };
}

export async function rejectVacationRequestCancellationAction(
  cancellationRequestId: string,
  decisionComment: string
) {
  const currentUser = await getActiveCurrentUserFromDb();
  const trimmedDecisionComment = decisionComment.trim();

  if (!trimmedDecisionComment) {
    throw new Error("Decision comment is required.");
  }

  const cancellationRequest = await prisma.cancellationRequest.findUnique({
    where: {
      id: cancellationRequestId,
    },
    include: {
      vacationRequest: {
        include: {
          employee: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!cancellationRequest) {
    throw new Error("Cancellation request not found.");
  }

  if (cancellationRequest.status !== "Ausstehend") {
    throw new Error("Only pending cancellation requests can be rejected.");
  }

  const request = cancellationRequest.vacationRequest;

  const canDecide = await canCurrentUserDecideCancellationRequest({
    currentEmployeeId: currentUser.employeeId,
    role: currentUser.role,
    requestEmployeeId: request.employeeId,
  });

  if (!canDecide) {
    throw new Error("Current user cannot reject this cancellation request.");
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.cancellationRequest.update({
      where: {
        id: cancellationRequest.id,
      },
      data: {
        status: "Abgelehnt",
        decidedByUserId: currentUser.id,
        decidedAt: new Date(),
        decisionComment: trimmedDecisionComment,
      },
    });

    const ownerUserId = await getRequestOwnerNotificationTargetWithTransaction(
      transaction,
      request.employeeId
    );

    if (ownerUserId) {
      await createNotificationWithTransaction(transaction, {
        userId: ownerUserId,
        title: "Stornierung abgelehnt",
        message: `Deine Stornierung für ${formatDateRange(
          request.startDate.toISOString(),
          request.endDate.toISOString()
        )} wurde abgelehnt.`,
        href: `/urlaubsantraege/${request.id}`,
      });
    }
  });

  revalidatePath("/");
  revalidatePath("/genehmigungen");
  revalidatePath("/urlaubsantraege");
  revalidatePath(`/urlaubsantraege/${request.id}`);

  return {
    message: "Die Stornierung wurde abgelehnt.",
  };
}