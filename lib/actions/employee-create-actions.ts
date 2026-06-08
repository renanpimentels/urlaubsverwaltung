"use server";

import { redirect } from "next/navigation";

import {
  canAccessSettingsRole,
  getActiveCurrentUserFromDb,
} from "@/lib/current-user-server";
import { prisma } from "@/lib/prisma";

type CreateEmployeeInput = {
  name: string;
  email: string;
  departmentId: string;
  position: string;
  employmentStartDate: string;
  contractVacationDaysPerYear: number;
};

function getCurrentYear() {
  return new Date().getFullYear();
}

function calculateAvailableBalance(balance: {
  total: number;
  used: number;
  pending: number;
  carriedOver: number;
}) {
  return balance.total + balance.carriedOver - balance.used - balance.pending;
}

export async function createEmployeeAction(input: CreateEmployeeInput) {
  const currentUser = await getActiveCurrentUserFromDb();

  if (!canAccessSettingsRole(currentUser.role)) {
    throw new Error("Current user cannot create employees.");
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const position = input.position.trim();

  if (!name) {
    throw new Error("Name is required.");
  }

  if (!email) {
    throw new Error("Email is required.");
  }

  if (!input.departmentId) {
    throw new Error("Department is required.");
  }

  if (!position) {
    throw new Error("Position is required.");
  }

  if (!input.employmentStartDate) {
    throw new Error("Employment start date is required.");
  }

  if (
    !Number.isInteger(input.contractVacationDaysPerYear) ||
    input.contractVacationDaysPerYear < 1 ||
    input.contractVacationDaysPerYear > 60
  ) {
    throw new Error("Contract vacation days must be between 1 and 60.");
  }

  const department = await prisma.department.findUnique({
    where: {
      id: input.departmentId,
    },
  });

  if (!department || !department.isActive) {
    throw new Error("Department not found or inactive.");
  }

  const existingUserWithEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUserWithEmail) {
    throw new Error("A user with this email already exists.");
  }

  const year = getCurrentYear();
  let createdEmployeeId = "";

  await prisma.$transaction(async (transaction) => {
    const employee = await transaction.employee.create({
      data: {
        name,
        departmentId: input.departmentId,
        position,
        employmentStartDate: new Date(input.employmentStartDate),
        contractVacationDaysPerYear: input.contractVacationDaysPerYear,
        isActive: true,
      },
    });

    createdEmployeeId = employee.id;

    await transaction.user.create({
      data: {
        email,
        employeeId: employee.id,
        role: "employee",
        isActive: true,
      },
    });

    const total = input.contractVacationDaysPerYear;
    const used = 0;
    const pending = 0;
    const carriedOver = 0;
    const available = calculateAvailableBalance({
      total,
      used,
      pending,
      carriedOver,
    });

    await transaction.vacationBalance.create({
      data: {
        employeeId: employee.id,
        year,
        total,
        used,
        pending,
        available,
        carriedOver,
      },
    });
  });

  redirect(`/mitarbeiter/${createdEmployeeId}`);
}