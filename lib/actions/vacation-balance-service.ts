import type { PrismaClient } from "@prisma/client";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type ApplyVacationBalanceChangeInput = {
  employeeId: string;
  year: number;
  pendingDelta?: number;
  usedDelta?: number;
};

function calculateAvailableBalance(balance: {
  total: number;
  used: number;
  pending: number;
  carriedOver: number;
}) {
  return balance.total + balance.carriedOver - balance.used - balance.pending;
}

export function getVacationBalanceYearFromDate(date: Date) {
  return date.getUTCFullYear();
}

export async function applyVacationBalanceChange(
  transaction: PrismaTransactionClient,
  {
    employeeId,
    year,
    pendingDelta = 0,
    usedDelta = 0,
  }: ApplyVacationBalanceChangeInput
) {
  const existingBalance = await transaction.vacationBalance.findUnique({
    where: {
      employeeId_year: {
        employeeId,
        year,
      },
    },
  });

  if (existingBalance) {
    const updatedPending = existingBalance.pending + pendingDelta;
    const updatedUsed = existingBalance.used + usedDelta;

    const updatedAvailable = calculateAvailableBalance({
      total: existingBalance.total,
      used: updatedUsed,
      pending: updatedPending,
      carriedOver: existingBalance.carriedOver,
    });

    await transaction.vacationBalance.update({
      where: {
        id: existingBalance.id,
      },
      data: {
        pending: updatedPending,
        used: updatedUsed,
        available: updatedAvailable,
      },
    });

    return;
  }

  const employee = await transaction.employee.findUnique({
    where: {
      id: employeeId,
    },
    select: {
      contractVacationDaysPerYear: true,
    },
  });

  if (!employee) {
    throw new Error("Employee not found for vacation balance.");
  }

  const total = employee.contractVacationDaysPerYear;
  const used = usedDelta;
  const pending = pendingDelta;
  const carriedOver = 0;

  const available = calculateAvailableBalance({
    total,
    used,
    pending,
    carriedOver,
  });

  await transaction.vacationBalance.create({
    data: {
      employeeId,
      year,
      total,
      used,
      pending,
      available,
      carriedOver,
    },
  });
}