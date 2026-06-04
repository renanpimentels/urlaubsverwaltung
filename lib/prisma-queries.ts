import { prisma } from "@/lib/prisma";
import type { Employee, UserRole } from "@/lib/types";

function mapPrismaEmployeeToAppEmployee(employee: {
  id: string;
  name: string;
  departmentId: string | null;
  position: string;
  employmentStartDate: Date;
  contractVacationDaysPerYear: number;
  isActive: boolean;
}): Employee {
  return {
    id: employee.id,
    name: employee.name,
    departmentId: employee.departmentId ?? "",
    role: employee.position,
    employmentStartDate: employee.employmentStartDate
      .toISOString()
      .slice(0, 10),
    contractVacationDaysPerYear: employee.contractVacationDaysPerYear,
    isActive: employee.isActive,
  };
}

export async function getEmployeeByIdFromDb(id: string) {
  const employee = await prisma.employee.findUnique({
    where: {
      id,
    },
  });

  return employee ? mapPrismaEmployeeToAppEmployee(employee) : undefined;
}

export async function getVisibleEmployeesForUserFromDb(
  employeeId: string | undefined,
  role: UserRole
) {
  if (role === "hr" || role === "admin") {
    const employees = await prisma.employee.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return employees.map(mapPrismaEmployeeToAppEmployee);
  }

  if (!employeeId) {
    return [];
  }

  if (role === "manager") {
    const managedDepartments = await prisma.department.findMany({
      where: {
        managerId: employeeId,
      },
      select: {
        id: true,
      },
    });

    const managedDepartmentIds = managedDepartments.map(
      (department) => department.id
    );

    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          {
            id: employeeId,
          },
          {
            departmentId: {
              in: managedDepartmentIds,
            },
          },
        ],
      },
      orderBy: {
        name: "asc",
      },
    });

    return employees.map(mapPrismaEmployeeToAppEmployee);
  }

  const employees = await prisma.employee.findMany({
    where: {
      id: employeeId,
    },
  });

  return employees.map(mapPrismaEmployeeToAppEmployee);
}