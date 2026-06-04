import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";


import {
  approvalDecisions,
  companySettings,
  departments,
  employees,
  users,
  vacationBalances,
  vacationRequests,
} from "../lib/mock-data";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.approvalDecision.deleteMany();
  await prisma.vacationRequest.deleteMany();
  await prisma.vacationBalance.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.companySettings.deleteMany();

  for (const employee of employees) {
    await prisma.employee.create({
      data: {
        id: employee.id,
        name: employee.name,
        position: employee.role,
        employmentStartDate: new Date(employee.employmentStartDate),
        contractVacationDaysPerYear: employee.contractVacationDaysPerYear,
        isActive: employee.isActive,
      },
    });
  }

  for (const department of departments) {
    await prisma.department.create({
      data: {
        id: department.id,
        name: department.name,
        managerId: department.managerId,
        finalApproverId: department.finalApproverId,
      },
    });
  }

  for (const employee of employees) {
    await prisma.employee.update({
      where: {
        id: employee.id,
      },
      data: {
        departmentId: employee.departmentId,
      },
    });
  }

  for (const user of users) {
    await prisma.user.create({
      data: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  }

  await prisma.companySettings.create({
    data: {
      id: "company-settings-001",
      defaultVacationDaysPerYear:
        companySettings.defaultVacationDaysPerYear,
    },
  });

  for (const vacationRequest of vacationRequests) {
    await prisma.vacationRequest.create({
      data: {
        id: vacationRequest.id,
        employeeId: vacationRequest.employeeId,
        createdByUserId:
          users.find((user) => user.employeeId === vacationRequest.employeeId)
            ?.id ?? null,
        absenceType: vacationRequest.absenceType,
        startDate: new Date(vacationRequest.startDate),
        endDate: new Date(vacationRequest.endDate),
        days: vacationRequest.days,
        status: vacationRequest.status,
        createdAt: new Date(vacationRequest.createdAt),
        approvalStepsCompleted: vacationRequest.approvalStepsCompleted,
        approvalStepsRequired: vacationRequest.approvalStepsRequired,
        comment: vacationRequest.comment,
      },
    });
  }

  for (const vacationBalance of vacationBalances) {
    await prisma.vacationBalance.create({
      data: {
        id: vacationBalance.id,
        employeeId: vacationBalance.employeeId,
        year: vacationBalance.year,
        total: vacationBalance.total,
        used: vacationBalance.used,
        pending: vacationBalance.pending,
        available: vacationBalance.available,
        carriedOver: vacationBalance.carriedOver,
        expiresAt: vacationBalance.expiresAt
          ? new Date(vacationBalance.expiresAt)
          : null,
      },
    });
  }

  for (const approvalDecision of approvalDecisions) {
    await prisma.approvalDecision.create({
      data: {
        id: approvalDecision.id,
        vacationRequestId: approvalDecision.vacationRequestId,
        approverEmployeeId: approvalDecision.approverEmployeeId,
        decidedByUserId:
          users.find(
            (user) => user.employeeId === approvalDecision.approverEmployeeId
          )?.id ?? null,
        stepOrder: approvalDecision.stepOrder,
        decision: approvalDecision.decision,
        decidedAt: new Date(approvalDecision.decidedAt),
        comment: approvalDecision.comment,
      },
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });