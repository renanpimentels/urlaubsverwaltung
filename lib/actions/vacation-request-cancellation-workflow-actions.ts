"use server";

import { revalidatePath } from "next/cache";

import {
  applyVacationBalanceChange,
  getVacationBalanceYearFromDate,
} from "@/lib/actions/vacation-balance-service";
import { getActiveCurrentUserFromDb } from "@/lib/current-user-server";
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
    },
  });

  if (!department) {
    return [];
  }

  return [department.managerId, department.finalApproverId].filter(
    (employeeId): employeeId is string => Boolean(employeeId)
  );
}

async function canCurrentUserDecideCancellationRequest(input: {
  currentEmployeeId?: string;
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

  await prisma.cancellationRequest.create({
    data: {
      vacationRequestId: request.id,
      requestedByUserId: currentUser.id,
      status: "Ausstehend",
      reason: trimmedReason,
    },
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
      vacationRequest: true,
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
      vacationRequest: true,
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

  await prisma.cancellationRequest.update({
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

  revalidatePath("/");
  revalidatePath("/genehmigungen");
  revalidatePath("/urlaubsantraege");
  revalidatePath(`/urlaubsantraege/${request.id}`);

  return {
    message: "Die Stornierung wurde abgelehnt.",
  };
}