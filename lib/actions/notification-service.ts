import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type PrismaTransactionClient = Prisma.TransactionClient;

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  href?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      href: input.href ?? null,
    },
  });
}

export async function createNotificationWithTransaction(
  transaction: PrismaTransactionClient,
  input: CreateNotificationInput
) {
  return transaction.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      href: input.href ?? null,
    },
  });
}

export async function createNotificationsForUsersWithTransaction(
  transaction: PrismaTransactionClient,
  inputs: CreateNotificationInput[]
) {
  const uniqueNotifications = inputs.filter(
    (notification, index, notifications) =>
      notifications.findIndex(
        (currentNotification) =>
          currentNotification.userId === notification.userId &&
          currentNotification.title === notification.title &&
          currentNotification.message === notification.message &&
          currentNotification.href === notification.href
      ) === index
  );

  if (uniqueNotifications.length === 0) {
    return;
  }

  await transaction.notification.createMany({
    data: uniqueNotifications.map((notification) => ({
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      href: notification.href ?? null,
    })),
  });
}

export async function getUserIdByEmployeeIdWithTransaction(
  transaction: PrismaTransactionClient,
  employeeId: string
) {
  const user = await transaction.user.findUnique({
    where: {
      employeeId,
    },
    select: {
      id: true,
    },
  });

  return user?.id;
}

export async function getRequestOwnerNotificationTargetWithTransaction(
  transaction: PrismaTransactionClient,
  employeeId: string
) {
  const user = await transaction.user.findUnique({
    where: {
      employeeId,
    },
    select: {
      id: true,
    },
  });

  return user?.id;
}

export async function getNextApproverUserIdWithTransaction(
  transaction: PrismaTransactionClient,
  input: {
    employeeId: string;
    approvalStepsCompleted: number;
    approvalStepsRequired: number;
  }
) {
  const employee = await transaction.employee.findUnique({
    where: {
      id: input.employeeId,
    },
    select: {
      departmentId: true,
    },
  });

  if (!employee?.departmentId) {
    return undefined;
  }

  const department = await transaction.department.findUnique({
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

  let nextApproverEmployeeId: string | undefined;

  if (input.approvalStepsCompleted === 0) {
    nextApproverEmployeeId = department.managerId;
  }

  if (
    input.approvalStepsRequired >= 2 &&
    input.approvalStepsCompleted === 1
  ) {
    nextApproverEmployeeId = department.finalApproverId ?? undefined;
  }

  if (!nextApproverEmployeeId) {
    return undefined;
  }

  return getUserIdByEmployeeIdWithTransaction(
    transaction,
    nextApproverEmployeeId
  );
}