"use server";

import { revalidatePath } from "next/cache";

import {
  applyVacationBalanceChange,
  getVacationBalanceYearFromDate,
} from "@/lib/actions/vacation-balance-service";
import {
  createNotificationWithTransaction,
  getNextApproverUserIdWithTransaction,
  getRequestOwnerNotificationTargetWithTransaction,
} from "@/lib/actions/notification-service";
import { getActiveCurrentUserFromDb } from "@/lib/current-user-server";
import { formatDateRange } from "@/lib/date-formatters";
import { prisma } from "@/lib/prisma";

async function getNextApproverIdForRequest(request: {
  employeeId: string;
  status: string;
  approvalStepsCompleted: number;
  approvalStepsRequired: number;
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
      approvalStepsRequired: true,
    },
  });

  if (!department) {
    return undefined;
  }

  const approvalStepsRequired =
    request.approvalStepsRequired ?? department.approvalStepsRequired;

  if (request.approvalStepsCompleted === 0) {
    return department.managerId;
  }

  if (approvalStepsRequired >= 2 && request.approvalStepsCompleted === 1) {
    return department.finalApproverId ?? undefined;
  }

  return undefined;
}

function canCurrentUserApproveRequest(
  currentUser: {
    employeeId?: string | null;
    role: string;
  },
  nextApproverId: string | undefined
) {
  if (currentUser.role === "hr" || currentUser.role === "admin") {
    return true;
  }

  return (
    Boolean(currentUser.employeeId) && currentUser.employeeId === nextApproverId
  );
}

function isCurrentUserOverride(
  currentUser: {
    employeeId?: string | null;
    role: string;
  },
  nextApproverId: string | undefined
) {
  if (currentUser.role !== "hr" && currentUser.role !== "admin") {
    return false;
  }

  return !currentUser.employeeId || currentUser.employeeId !== nextApproverId;
}

function buildDecisionComment({
  inputComment,
  fallbackComment,
  override,
}: {
  inputComment: string;
  fallbackComment: string;
  override: boolean;
}) {
  const trimmedComment = inputComment.trim();

  if (!trimmedComment) {
    return fallbackComment;
  }

  if (!override) {
    return trimmedComment;
  }

  return `${fallbackComment} ${trimmedComment}`;
}

export async function approveVacationRequestAction(
  requestId: string,
  comment = ""
) {
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

  if (request.status !== "Ausstehend") {
    throw new Error("Only pending requests can be approved.");
  }

  const nextApproverId = await getNextApproverIdForRequest({
    employeeId: request.employeeId,
    status: request.status,
    approvalStepsCompleted: request.approvalStepsCompleted,
    approvalStepsRequired: request.approvalStepsRequired,
  });

  if (!canCurrentUserApproveRequest(currentUser, nextApproverId)) {
    throw new Error("Current user cannot approve this request.");
  }

  const approverEmployeeId = nextApproverId ?? currentUser.employeeId;

  if (!approverEmployeeId) {
    throw new Error("No approver employee could be determined.");
  }

  const nextCompletedSteps = request.approvalStepsCompleted + 1;
  const isFullyApproved = nextCompletedSteps >= request.approvalStepsRequired;
  const override = isCurrentUserOverride(currentUser, nextApproverId);

  const decisionComment = buildDecisionComment({
    inputComment: comment,
    fallbackComment: override
      ? "Genehmigt durch HR/Admin-Override."
      : "Genehmigt.",
    override,
  });

  const updatedRequest = await prisma.$transaction(async (transaction) => {
    await transaction.approvalDecision.create({
      data: {
        vacationRequestId: request.id,
        approverEmployeeId,
        decidedByUserId: currentUser.id,
        stepOrder: nextCompletedSteps,
        decision: "approved",
        decidedAt: new Date(),
        comment: decisionComment,
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

    const updatedVacationRequest = await transaction.vacationRequest.update({
      where: {
        id: request.id,
      },
      data: {
        approvalStepsCompleted: nextCompletedSteps,
        status: isFullyApproved ? "Genehmigt" : "Ausstehend",
      },
    });

    const href = `/urlaubsantraege/${request.id}`;
    const dateRange = formatDateRange(
      request.startDate.toISOString(),
      request.endDate.toISOString()
    );

    if (isFullyApproved) {
      const ownerUserId =
        await getRequestOwnerNotificationTargetWithTransaction(
          transaction,
          request.employeeId
        );

      if (ownerUserId) {
        await createNotificationWithTransaction(transaction, {
          userId: ownerUserId,
          title: "Urlaubsantrag genehmigt",
          message: `Dein Antrag für ${dateRange} wurde genehmigt.`,
          href,
        });
      }
    } else {
      const nextApproverUserId = await getNextApproverUserIdWithTransaction(
        transaction,
        {
          employeeId: request.employeeId,
          approvalStepsCompleted: nextCompletedSteps,
          approvalStepsRequired: request.approvalStepsRequired,
        }
      );

      if (nextApproverUserId) {
        await createNotificationWithTransaction(transaction, {
          userId: nextApproverUserId,
          title: "Urlaubsantrag wartet auf Freigabe",
          message: `${request.employee.name} hat einen Antrag für ${dateRange}, der auf deine Freigabe wartet.`,
          href,
        });
      }
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
    message: override
      ? "Der Antrag wurde per HR/Admin-Override genehmigt."
      : "Der Antrag wurde genehmigt.",
  };
}

export async function rejectVacationRequestAction(
  requestId: string,
  comment: string
) {
  const currentUser = await getActiveCurrentUserFromDb();

  const trimmedComment = comment.trim();

  if (!trimmedComment) {
    throw new Error("A rejection comment is required.");
  }

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

  if (request.status !== "Ausstehend") {
    throw new Error("Only pending requests can be rejected.");
  }

  const nextApproverId = await getNextApproverIdForRequest({
    employeeId: request.employeeId,
    status: request.status,
    approvalStepsCompleted: request.approvalStepsCompleted,
    approvalStepsRequired: request.approvalStepsRequired,
  });

  if (!canCurrentUserApproveRequest(currentUser, nextApproverId)) {
    throw new Error("Current user cannot reject this request.");
  }

  const approverEmployeeId = nextApproverId ?? currentUser.employeeId;

  if (!approverEmployeeId) {
    throw new Error("No approver employee could be determined.");
  }

  const nextStepOrder = request.approvalStepsCompleted + 1;
  const override = isCurrentUserOverride(currentUser, nextApproverId);

  const decisionComment = override
    ? `Abgelehnt durch HR/Admin-Override. ${trimmedComment}`
    : trimmedComment;

  const updatedRequest = await prisma.$transaction(async (transaction) => {
    await transaction.approvalDecision.create({
      data: {
        vacationRequestId: request.id,
        approverEmployeeId,
        decidedByUserId: currentUser.id,
        stepOrder: nextStepOrder,
        decision: "rejected",
        decidedAt: new Date(),
        comment: decisionComment,
      },
    });

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
        status: "Abgelehnt",
      },
    });

    const ownerUserId = await getRequestOwnerNotificationTargetWithTransaction(
      transaction,
      request.employeeId
    );

    if (ownerUserId) {
      await createNotificationWithTransaction(transaction, {
        userId: ownerUserId,
        title: "Urlaubsantrag abgelehnt",
        message: `Dein Antrag für ${formatDateRange(
          request.startDate.toISOString(),
          request.endDate.toISOString()
        )} wurde abgelehnt.`,
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
    message: override
      ? "Der Antrag wurde per HR/Admin-Override abgelehnt."
      : "Der Antrag wurde abgelehnt.",
  };
}