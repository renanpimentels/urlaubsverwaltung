import { prisma } from "@/lib/prisma";
import type {
  ApprovalDecisionWithApprover,
  Employee,
  RequestStatus,
  UserRole,
  VacationBalance,
  VacationRequest,
} from "@/lib/types";

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

function mapPrismaVacationBalanceToAppVacationBalance(balance: {
  id: string;
  employeeId: string;
  year: number;
  total: number;
  used: number;
  pending: number;
  available: number;
  carriedOver: number;
  expiresAt: Date | null;
}): VacationBalance {
  return {
    id: balance.id,
    employeeId: balance.employeeId,
    year: balance.year,
    total: balance.total,
    used: balance.used,
    pending: balance.pending,
    available: balance.available,
    carriedOver: balance.carriedOver,
    expiresAt: balance.expiresAt
      ? balance.expiresAt.toISOString().slice(0, 10)
      : undefined,
  };
}

function mapPrismaVacationRequestToAppVacationRequest(request: {
  id: string;
  employeeId: string;
  absenceType: "Urlaub" | "Sonderurlaub";
  startDate: Date;
  endDate: Date;
  days: number;
  status: RequestStatus;
  createdAt: Date;
  approvalStepsCompleted: number;
  approvalStepsRequired: number;
  comment: string | null;
}): VacationRequest {
  return {
    id: request.id,
    employeeId: request.employeeId,
    absenceType: request.absenceType,
    startDate: request.startDate.toISOString().slice(0, 10),
    endDate: request.endDate.toISOString().slice(0, 10),
    days: request.days,
    status: request.status,
    createdAt: request.createdAt.toISOString().slice(0, 10),
    approvalStepsCompleted: request.approvalStepsCompleted,
    approvalStepsRequired: request.approvalStepsRequired,
    comment: request.comment ?? undefined,
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

export async function getDepartmentByIdFromDb(id: string) {
  return prisma.department.findUnique({
    where: {
      id,
    },
  });
}

export async function getVacationBalanceByEmployeeIdFromDb(
  employeeId: string,
  year = new Date().getFullYear()
) {
  const balance = await prisma.vacationBalance.findUnique({
    where: {
      employeeId_year: {
        employeeId,
        year,
      },
    },
  });

  return balance
    ? mapPrismaVacationBalanceToAppVacationBalance(balance)
    : undefined;
}

export async function getVacationBalancesByEmployeeIdFromDb(
  employeeId: string
) {
  const balances = await prisma.vacationBalance.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      year: "desc",
    },
  });

  return balances.map(mapPrismaVacationBalanceToAppVacationBalance);
}

export async function getVacationRequestsByEmployeeIdFromDb(
  employeeId: string
) {
  const requests = await prisma.vacationRequest.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return requests.map(mapPrismaVacationRequestToAppVacationRequest);
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

export async function getVisibleVacationRequestsForUserFromDb(
  employeeId: string | undefined,
  role: UserRole
) {
  if (role === "hr" || role === "admin") {
    const requests = await prisma.vacationRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return requests.map(mapPrismaVacationRequestToAppVacationRequest);
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

    const managedEmployees = await prisma.employee.findMany({
      where: {
        departmentId: {
          in: managedDepartmentIds,
        },
      },
      select: {
        id: true,
      },
    });

    const visibleEmployeeIds = [
      employeeId,
      ...managedEmployees.map((employee) => employee.id),
    ];

    const requests = await prisma.vacationRequest.findMany({
      where: {
        employeeId: {
          in: visibleEmployeeIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return requests.map(mapPrismaVacationRequestToAppVacationRequest);
  }

  const requests = await prisma.vacationRequest.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return requests.map(mapPrismaVacationRequestToAppVacationRequest);
}

export async function getVacationRequestByIdFromDb(id: string) {
  const request = await prisma.vacationRequest.findUnique({
    where: {
      id,
    },
  });

  return request ? mapPrismaVacationRequestToAppVacationRequest(request) : undefined;
}

export async function getApprovalDecisionsByRequestIdFromDb(
  vacationRequestId: string
): Promise<ApprovalDecisionWithApprover[]> {
  const decisions = await prisma.approvalDecision.findMany({
    where: {
      vacationRequestId,
    },
    include: {
      approver: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      stepOrder: "asc",
    },
  });

  return decisions.map((decision) => ({
    id: decision.id,
    vacationRequestId: decision.vacationRequestId,
    approverEmployeeId: decision.approverEmployeeId,
    stepOrder: decision.stepOrder,
    decision: decision.decision,
    decidedAt: decision.decidedAt.toISOString().slice(0, 10),
    comment: decision.comment ?? undefined,
    approverName: decision.approver.name,
  }));
}