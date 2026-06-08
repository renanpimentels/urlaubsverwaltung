"use server";

import { revalidatePath } from "next/cache";

import {
  canAccessSettingsRole,
  getActiveCurrentUserFromDb,
} from "@/lib/current-user-server";
import { isGermanFederalStateCode } from "@/lib/german-federal-states";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/lib/types";

type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

type UpdateCompanySettingsInput = {
  defaultVacationDaysPerYear: number;
};

type UpdateCompanyPolicySettingsInput = {
  allowPastVacationRequests: boolean;
  requireVacationRequestComment: boolean;
  minimumNoticeDays: number;
  allowHalfVacationDays: boolean;
  federalState: string;
};

type CreateDepartmentInput = {
  name: string;
  managerId: string;
  finalApproverId: string;
  approvalStepsRequired: number;
};

type UpdateDepartmentInput = {
  departmentId: string;
  name: string;
  managerId: string;
  finalApproverId: string;
  approvalStepsRequired: number;
  isActive: boolean;
};

type UpdateDepartmentApproversInput = {
  departmentId: string;
  managerId: string;
  finalApproverId: string;
  approvalStepsRequired?: number;
};

type UpdateUserRoleInput = {
  userId: string;
  role: UserRole;
};

async function assertCanAccessSettings() {
  const currentUser = await getActiveCurrentUserFromDb();

  if (!canAccessSettingsRole(currentUser.role)) {
    throw new Error("Current user cannot access settings.");
  }
}

function uniqueEmployeeIds(employeeIds: string[]) {
  return Array.from(new Set(employeeIds.filter(Boolean)));
}

async function syncResponsibleUserRoles(
  transaction: PrismaTransactionClient,
  previousResponsibleEmployeeIds: string[],
  newResponsibleEmployeeIds: string[]
) {
  const uniquePreviousResponsibleEmployeeIds = uniqueEmployeeIds(
    previousResponsibleEmployeeIds
  );
  const uniqueNewResponsibleEmployeeIds = uniqueEmployeeIds(
    newResponsibleEmployeeIds
  );

  for (const employeeId of uniqueNewResponsibleEmployeeIds) {
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

  for (const employeeId of uniquePreviousResponsibleEmployeeIds) {
    if (uniqueNewResponsibleEmployeeIds.includes(employeeId)) {
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

    const remainingResponsibleDepartments = await transaction.department.count({
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
    });

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
}

async function validateDepartmentApprovers(
  managerId: string,
  finalApproverId: string | null,
  approvalStepsRequired: number
) {
  if (approvalStepsRequired !== 1 && approvalStepsRequired !== 2) {
    throw new Error("Approval steps must be 1 or 2.");
  }

  if (!managerId) {
    throw new Error("Manager is required.");
  }

  const manager = await prisma.employee.findUnique({
    where: {
      id: managerId,
    },
  });

  if (!manager || !manager.isActive) {
    throw new Error("Manager not found or inactive.");
  }

  if (approvalStepsRequired === 1) {
    return;
  }

  if (!finalApproverId) {
    throw new Error("Final approver is required for two-step approval.");
  }

  const finalApprover = await prisma.employee.findUnique({
    where: {
      id: finalApproverId,
    },
  });

  if (!finalApprover || !finalApprover.isActive) {
    throw new Error("Final approver not found or inactive.");
  }

  if (finalApproverId === managerId) {
    throw new Error("Manager and final approver should be different.");
  }
}

function normalizeApprovalStepsRequired(value: number | undefined) {
  return value === 1 ? 1 : 2;
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

export async function updateCompanyPolicySettingsAction(
  input: UpdateCompanyPolicySettingsInput
) {
  await assertCanAccessSettings();

  if (!Number.isInteger(input.minimumNoticeDays)) {
    throw new Error("Minimum notice days must be an integer.");
  }

  if (input.minimumNoticeDays < 0 || input.minimumNoticeDays > 365) {
    throw new Error("Minimum notice days must be between 0 and 365.");
  }

  if (!isGermanFederalStateCode(input.federalState)) {
    throw new Error("Invalid federal state.");
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
        allowPastVacationRequests: input.allowPastVacationRequests,
        requireVacationRequestComment: input.requireVacationRequestComment,
        minimumNoticeDays: input.minimumNoticeDays,
        allowHalfVacationDays: input.allowHalfVacationDays,
        federalState: input.federalState,
      },
    });
  } else {
    await prisma.companySettings.create({
      data: {
        defaultVacationDaysPerYear: 30,
        allowPastVacationRequests: input.allowPastVacationRequests,
        requireVacationRequestComment: input.requireVacationRequestComment,
        minimumNoticeDays: input.minimumNoticeDays,
        allowHalfVacationDays: input.allowHalfVacationDays,
        federalState: input.federalState,
      },
    });
  }

  revalidatePath("/einstellungen");
  revalidatePath("/urlaubsantraege");
  revalidatePath("/urlaubsantraege/neu");

  return {
    message: "Die Unternehmensrichtlinien wurden gespeichert.",
  };
}

export async function createDepartmentAction(input: CreateDepartmentInput) {
  await assertCanAccessSettings();

  const name = input.name.trim();
  const approvalStepsRequired = normalizeApprovalStepsRequired(
    input.approvalStepsRequired
  );
  const finalApproverId = input.finalApproverId || null;
  const normalizedFinalApproverId =
    approvalStepsRequired === 1 ? null : finalApproverId;

  if (!name) {
    throw new Error("Department name is required.");
  }

  await validateDepartmentApprovers(
    input.managerId,
    normalizedFinalApproverId,
    approvalStepsRequired
  );

  const existingDepartment = await prisma.department.findFirst({
    where: {
      name,
    },
  });

  if (existingDepartment) {
    throw new Error("A department with this name already exists.");
  }

  const createdDepartment = await prisma.$transaction(async (transaction) => {
    const department = await transaction.department.create({
      data: {
        name,
        managerId: input.managerId,
        finalApproverId: normalizedFinalApproverId,
        approvalStepsRequired,
        isActive: true,
      },
    });

    await syncResponsibleUserRoles(transaction, [], [
      input.managerId,
      normalizedFinalApproverId ?? "",
    ]);

    return department;
  });

  revalidatePath("/einstellungen");
  revalidatePath("/mitarbeiter");
  revalidatePath("/mitarbeiter-erstellen");
  revalidatePath("/genehmigungen");
  revalidatePath("/urlaubsantraege");

  return {
    departmentId: createdDepartment.id,
    message: "Die Abteilung wurde erstellt.",
  };
}

export async function updateDepartmentAction(input: UpdateDepartmentInput) {
  await assertCanAccessSettings();

  const name = input.name.trim();
  const approvalStepsRequired = normalizeApprovalStepsRequired(
    input.approvalStepsRequired
  );
  const finalApproverId = input.finalApproverId || null;
  const normalizedFinalApproverId =
    approvalStepsRequired === 1 ? null : finalApproverId;

  if (!input.departmentId) {
    throw new Error("Department is required.");
  }

  if (!name) {
    throw new Error("Department name is required.");
  }

  await validateDepartmentApprovers(
    input.managerId,
    normalizedFinalApproverId,
    approvalStepsRequired
  );

  const department = await prisma.department.findUnique({
    where: {
      id: input.departmentId,
    },
  });

  if (!department) {
    throw new Error("Department not found.");
  }

  const existingDepartmentWithName = await prisma.department.findFirst({
    where: {
      name,
      id: {
        not: input.departmentId,
      },
    },
  });

  if (existingDepartmentWithName) {
    throw new Error("A department with this name already exists.");
  }

  if (!input.isActive) {
    const activeEmployeesInDepartment = await prisma.employee.count({
      where: {
        departmentId: input.departmentId,
        isActive: true,
      },
    });

    if (activeEmployeesInDepartment > 0) {
      throw new Error(
        "A department with active employees cannot be deactivated."
      );
    }
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.department.update({
      where: {
        id: input.departmentId,
      },
      data: {
        name,
        managerId: input.managerId,
        finalApproverId: normalizedFinalApproverId,
        approvalStepsRequired,
        isActive: input.isActive,
      },
    });

    await syncResponsibleUserRoles(
      transaction,
      [department.managerId, department.finalApproverId ?? ""],
      [input.managerId, normalizedFinalApproverId ?? ""]
    );
  });

  revalidatePath("/");
  revalidatePath("/einstellungen");
  revalidatePath("/mitarbeiter");
  revalidatePath("/mitarbeiter-erstellen");
  revalidatePath("/genehmigungen");
  revalidatePath("/urlaubsantraege");

  return {
    message: "Die Abteilung wurde gespeichert.",
  };
}

export async function updateDepartmentApproversAction(
  input: UpdateDepartmentApproversInput
) {
  await assertCanAccessSettings();

  if (!input.departmentId) {
    throw new Error("Department is required.");
  }

  const department = await prisma.department.findUnique({
    where: {
      id: input.departmentId,
    },
  });

  if (!department) {
    throw new Error("Department not found.");
  }

  const approvalStepsRequired = normalizeApprovalStepsRequired(
    input.approvalStepsRequired ?? department.approvalStepsRequired
  );
  const finalApproverId = input.finalApproverId || null;
  const normalizedFinalApproverId =
    approvalStepsRequired === 1 ? null : finalApproverId;

  await validateDepartmentApprovers(
    input.managerId,
    normalizedFinalApproverId,
    approvalStepsRequired
  );

  await prisma.$transaction(async (transaction) => {
    await transaction.department.update({
      where: {
        id: input.departmentId,
      },
      data: {
        managerId: input.managerId,
        finalApproverId: normalizedFinalApproverId,
        approvalStepsRequired,
      },
    });

    await syncResponsibleUserRoles(
      transaction,
      [department.managerId, department.finalApproverId ?? ""],
      [input.managerId, normalizedFinalApproverId ?? ""]
    );
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

export async function updateUserRoleAction(input: UpdateUserRoleInput) {
  await assertCanAccessSettings();

  if (!input.userId) {
    throw new Error("User is required.");
  }

  const allowedRoles: UserRole[] = ["employee", "manager", "hr", "admin"];

  if (!allowedRoles.includes(input.role)) {
    throw new Error("Invalid user role.");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (input.role === "employee" && user.employeeId) {
    const responsibleDepartmentCount = await prisma.department.count({
      where: {
        OR: [
          {
            managerId: user.employeeId,
          },
          {
            finalApproverId: user.employeeId,
          },
        ],
      },
    });

    if (responsibleDepartmentCount > 0) {
      throw new Error(
        "A user responsible for departments cannot be changed to employee."
      );
    }
  }

  await prisma.user.update({
    where: {
      id: input.userId,
    },
    data: {
      role: input.role,
    },
  });

  revalidatePath("/");
  revalidatePath("/einstellungen");
  revalidatePath("/mitarbeiter");
  revalidatePath("/genehmigungen");
  revalidatePath("/urlaubsantraege");

  return {
    message: "Die Benutzerrolle wurde gespeichert.",
  };
}