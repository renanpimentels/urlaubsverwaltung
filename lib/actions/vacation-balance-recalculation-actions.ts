"use server";

import {
  canAccessSettingsRole,
  getActiveCurrentUserFromDb,
} from "@/lib/current-user-server";
import { prisma } from "@/lib/prisma";

type RecalculateVacationBalancesInput = {
  year: number;
};

function calculateAvailableBalance(balance: {
  total: number;
  used: number;
  pending: number;
  carriedOver: number;
}) {
  return balance.total + balance.carriedOver - balance.used - balance.pending;
}

function getCurrentYear() {
  return new Date().getFullYear();
}

export async function recalculateVacationBalancesAction(
  input: RecalculateVacationBalancesInput
) {
  const currentUser = await getActiveCurrentUserFromDb();

  if (!canAccessSettingsRole(currentUser.role)) {
    throw new Error("Current user cannot recalculate vacation balances.");
  }

  if (!Number.isInteger(input.year)) {
    throw new Error("Year must be an integer.");
  }

  if (input.year < 2000 || input.year > getCurrentYear() + 2) {
    throw new Error("Year is outside the allowed range.");
  }

  const employees = await prisma.employee.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      contractVacationDaysPerYear: true,
    },
  });

  let updatedCount = 0;
  let createdCount = 0;

  await prisma.$transaction(async (transaction) => {
    for (const employee of employees) {
      const existingBalance = await transaction.vacationBalance.findUnique({
        where: {
          employeeId_year: {
            employeeId: employee.id,
            year: input.year,
          },
        },
      });

      const approvedVacationRequests = await transaction.vacationRequest.findMany({
        where: {
          employeeId: employee.id,
          absenceType: "Urlaub",
          status: "Genehmigt",
          startDate: {
            gte: new Date(`${input.year}-01-01T00:00:00.000Z`),
            lt: new Date(`${input.year + 1}-01-01T00:00:00.000Z`),
          },
        },
        select: {
          days: true,
        },
      });

      const pendingVacationRequests = await transaction.vacationRequest.findMany({
        where: {
          employeeId: employee.id,
          absenceType: "Urlaub",
          status: "Ausstehend",
          startDate: {
            gte: new Date(`${input.year}-01-01T00:00:00.000Z`),
            lt: new Date(`${input.year + 1}-01-01T00:00:00.000Z`),
          },
        },
        select: {
          days: true,
        },
      });

      const used = approvedVacationRequests.reduce(
        (total, request) => total + request.days,
        0
      );

      const pending = pendingVacationRequests.reduce(
        (total, request) => total + request.days,
        0
      );

      const carriedOver = existingBalance?.carriedOver ?? 0;
      const total = employee.contractVacationDaysPerYear;
      const available = calculateAvailableBalance({
        total,
        used,
        pending,
        carriedOver,
      });

      if (existingBalance) {
        await transaction.vacationBalance.update({
          where: {
            id: existingBalance.id,
          },
          data: {
            total,
            used,
            pending,
            carriedOver,
            available,
          },
        });

        updatedCount += 1;
      } else {
        await transaction.vacationBalance.create({
          data: {
            employeeId: employee.id,
            year: input.year,
            total,
            used,
            pending,
            carriedOver,
            available,
          },
        });

        createdCount += 1;
      }
    }
  });

  return {
    message: `Urlaubssalden wurden neu berechnet. Aktualisiert: ${updatedCount}. Erstellt: ${createdCount}.`,
    updatedCount,
    createdCount,
  };
}