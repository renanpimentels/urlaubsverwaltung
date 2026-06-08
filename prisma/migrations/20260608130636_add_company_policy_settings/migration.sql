-- AlterTable
ALTER TABLE "CompanySettings" ADD COLUMN     "allowHalfVacationDays" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowPastVacationRequests" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minimumNoticeDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "requireVacationRequestComment" BOOLEAN NOT NULL DEFAULT false;
