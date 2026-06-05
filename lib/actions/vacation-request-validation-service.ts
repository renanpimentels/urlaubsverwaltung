import type { PrismaClient } from "@prisma/client";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type ValidateVacationRequestInput = {
  employeeId: string;
  absenceType: "Urlaub" | "Sonderurlaub";
  startDate: Date;
  endDate: Date;
  days: number;
  excludeRequestId?: string;
};

type ExistingRequestOverlapInput = {
  employeeId: string;
  startDate: Date;
  endDate: Date;
  excludeRequestId?: string;
};

export async function hasOverlappingVacationRequest(
  transaction: PrismaTransactionClient,
  {
    employeeId,
    startDate,
    endDate,
    excludeRequestId,
  }: ExistingRequestOverlapInput
) {
  const overlappingRequest = await transaction.vacationRequest.findFirst({
    where: {
      employeeId,
      status: {
        in: ["Ausstehend", "Genehmigt"],
      },
      id: excludeRequestId
        ? {
            not: excludeRequestId,
          }
        : undefined,
      startDate: {
        lte: endDate,
      },
      endDate: {
        gte: startDate,
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(overlappingRequest);
}

export async function assertVacationBalanceIsSufficient(
  transaction: PrismaTransactionClient,
  {
    employeeId,
    absenceType,
    startDate,
    days,
    excludeRequestId,
  }: ValidateVacationRequestInput
) {
  if (absenceType !== "Urlaub") {
    return;
  }

  const year = startDate.getUTCFullYear();

  const balance = await transaction.vacationBalance.findUnique({
    where: {
      employeeId_year: {
        employeeId,
        year,
      },
    },
  });

  if (!balance) {
    throw new Error("No vacation balance found for this employee and year.");
  }

  let availableDays = balance.available;

  if (excludeRequestId) {
    const existingRequest = await transaction.vacationRequest.findUnique({
      where: {
        id: excludeRequestId,
      },
      select: {
        absenceType: true,
        days: true,
        startDate: true,
        status: true,
        approvalStepsCompleted: true,
      },
    });

    if (
      existingRequest?.absenceType === "Urlaub" &&
      existingRequest.status === "Ausstehend" &&
      existingRequest.approvalStepsCompleted === 0 &&
      existingRequest.startDate.getUTCFullYear() === year
    ) {
      availableDays += existingRequest.days;
    }
  }

  if (days > availableDays) {
    throw new Error("Not enough available vacation days.");
  }
}

export async function assertVacationRequestCanBeSaved(
  transaction: PrismaTransactionClient,
  input: ValidateVacationRequestInput
) {
  const hasOverlap = await hasOverlappingVacationRequest(transaction, {
    employeeId: input.employeeId,
    startDate: input.startDate,
    endDate: input.endDate,
    excludeRequestId: input.excludeRequestId,
  });

  if (hasOverlap) {
    throw new Error(
      "There is already a pending or approved request in this period."
    );
  }

  await assertVacationBalanceIsSufficient(transaction, input);
}