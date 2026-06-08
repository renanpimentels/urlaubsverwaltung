"use server";

import { revalidatePath } from "next/cache";

import {
  canAccessSettingsRole,
  getCurrentUserFromDb,
} from "@/lib/current-user-server";
import { prisma } from "@/lib/prisma";

type UpdateEmployeeInput = {
  employeeId: string;
  name: string;
  email: string;
  departmentId: string;
  position: string;
  employmentStartDate: string;
  contractVacationDaysPerYear: number;
  isActive: boolean;
};

function getCurrentYear() {
  return new Date().getFullYear();
}

function calculateAvailableBalance(balance: {
  total: number;
  used: number;
  pending: number;
  carriedOver: number;
}) {
  return balance.total + balance.carriedOver - balance.used - balance.pending;
}

async function assertEmployeeCanBeDeactivated(employeeId: string) {
  const pendingVacationRequestCount = await prisma.vacationRequest.count({
    where: {
      employeeId,
      status: "Ausstehend",
    },
  });

  if (pendingVacationRequestCount > 0) {
    throw new Error(
      "Employee cannot be deactivated while pending vacation requests exist."
    );
  }

  const activeManagedDepartmentCount = await prisma.department.count({
    where: {
      isActive: true,
      managerId: employeeId,
    },
  });

  if (activeManagedDepartmentCount > 0) {
    throw new Error(
      "Employee cannot be deactivated while assigned as manager of an active department."
    );
  }

  const activeFinalApproverDepartmentCount = await prisma.department.count({
    where: {
      isActive: true,
      finalApproverId: employeeId,
    },
  });

  if (activeFinalApproverDepartmentCount > 0) {
    throw new Error(
      "Employee cannot be deactivated while assigned as final approver of an active department."
    );
  }
}

export async function updateEmployeeAction(input: UpdateEmployeeInput) {
  const currentUser = await getCurrentUserFromDb();

  if (!canAccessSettingsRole(currentUser.role)) {
    throw new Error("Current user cannot edit employees.");
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const position = input.position.trim();

  if (!input.employeeId) {
    throw new Error("Employee is required.");
  }

  if (!name) {
    throw new Error("Name is required.");
  }

  if (!email) {
    throw new Error("Email is required.");
  }

  if (!input.departmentId) {
    throw new Error("Department is required.");
  }

  if (!position) {
    throw new Error("Position is required.");
  }

  if (!input.employmentStartDate) {
    throw new Error("Employment start date is required.");
  }

  if (
    !Number.isInteger(input.contractVacationDaysPerYear) ||
    input.contractVacationDaysPerYear < 1 ||
    input.contractVacationDaysPerYear > 60
  ) {
    throw new Error("Contract vacation days must be between 1 and 60.");
  }

  const employee = await prisma.employee.findUnique({
    where: {
      id: input.employeeId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found.");
  }

  const department = await prisma.department.findUnique({
    where: {
      id: input.departmentId,
    },
  });

  if (!department || !department.isActive) {
    throw new Error("Department not found or inactive.");
  }

  const linkedUser = await prisma.user.findUnique({
    where: {
      employeeId: input.employeeId,
    },
  });

  if (!linkedUser) {
    throw new Error("Linked user not found.");
  }

  const existingUserWithEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUserWithEmail && existingUserWithEmail.id !== linkedUser.id) {
    throw new Error("A user with this email already exists.");
  }

  if (employee.isActive && !input.isActive) {
    await assertEmployeeCanBeDeactivated(input.employeeId);
  }

  const year = getCurrentYear();

  await prisma.$transaction(async (transaction) => {
    await transaction.employee.update({
      where: {
        id: input.employeeId,
      },
      data: {
        name,
        departmentId: input.departmentId,
        position,
        employmentStartDate: new Date(input.employmentStartDate),
        contractVacationDaysPerYear: input.contractVacationDaysPerYear,
        isActive: input.isActive,
      },
    });

    await transaction.user.update({
      where: {
        id: linkedUser.id,
      },
      data: {
        email,
        isActive: input.isActive,
      },
    });

    const currentBalance = await transaction.vacationBalance.findUnique({
      where: {
        employeeId_year: {
          employeeId: input.employeeId,
          year,
        },
      },
    });

    if (currentBalance) {
      const available = calculateAvailableBalance({
        total: input.contractVacationDaysPerYear,
        used: currentBalance.used,
        pending: currentBalance.pending,
        carriedOver: currentBalance.carriedOver,
      });

      await transaction.vacationBalance.update({
        where: {
          id: currentBalance.id,
        },
        data: {
          total: input.contractVacationDaysPerYear,
          available,
        },
      });
    } else {
      const total = input.contractVacationDaysPerYear;
      const used = 0;
      const pending = 0;
      const carriedOver = 0;
      const available = calculateAvailableBalance({
        total,
        used,
        pending,
        carriedOver,
      });

      await transaction.vacationBalance.create({
        data: {
          employeeId: input.employeeId,
          year,
          total,
          used,
          pending,
          available,
          carriedOver,
        },
      });
    }
  });

  revalidatePath("/");
  revalidatePath("/mitarbeiter");
  revalidatePath(`/mitarbeiter/${input.employeeId}`);
  revalidatePath(`/mitarbeiter/${input.employeeId}/bearbeiten`);
  revalidatePath("/urlaubsantraege");
  revalidatePath("/genehmigungen");
  revalidatePath("/einstellungen");

  return {
    message: input.isActive
      ? "Der Mitarbeiter wurde gespeichert."
      : "Der Mitarbeiter und der verknüpfte Benutzer wurden deaktiviert.",
  };
}