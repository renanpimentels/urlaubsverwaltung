import "server-only";

import { currentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/lib/types";

export type CurrentUser = {
  id: string;
  email: string;
  employeeId?: string;
  role: UserRole;
  isActive: boolean;
};

export async function getCurrentUserFromDb(): Promise<CurrentUser> {
  const user = await prisma.user.findUnique({
    where: {
      id: currentUserId,
    },
  });

  if (!user) {
    throw new Error(`Current user not found: ${currentUserId}`);
  }

  return {
    id: user.id,
    email: user.email,
    employeeId: user.employeeId ?? undefined,
    role: user.role,
    isActive: user.isActive,
  };
}

export async function getActiveCurrentUserFromDb(): Promise<CurrentUser> {
  const currentUser = await getCurrentUserFromDb();

  if (!currentUser.isActive) {
    throw new Error("Current user is inactive.");
  }

  return currentUser;
}

export function canAccessSettingsRole(role: UserRole) {
  return role === "hr" || role === "admin";
}