import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import {
  companySettings,
  departments,
  employees,
  users,
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

function getCurrentYear() {
  return new Date().getFullYear();
}

async function main() {
  const currentYear = getCurrentYear();

  // Limpa dados dependentes primeiro.
  await prisma.approvalDecision.deleteMany();
  await prisma.cancellationRequest.deleteMany();
  await prisma.vacationRequest.deleteMany();
  await prisma.vacationBalance.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // Remove a ligação Employee -> Department antes de apagar departamentos.
  await prisma.employee.updateMany({
    data: {
      departmentId: null,
    },
  });

  await prisma.department.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.companySettings.deleteMany();

  // 1. Criar funcionários sem departmentId.
  // Department depende de managerId/finalApproverId, então Employee precisa existir antes.
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

  // 2. Criar departamentos.
  for (const department of departments) {
    const departmentWithOptionalSettings = department as {
      id: string;
      name: string;
      managerId: string;
      finalApproverId?: string | null;
      approvalStepsRequired?: number;
      isActive?: boolean;
    };

    await prisma.department.create({
      data: {
        id: departmentWithOptionalSettings.id,
        name: departmentWithOptionalSettings.name,
        managerId: departmentWithOptionalSettings.managerId,
        finalApproverId:
          departmentWithOptionalSettings.finalApproverId ?? null,
        approvalStepsRequired:
          departmentWithOptionalSettings.approvalStepsRequired ?? 2,
        isActive: departmentWithOptionalSettings.isActive ?? true,
      },
    });
  }

  // 3. Ligar funcionários aos departamentos.
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

  // 4. Criar usuários.
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

  // 5. Criar configurações da empresa.
  const companySettingsWithOptionalFields = companySettings as {
    defaultVacationDaysPerYear: number;
    allowPastVacationRequests?: boolean;
    requireVacationRequestComment?: boolean;
    minimumNoticeDays?: number;
    allowHalfVacationDays?: boolean;
    federalState?: string;
  };

  await prisma.companySettings.create({
    data: {
      id: "company-settings-001",
      defaultVacationDaysPerYear:
        companySettingsWithOptionalFields.defaultVacationDaysPerYear,
      allowPastVacationRequests:
        companySettingsWithOptionalFields.allowPastVacationRequests ?? false,
      requireVacationRequestComment:
        companySettingsWithOptionalFields.requireVacationRequestComment ?? false,
      minimumNoticeDays:
        companySettingsWithOptionalFields.minimumNoticeDays ?? 0,
      allowHalfVacationDays:
        companySettingsWithOptionalFields.allowHalfVacationDays ?? false,
      federalState: companySettingsWithOptionalFields.federalState ?? "NW",
    },
  });

  // 6. Criar saldo inicial zerado para cada funcionário no ano atual.
  for (const employee of employees) {
    const total = employee.contractVacationDaysPerYear;

    await prisma.vacationBalance.create({
      data: {
        id: `balance-${employee.id}-${currentYear}`,
        employeeId: employee.id,
        year: currentYear,
        total,
        used: 0,
        pending: 0,
        available: total,
        carriedOver: 0,
        expiresAt: null,
      },
    });
  }

  console.log("Lean seed completed.");
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