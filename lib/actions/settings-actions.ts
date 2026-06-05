"use server";

import { revalidatePath } from "next/cache";

import {
  canAccessSettingsRole,
  getCurrentUserFromDb,
} from "@/lib/current-user-server";
import { prisma } from "@/lib/prisma";

type UpdateCompanySettingsInput = {
  defaultVacationDaysPerYear: number;
};

type UpdateDepartmentApproversInput = {
  departmentId: string;
  managerId: string;
  finalApproverId: string;
};

async function assertCanAccessSettings() {
  const currentUser = await getCurrentUserFromDb();

  if (!canAccessSettingsRole(currentUser.role)) {
    throw new Error("Current user cannot access settings.");
  }
}

export async function updateCompanySettingsAction(
  input: UpdateCompanySettingsInput
) {
  await assertCanAccessSettings();

  if (!Number.isInteger(input.defaultVacationDaysPerYear)) {
    throw new Error("Default vacation days must be an integer.");
  }

  if (
    input.defaultVacationDaysPerYear < 1 ||
    input.defaultVacationDaysPerYear > 60
  ) {
    throw new Error("Default vacation days must be between 1 and 60.");
  }

  const existingSettings = await prisma.companySettings.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (existingSettings) {
    await prisma.companySettings.update({
      where: {
        id: existingSettings.id,
      },
      data: {
        defaultVacationDaysPerYear: input.defaultVacationDaysPerYear,
      },
    });
  } else {
    await prisma.companySettings.create({
      data: {
        defaultVacationDaysPerYear: input.defaultVacationDaysPerYear,
      },
    });
  }

  revalidatePath("/einstellungen");
  revalidatePath("/mitarbeiter-erstellen");

  return {
    message: "Die globalen Urlaubseinstellungen wurden gespeichert.",
  };
}

export async function updateDepartmentApproversAction(
  input: UpdateDepartmentApproversInput
) {
  await assertCanAccessSettings();

  if (!input.departmentId) {
    throw new Error("Department is required.");
  }

  if (!input.managerId) {
    throw new Error("Manager is required.");
  }

  const department = await prisma.department.findUnique({
    where: {
      id: input.departmentId,
    },
  });

  if (!department) {
    throw new Error("Department not found.");
  }

  const manager = await prisma.employee.findUnique({
    where: {
      id: input.managerId,
    },
  });

  if (!manager || !manager.isActive) {
    throw new Error("Manager not found or inactive.");
  }

  const finalApproverId = input.finalApproverId || null;

  if (finalApproverId) {
    const finalApprover = await prisma.employee.findUnique({
      where: {
        id: finalApproverId,
      },
    });

    if (!finalApprover || !finalApprover.isActive) {
      throw new Error("Final approver not found or inactive.");
    }

    if (finalApproverId === input.managerId) {
      throw new Error("Manager and final approver should be different.");
    }
  }

  const previousManagerId = department.managerId;
  const previousFinalApproverId = department.finalApproverId;

  await prisma.$transaction(async (transaction) => {
    await transaction.department.update({
      where: {
        id: input.departmentId,
      },
      data: {
        managerId: input.managerId,
        finalApproverId,
      },
    });

    const newResponsibleEmployeeIds = [input.managerId];

    if (finalApproverId) {
      newResponsibleEmployeeIds.push(finalApproverId);
    }

    const previousResponsibleEmployeeIds = [
      previousManagerId,
      previousFinalApproverId,
    ].filter((employeeId): employeeId is string => Boolean(employeeId));

    for (const employeeId of newResponsibleEmployeeIds) {
      const user = await transaction.user.findUnique({
        where: {
          employeeId,
        },
      });

      if (user?.role === "employee") {
        await transaction.user.update({
          where: {
            id: user.id,
          },
          data: {
            role: "manager",
          },
        });
      }
    }

    for (const employeeId of previousResponsibleEmployeeIds) {
      if (newResponsibleEmployeeIds.includes(employeeId)) {
        continue;
      }

      const user = await transaction.user.findUnique({
        where: {
          employeeId,
        },
      });

      if (user?.role !== "manager") {
        continue;
      }

      const remainingResponsibleDepartments = await transaction.department.count(
        {
          where: {
            OR: [
              {
                managerId: employeeId,
              },
              {
                finalApproverId: employeeId,
              },
            ],
          },
        }
      );

      if (remainingResponsibleDepartments === 0) {
        await transaction.user.update({
          where: {
            id: user.id,
          },
          data: {
            role: "employee",
          },
        });
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/einstellungen");
  revalidatePath("/mitarbeiter");
  revalidatePath("/genehmigungen");
  revalidatePath("/urlaubsantraege");

  return {
    message: "Die Freigaberegeln der Abteilung wurden gespeichert.",
  };
}