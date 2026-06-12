"use server";

import { revalidatePath } from "next/cache";

import { getActiveCurrentUserFromDb } from "@/lib/current-user-server";
import { prisma } from "@/lib/prisma";

export async function markNotificationAsReadAction(notificationId: string) {
  const currentUser = await getActiveCurrentUserFromDb();

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: currentUser.id,
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath("/");
}

export async function markAllNotificationsAsReadAction() {
  const currentUser = await getActiveCurrentUserFromDb();

  await prisma.notification.updateMany({
    where: {
      userId: currentUser.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath("/");
}