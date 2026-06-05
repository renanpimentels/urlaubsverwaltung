"use server";

import { revalidatePath } from "next/cache";

import {
  applyVacationBalanceChange,
  getVacationBalanceYearFromDate,
} from "@/lib/actions/vacation-balance-service";
import { currentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

async function getNextApproverIdForRequest(request: {
  employeeId: string;
  status: string;
  approvalStepsCompleted: number;
}) {
  if (request.status !== "Ausstehend") {
    return undefined;
  }

  const employee = await prisma.employee.findUnique({
    where: {
      id: request.employeeId,
    },
    select: {
      departmentId: true,
    },
  });

  if (!employee?.departmentId) {
    return undefined;
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
    return undefined;
  }

  if (request.approvalStepsCompleted === 0) {
    return department.managerId;
  }

  if (request.approvalStepsCompleted === 1) {
    return department.finalApproverId ?? undefined;
  }

  return undefined;
}

function canCurrentUserApproveRequest(nextApproverId: string | undefined) {
  if (currentUser.role === "hr" || currentUser.role === "admin") {
    return true;
  }

  return Boolean(currentUser.employeeId) && currentUser.employeeId === nextApproverId;
}

function isCurrentUserOverride(nextApproverId: string | undefined) {
  if (currentUser.role !== "hr" && currentUser.role !== "admin") {
    return false;
  }

  return !currentUser.employeeId || currentUser.employeeId !== nextApproverId;
}

export async function approveVacationRequestAction(requestId: string) {
  const request = await prisma.vacationRequest.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!request) {
    throw new Error("Vacation request not found.");
  }

  if (request.status !== "Ausstehend") {
    throw new Error("Only pending requests can be approved.");
  }

  const nextApproverId = await getNextApproverIdForRequest(request);

  if (!canCurrentUserApproveRequest(nextApproverId)) {
    throw new Error("Current user cannot approve this request.");
  }

  const approverEmployeeId = nextApproverId ?? currentUser.employeeId;

  if (!approverEmployeeId) {
    throw new Error("No approver employee could be determined.");
  }

  const nextCompletedSteps = request.approvalStepsCompleted + 1;
  const isFullyApproved = nextCompletedSteps >= request.approvalStepsRequired;
  const override = isCurrentUserOverride(nextApproverId);

  const updatedRequest = await prisma.$transaction(async (transaction) => {
    await transaction.approvalDecision.create({
      data: {
        vacationRequestId: request.id,
        approverEmployeeId,
        decidedByUserId: currentUser.id,
        stepOrder: nextCompletedSteps,
        decision: "approved",
        decidedAt: new Date(),
        comment: override
          ? "Genehmigt durch HR/Admin-Override."
          : "Genehmigt.",
      },
    });

    if (isFullyApproved && request.absenceType === "Urlaub") {
      await applyVacationBalanceChange(transaction, {
        employeeId: request.employeeId,
        year: getVacationBalanceYearFromDate(request.startDate),
        pendingDelta: -request.days,
        usedDelta: request.days,
      });
    }

    return transaction.vacationRequest.update({
      where: {
        id: request.id,
      },
      data: {
        approvalStepsCompleted: nextCompletedSteps,
        status: isFullyApproved ? "Genehmigt" : "Ausstehend",
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/genehmigungen");
  revalidatePath("/urlaubsantraege");
  revalidatePath(`/urlaubsantraege/${request.id}`);

  return {
    status: updatedRequest.status,
    approvalStepsCompleted: updatedRequest.approvalStepsCompleted,
    message: override
      ? "Der Antrag wurde per HR/Admin-Override genehmigt."
      : "Der Antrag wurde genehmigt.",
  };
}

export async function rejectVacationRequestAction(requestId: string) {
  const request = await prisma.vacationRequest.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!request) {
    throw new Error("Vacation request not found.");
  }

  if (request.status !== "Ausstehend") {
    throw new Error("Only pending requests can be rejected.");
  }

  const nextApproverId = await getNextApproverIdForRequest(request);

  if (!canCurrentUserApproveRequest(nextApproverId)) {
    throw new Error("Current user cannot reject this request.");
  }

  const approverEmployeeId = nextApproverId ?? currentUser.employeeId;

  if (!approverEmployeeId) {
    throw new Error("No approver employee could be determined.");
  }

  const nextStepOrder = request.approvalStepsCompleted + 1;
  const override = isCurrentUserOverride(nextApproverId);

  const updatedRequest = await prisma.$transaction(async (transaction) => {
    await transaction.approvalDecision.create({
      data: {
        vacationRequestId: request.id,
        approverEmployeeId,
        decidedByUserId: currentUser.id,
        stepOrder: nextStepOrder,
        decision: "rejected",
        decidedAt: new Date(),
        comment: override
          ? "Abgelehnt durch HR/Admin-Override."
          : "Abgelehnt.",
      },
    });

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
        status: "Abgelehnt",
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/genehmigungen");
  revalidatePath("/urlaubsantraege");
  revalidatePath(`/urlaubsantraege/${request.id}`);

  return {
    status: updatedRequest.status,
    approvalStepsCompleted: updatedRequest.approvalStepsCompleted,
    message: override
      ? "Der Antrag wurde per HR/Admin-Override abgelehnt."
      : "Der Antrag wurde abgelehnt.",
  };
}