-- CreateTable
CREATE TABLE "CancellationRequest" (
    "id" TEXT NOT NULL,
    "vacationRequestId" TEXT NOT NULL,
    "requestedByUserId" TEXT NOT NULL,
    "decidedByUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ausstehend',
    "reason" TEXT NOT NULL,
    "decisionComment" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CancellationRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CancellationRequest" ADD CONSTRAINT "CancellationRequest_vacationRequestId_fkey" FOREIGN KEY ("vacationRequestId") REFERENCES "VacationRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationRequest" ADD CONSTRAINT "CancellationRequest_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationRequest" ADD CONSTRAINT "CancellationRequest_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
