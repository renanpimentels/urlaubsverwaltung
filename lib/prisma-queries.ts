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

async function getVisibleDepartmentIdsForUserFromDb(
  employeeId: string | undefined,
  role: UserRole
) {
  if (role === "hr" || role === "admin") {
    const departments = await prisma.department.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    return departments.map((department) => department.id);
  }

  if (!employeeId) {
    return [];
  }

  if (role === "employee") {
    const currentEmployee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      select: {
        departmentId: true,
      },
    });

    return currentEmployee?.departmentId ? [currentEmployee.departmentId] : [];
  }

  const currentEmployee = await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
    select: {
      departmentId: true,
    },
  });

  const departmentFilters = [];

  if (currentEmployee?.departmentId) {
    departmentFilters.push({
      id: currentEmployee.departmentId,
    });
  }

  departmentFilters.push({
    managerId: employeeId,
  });

  departmentFilters.push({
    finalApproverId: employeeId,
  });

  const departments = await prisma.department.findMany({
    where: {
      isActive: true,
      OR: departmentFilters,
    },
    select: {
      id: true,
    },
  });

  return departments.map((department) => department.id);
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

  if (role === "employee") {
    const employees = await prisma.employee.findMany({
      where: {
        id: employeeId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return employees.map(mapPrismaEmployeeToAppEmployee);
  }

  if (role === "manager") {
    const visibleDepartmentIds = await getVisibleDepartmentIdsForUserFromDb(
      employeeId,
      role
    );

    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          {
            id: employeeId,
          },
          {
            departmentId: {
              in: visibleDepartmentIds,
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

  return [];
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

  const visibleEmployees = await getVisibleEmployeesForUserFromDb(
    employeeId,
    role
  );

  const visibleEmployeeIds = visibleEmployees.map((employee) => employee.id);

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

export async function getVacationRequestByIdFromDb(id: string) {
  const request = await prisma.vacationRequest.findUnique({
    where: {
      id,
    },
  });

  return request
    ? mapPrismaVacationRequestToAppVacationRequest(request)
    : undefined;
}

export async function getApprovalDecisionsByRequestIdFromDb(
  vacationRequestId: string
): Promise<ApprovalDecisionWithApprover[]> {
  const request = await prisma.vacationRequest.findUnique({
    where: {
      id: vacationRequestId,
    },
    select: {
      employee: {
        select: {
          departmentId: true,
        },
      },
    },
  });

  const department = request?.employee.departmentId
    ? await prisma.department.findUnique({
        where: {
          id: request.employee.departmentId,
        },
        select: {
          managerId: true,
          finalApproverId: true,
        },
      })
    : undefined;

  const decisions = await prisma.approvalDecision.findMany({
    where: {
      vacationRequestId,
    },
    orderBy: {
      stepOrder: "asc",
    },
  });

  const expectedApproverIdsByStep = new Map<number, string | undefined>([
    [1, department?.managerId],
    [2, department?.finalApproverId ?? undefined],
  ]);

  const decidedByUserIds = decisions
    .map((decision) => decision.decidedByUserId)
    .filter((userId): userId is string => Boolean(userId));

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: decidedByUserIds,
      },
    },
    select: {
      id: true,
      email: true,
      employeeId: true,
    },
  });

  const usersById = new Map(users.map((user) => [user.id, user]));

  const employeeIds = Array.from(
    new Set(
      [
        ...decisions.map((decision) => decision.approverEmployeeId),
        ...Array.from(expectedApproverIdsByStep.values()).filter(
          (employeeId): employeeId is string => Boolean(employeeId)
        ),
        ...users
          .map((user) => user.employeeId)
          .filter((employeeId): employeeId is string => Boolean(employeeId)),
      ].filter(Boolean)
    )
  );

  const employees = await prisma.employee.findMany({
    where: {
      id: {
        in: employeeIds,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const employeesById = new Map(
    employees.map((employee) => [employee.id, employee])
  );

  return decisions.map((decision) => {
    const expectedApproverEmployeeId = expectedApproverIdsByStep.get(
      decision.stepOrder
    );

    const decidedByUser = decision.decidedByUserId
      ? usersById.get(decision.decidedByUserId)
      : undefined;

    const decidedByEmployee = decidedByUser?.employeeId
      ? employeesById.get(decidedByUser.employeeId)
      : undefined;

    const approver = employeesById.get(decision.approverEmployeeId);

    const expectedApprover = expectedApproverEmployeeId
      ? employeesById.get(expectedApproverEmployeeId)
      : undefined;

    const isOverride = Boolean(
      expectedApproverEmployeeId &&
        decidedByUser?.employeeId &&
        expectedApproverEmployeeId !== decidedByUser.employeeId
    );

    return {
      id: decision.id,
      vacationRequestId: decision.vacationRequestId,
      approverEmployeeId: decision.approverEmployeeId,
      stepOrder: decision.stepOrder,
      decision: decision.decision,
      decidedAt: decision.decidedAt.toISOString().slice(0, 10),
      decidedAtDateTime: decision.decidedAt.toISOString(),
      comment: decision.comment ?? undefined,
      approverName: approver?.name ?? "Unbekannter Genehmiger",
      expectedApproverEmployeeId,
      expectedApproverName: expectedApprover?.name,
      decidedByUserId: decidedByUser?.id,
      decidedByUserEmail: decidedByUser?.email,
      decidedByEmployeeId: decidedByUser?.employeeId ?? undefined,
      decidedByEmployeeName: decidedByEmployee?.name,
      isOverride,
    };
  });
}

export async function getVisibleUpcomingAbsencesForUserFromDb(
  employeeId: string | undefined,
  role: UserRole
) {
  const visibleRequests = await getVisibleVacationRequestsForUserFromDb(
    employeeId,
    role
  );

  return visibleRequests.filter((request) => request.status === "Genehmigt");
}

export async function getNextApproverIdForVacationRequestFromDb(
  request: VacationRequest
) {
  if (request.status !== "Ausstehend") {
    return undefined;
  }

  const employee = await prisma.employee.findUnique({
    where: {
      id: request.employeeId,
    },
    select: {
      departmentId: true,
    },
  });

  if (!employee?.departmentId) {
    return undefined;
  }

  const department = await prisma.department.findUnique({
    where: {
      id: employee.departmentId,
    },
    select: {
      managerId: true,
      finalApproverId: true,
    },
  });

  if (!department) {
    return undefined;
  }

  if (request.approvalStepsCompleted === 0) {
    return department.managerId;
  }

  if (request.approvalStepsCompleted === 1) {
    return department.finalApproverId ?? undefined;
  }

  return undefined;
}

export async function getVisibleApprovalRequestsForUserFromDb(
  employeeId: string | undefined,
  role: UserRole
) {
  if (role === "employee") {
    return [];
  }

  const pendingRequests = await prisma.vacationRequest.findMany({
    where: {
      status: "Ausstehend",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const mappedPendingRequests = pendingRequests.map(
    mapPrismaVacationRequestToAppVacationRequest
  );

  if (role === "hr" || role === "admin") {
    return mappedPendingRequests;
  }

  if (!employeeId) {
    return [];
  }

  const approvableRequests = [];

  for (const request of mappedPendingRequests) {
    const nextApproverId = await getNextApproverIdForVacationRequestFromDb(
      request
    );

    if (nextApproverId === employeeId) {
      approvableRequests.push(request);
    }
  }

  return approvableRequests;
}

export async function getSelectableEmployeesForVacationRequestFromDb(
  employeeId: string | undefined,
  role: UserRole
) {
  return getVisibleEmployeesForUserFromDb(employeeId, role);
}

export async function getVisibleDepartmentsForUserFromDb(
  employeeId: string | undefined,
  role: UserRole
) {
  if (role === "hr" || role === "admin") {
    return prisma.department.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  if (!employeeId) {
    return [];
  }

  const visibleDepartmentIds = await getVisibleDepartmentIdsForUserFromDb(
    employeeId,
    role
  );

  return prisma.department.findMany({
    where: {
      id: {
        in: visibleDepartmentIds,
      },
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getVisibleEmployeesForUserByDepartmentFromDb(
  employeeId: string | undefined,
  role: UserRole,
  departmentId: string | undefined
) {
  const visibleEmployees = await getVisibleEmployeesForUserFromDb(
    employeeId,
    role
  );

  if (!departmentId) {
    return visibleEmployees;
  }

  return visibleEmployees.filter(
    (employee) => employee.departmentId === departmentId
  );
}

export async function canUserViewEmployeeFromDb(
  currentEmployeeId: string | undefined,
  role: UserRole,
  targetEmployeeId: string
) {
  if (role === "hr" || role === "admin") {
    return true;
  }

  if (!currentEmployeeId) {
    return false;
  }

  if (currentEmployeeId === targetEmployeeId) {
    return true;
  }

  if (role !== "manager") {
    return false;
  }

  const targetEmployee = await prisma.employee.findUnique({
    where: {
      id: targetEmployeeId,
    },
    select: {
      departmentId: true,
    },
  });

  if (!targetEmployee?.departmentId) {
    return false;
  }

  const visibleDepartmentIds = await getVisibleDepartmentIdsForUserFromDb(
    currentEmployeeId,
    role
  );

  return visibleDepartmentIds.includes(targetEmployee.departmentId);
}

export async function canEditOwnVacationRequestFromDb(
  request: VacationRequest,
  currentEmployeeId: string | undefined
) {
  return (
    Boolean(currentEmployeeId) &&
    request.employeeId === currentEmployeeId &&
    request.status === "Ausstehend" &&
    request.approvalStepsCompleted === 0
  );
}

export async function getCompanySettingsFromDb() {
  return prisma.companySettings.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getDepartmentsWithApproversFromDb() {
  return prisma.department.findMany({
    include: {
      manager: {
        select: {
          id: true,
          name: true,
          position: true,
          isActive: true,
        },
      },
      finalApprover: {
        select: {
          id: true,
          name: true,
          position: true,
          isActive: true,
        },
      },
      employees: {
        select: {
          id: true,
          isActive: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getEmployeesForSettingsSelectFromDb() {
  const employees = await prisma.employee.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return employees.map(mapPrismaEmployeeToAppEmployee);
}

export async function getUsersWithEmployeesForSettingsFromDb() {
  const users = await prisma.user.findMany({
    orderBy: {
      email: "asc",
    },
  });

  const employeeIds = users
    .map((user) => user.employeeId)
    .filter((employeeId): employeeId is string => Boolean(employeeId));

  const employees = await prisma.employee.findMany({
    where: {
      id: {
        in: employeeIds,
      },
    },
    select: {
      id: true,
      name: true,
      position: true,
      isActive: true,
    },
  });

  const employeesById = new Map(
    employees.map((employee) => [employee.id, employee])
  );

  return users.map((user) => {
    const employee = user.employeeId
      ? employeesById.get(user.employeeId)
      : undefined;

    return {
      id: user.id,
      email: user.email,
      employeeId: user.employeeId ?? undefined,
      role: user.role,
      isActive: user.isActive,
      employeeName: employee?.name,
      employeePosition: employee?.position,
      employeeIsActive: employee?.isActive,
    };
  });
}

export async function getUserByEmployeeIdFromDb(employeeId: string) {
  return prisma.user.findUnique({
    where: {
      employeeId,
    },
  });
}