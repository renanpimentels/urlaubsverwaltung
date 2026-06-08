"use server";

import { revalidatePath } from "next/cache";

import {
  canAccessSettingsRole,
  getActiveCurrentUserFromDb,
} from "@/lib/current-user-server";
import { prisma } from "@/lib/prisma";

import type { UserRole } from "@/lib/types";


type UpdateUserRoleInput = {
  userId: string;
  role: UserRole;
};

type UpdateCompanySettingsInput = {
  defaultVacationDaysPerYear: number;
};

type CreateDepartmentInput = {
  name: string;
  managerId: string;
  finalApproverId: string;
};

type UpdateDepartmentInput = {
  departmentId: string;
  name: string;
  managerId: string;
  finalApproverId: string;
  isActive: boolean;
};

type UpdateDepartmentApproversInput = {
  departmentId: string;
  managerId: string;
  finalApproverId: string;
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
  transaction: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
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
  finalApproverId: string | null
) {
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

  if (!finalApproverId) {
    return;
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

export async function createDepartmentAction(input: CreateDepartmentInput) {
  await assertCanAccessSettings();

  const name = input.name.trim();
  const finalApproverId = input.finalApproverId || null;

  if (!name) {
    throw new Error("Department name is required.");
  }

  await validateDepartmentApprovers(input.managerId, finalApproverId);

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
        finalApproverId,
        isActive: true,
      },
    });

    await syncResponsibleUserRoles(transaction, [], [
      input.managerId,
      finalApproverId ?? "",
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
  const finalApproverId = input.finalApproverId || null;

  if (!input.departmentId) {
    throw new Error("Department is required.");
  }

  if (!name) {
    throw new Error("Department name is required.");
  }

  await validateDepartmentApprovers(input.managerId, finalApproverId);

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
        finalApproverId,
        isActive: input.isActive,
      },
    });

    await syncResponsibleUserRoles(
      transaction,
      [department.managerId, department.finalApproverId ?? ""],
      [input.managerId, finalApproverId ?? ""]
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

  const finalApproverId = input.finalApproverId || null;

  await validateDepartmentApprovers(input.managerId, finalApproverId);

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

    await syncResponsibleUserRoles(
      transaction,
      [department.managerId, department.finalApproverId ?? ""],
      [input.managerId, finalApproverId ?? ""]
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