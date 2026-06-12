import { prisma } from "@/lib/prisma";
import type {
  AbsenceType,
  ApprovalDecisionWithApprover,
  CancellationRequestStatus,
  RequestStatus,
  UserRole,
  VacationRequest,
} from "@/lib/types";

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toIsoString(date: Date) {
  return date.toISOString();
}

function mapEmployee(employee: {
  id: string;
  name: string;
  departmentId: string | null;
  position: string;
  employmentStartDate: Date;
  contractVacationDaysPerYear: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: employee.id,
    name: employee.name,
    departmentId: employee.departmentId ?? undefined,
    role: employee.position,
    position: employee.position,
    employmentStartDate: toDateOnly(employee.employmentStartDate),
    contractVacationDaysPerYear: employee.contractVacationDaysPerYear,
    isActive: employee.isActive,
    createdAt: employee.createdAt ? toIsoString(employee.createdAt) : undefined,
    updatedAt: employee.updatedAt ? toIsoString(employee.updatedAt) : undefined,
  };
}

function mapVacationRequest(request: {
  id: string;
  employeeId: string;
  createdByUserId: string | null;
  absenceType: string;
  startDate: Date;
  endDate: Date;
  days: number;
  status: string;
  approvalStepsCompleted: number;
  approvalStepsRequired: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: request.id,
    employeeId: request.employeeId,
    createdByUserId: request.createdByUserId ?? undefined,
    absenceType: request.absenceType as AbsenceType,
    startDate: toDateOnly(request.startDate),
    endDate: toDateOnly(request.endDate),
    days: request.days,
    status: request.status as RequestStatus,
    approvalStepsCompleted: request.approvalStepsCompleted,
    approvalStepsRequired: request.approvalStepsRequired,
    comment: request.comment ?? undefined,
    createdAt: toIsoString(request.createdAt),
    updatedAt: toIsoString(request.updatedAt),
  };
}

function mapVacationBalance(balance: {
  id: string;
  employeeId: string;
  year: number;
  total: number;
  used: number;
  pending: number;
  available: number;
  carriedOver: number;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: balance.id,
    employeeId: balance.employeeId,
    year: balance.year,
    total: balance.total,
    used: balance.used,
    pending: balance.pending,
    available: balance.available,
    carriedOver: balance.carriedOver,
    createdAt: balance.createdAt ? toIsoString(balance.createdAt) : undefined,
    updatedAt: balance.updatedAt ? toIsoString(balance.updatedAt) : undefined,
  };
}

function mapNotification(notification: {
  id: string;
  userId: string;
  title: string;
  message: string;
  href: string | null;
  isRead: boolean;
  createdAt: Date;
}) {
  return {
    id: notification.id,
    userId: notification.userId,
    title: notification.title,
    message: notification.message,
    href: notification.href ?? undefined,
    isRead: notification.isRead,
    createdAt: toIsoString(notification.createdAt),
  };
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function getStartOfToday() {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

export async function getCompanySettingsFromDb() {
  return prisma.companySettings.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getUserByEmployeeIdFromDb(employeeId: string) {
  return prisma.user.findUnique({
    where: {
      employeeId,
    },
  });
}

export async function getDepartmentByIdFromDb(id: string) {
  return prisma.department.findUnique({
    where: {
      id,
    },
  });
}

export async function getEmployeeByIdFromDb(id: string) {
  const employee = await prisma.employee.findUnique({
    where: {
      id,
    },
  });

  return employee ? mapEmployee(employee) : undefined;
}

export async function getVacationRequestByIdFromDb(id: string) {
  const request = await prisma.vacationRequest.findUnique({
    where: {
      id,
    },
  });

  return request ? mapVacationRequest(request) : undefined;
}

export async function getVacationBalanceByEmployeeIdFromDb(
  employeeId: string,
  year = getCurrentYear()
) {
  const balance = await prisma.vacationBalance.findUnique({
    where: {
      employeeId_year: {
        employeeId,
        year,
      },
    },
  });

  return balance ? mapVacationBalance(balance) : undefined;
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

  return balances.map(mapVacationBalance);
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

  return requests.map(mapVacationRequest);
}

async function getResponsibleDepartmentIdsForEmployeeFromDb(
  employeeId: string
) {
  const departments = await prisma.department.findMany({
    where: {
      OR: [
        {
          managerId: employeeId,
        },
        {
          finalApproverId: employeeId,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return departments.map((department) => department.id);
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

  const currentEmployee = await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
    select: {
      departmentId: true,
    },
  });

  if (role === "manager") {
    const responsibleDepartmentIds =
      await getResponsibleDepartmentIdsForEmployeeFromDb(employeeId);

    const visibleDepartmentIds = Array.from(
      new Set(
        [
          currentEmployee?.departmentId,
          ...responsibleDepartmentIds,
        ].filter((departmentId): departmentId is string => Boolean(departmentId))
      )
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

  if (!currentEmployee?.departmentId) {
    return [];
  }

  return prisma.department.findMany({
    where: {
      id: currentEmployee.departmentId,
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
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

    return employees.map(mapEmployee);
  }

  if (!employeeId) {
    return [];
  }

  if (role === "manager") {
    const responsibleDepartmentIds =
      await getResponsibleDepartmentIdsForEmployeeFromDb(employeeId);

    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          {
            id: employeeId,
          },
          {
            departmentId: {
              in: responsibleDepartmentIds,
            },
          },
        ],
      },
      orderBy: {
        name: "asc",
      },
    });

    return employees.map(mapEmployee);
  }

  const employees = await prisma.employee.findMany({
    where: {
      id: employeeId,
    },
    orderBy: {
      name: "asc",
    },
  });

  return employees.map(mapEmployee);
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

  const responsibleDepartmentIds =
    await getResponsibleDepartmentIdsForEmployeeFromDb(currentEmployeeId);

  return responsibleDepartmentIds.includes(targetEmployee.departmentId);
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

    return requests.map(mapVacationRequest);
  }

  if (!employeeId) {
    return [];
  }

  if (role === "manager") {
    const responsibleDepartmentIds =
      await getResponsibleDepartmentIdsForEmployeeFromDb(employeeId);

    const employees = await prisma.employee.findMany({
      where: {
        departmentId: {
          in: responsibleDepartmentIds,
        },
      },
      select: {
        id: true,
      },
    });

    const visibleEmployeeIds = Array.from(
      new Set([employeeId, ...employees.map((employee) => employee.id)])
    );

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

    return requests.map(mapVacationRequest);
  }

  const requests = await prisma.vacationRequest.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return requests.map(mapVacationRequest);
}

export async function getVisibleUpcomingAbsencesForUserFromDb(
  employeeId: string | undefined,
  role: UserRole
) {
  const visibleRequests = await getVisibleVacationRequestsForUserFromDb(
    employeeId,
    role
  );

  const today = getStartOfToday();

  return visibleRequests.filter((request) => {
    return (
      request.status === "Genehmigt" &&
      new Date(`${request.endDate}T00:00:00.000Z`) >= today
    );
  });
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
      approvalStepsRequired: true,
    },
  });

  if (!department) {
    return undefined;
  }

  const approvalStepsRequired =
    request.approvalStepsRequired ?? department.approvalStepsRequired;

  if (request.approvalStepsCompleted === 0) {
    return department.managerId;
  }

  if (approvalStepsRequired >= 2 && request.approvalStepsCompleted === 1) {
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

  const mappedRequests = pendingRequests.map(mapVacationRequest);

  if (role === "hr" || role === "admin") {
    return mappedRequests;
  }

  if (!employeeId) {
    return [];
  }

  const approvableRequests = await Promise.all(
    mappedRequests.map(async (request) => {
      const nextApproverId = await getNextApproverIdForVacationRequestFromDb(
        request
      );

      return {
        request,
        nextApproverId,
      };
    })
  );

  return approvableRequests
    .filter(({ nextApproverId }) => nextApproverId === employeeId)
    .map(({ request }) => request);
}

export async function getApprovalDecisionsByRequestIdFromDb(
  vacationRequestId: string
): Promise<ApprovalDecisionWithApprover[]> {
  const request = await prisma.vacationRequest.findUnique({
    where: {
      id: vacationRequestId,
    },
    select: {
      approvalStepsRequired: true,
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
    [
      2,
      request && request.approvalStepsRequired >= 2
        ? department?.finalApproverId ?? undefined
        : undefined,
    ],
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
      decision: decision.decision as "approved" | "rejected",
      decidedAt: toDateOnly(decision.decidedAt),
      decidedAtDateTime: toIsoString(decision.decidedAt),
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

  return employees.map(mapEmployee);
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
      role: user.role as UserRole,
      isActive: user.isActive,
      employeeName: employee?.name,
      employeePosition: employee?.position,
      employeeIsActive: employee?.isActive,
    };
  });
}

export async function getCancellationRequestsByVacationRequestIdFromDb(
  vacationRequestId: string
) {
  const cancellationRequests = await prisma.cancellationRequest.findMany({
    where: {
      vacationRequestId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const requestedByUserIds = cancellationRequests.map(
    (request) => request.requestedByUserId
  );

  const decidedByUserIds = cancellationRequests
    .map((request) => request.decidedByUserId)
    .filter((userId): userId is string => Boolean(userId));

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: [...requestedByUserIds, ...decidedByUserIds],
      },
    },
    select: {
      id: true,
      email: true,
      employeeId: true,
    },
  });

  const usersById = new Map(users.map((user) => [user.id, user]));

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
    },
  });

  const employeesById = new Map(
    employees.map((employee) => [employee.id, employee])
  );

  return cancellationRequests.map((cancellationRequest) => {
    const requestedByUser = usersById.get(
      cancellationRequest.requestedByUserId
    );

    const decidedByUser = cancellationRequest.decidedByUserId
      ? usersById.get(cancellationRequest.decidedByUserId)
      : undefined;

    const requestedByEmployee = requestedByUser?.employeeId
      ? employeesById.get(requestedByUser.employeeId)
      : undefined;

    return {
      id: cancellationRequest.id,
      vacationRequestId: cancellationRequest.vacationRequestId,
      requestedByUserId: cancellationRequest.requestedByUserId,
      requestedByUserEmail: requestedByUser?.email,
      requestedByEmployeeName: requestedByEmployee?.name,
      decidedByUserId: cancellationRequest.decidedByUserId ?? undefined,
      decidedByUserEmail: decidedByUser?.email,
      status: cancellationRequest.status as CancellationRequestStatus,
      reason: cancellationRequest.reason,
      decisionComment: cancellationRequest.decisionComment ?? undefined,
      decidedAt: cancellationRequest.decidedAt?.toISOString(),
      createdAt: cancellationRequest.createdAt.toISOString(),
    };
  });
}

export async function getNotificationsForUserFromDb(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return notifications.map(mapNotification);
}

export async function getUnreadNotificationCountForUserFromDb(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}


export async function getSelectableEmployeesForVacationRequestFromDb(
  employeeId: string | undefined | null,
  role: UserRole
) {
  if (role === "hr" || role === "admin") {
    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return employees.map(mapEmployee);
  }

  if (!employeeId) {
    return [];
  }

  if (role === "manager") {
    const responsibleDepartmentIds =
      await getResponsibleDepartmentIdsForEmployeeFromDb(employeeId);

    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
        OR: [
          {
            id: employeeId,
          },
          {
            departmentId: {
              in: responsibleDepartmentIds,
            },
          },
        ],
      },
      orderBy: {
        name: "asc",
      },
    });

    return employees.map(mapEmployee);
  }

  const employees = await prisma.employee.findMany({
    where: {
      id: employeeId,
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return employees.map(mapEmployee);
}


export async function getVisibleVacationRequestsForUserByDateRangeFromDb(
  employeeId: string | undefined,
  role: UserRole,
  startDate: string,
  endDate: string
) {
  const visibleRequests = await getVisibleVacationRequestsForUserFromDb(
    employeeId,
    role
  );

  return visibleRequests.filter((request) => {
    const isRelevantStatus =
      request.status === "Genehmigt" || request.status === "Ausstehend";

    const overlapsDateRange =
      request.startDate <= endDate && request.endDate >= startDate;

    return isRelevantStatus && overlapsDateRange;
  });
}