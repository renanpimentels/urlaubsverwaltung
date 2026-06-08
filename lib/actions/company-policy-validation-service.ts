import type { PrismaClient } from "@prisma/client";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type CompanyPolicyValidationInput = {
  startDate: Date;
  comment: string;
};

function getStartOfToday() {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

function addDays(date: Date, days: number) {
  const newDate = new Date(date);
  newDate.setUTCDate(newDate.getUTCDate() + days);

  return newDate;
}

export async function assertCompanyPolicyAllowsVacationRequest(
  transaction: PrismaTransactionClient,
  { startDate, comment }: CompanyPolicyValidationInput
) {
  const companySettings = await transaction.companySettings.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!companySettings) {
    return;
  }

  const startOfToday = getStartOfToday();

  if (!companySettings.allowPastVacationRequests && startDate < startOfToday) {
    throw new Error("Vacation requests in the past are not allowed.");
  }

  if (
    companySettings.minimumNoticeDays > 0 &&
    startDate < addDays(startOfToday, companySettings.minimumNoticeDays)
  ) {
    throw new Error("Vacation request does not meet the minimum notice period.");
  }

  if (
    companySettings.requireVacationRequestComment &&
    !comment.trim()
  ) {
    throw new Error("Vacation request comment is required.");
  }
}