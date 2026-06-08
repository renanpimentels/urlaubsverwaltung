import Holidays from "date-holidays";

import { isGermanFederalStateCode } from "@/lib/german-federal-states";

function toDateOnlyKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateOnlyAsUtc(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function isWeekend(date: Date) {
  const day = date.getUTCDay();

  return day === 0 || day === 6;
}

function normalizeFederalState(federalState: string | undefined) {
  if (federalState && isGermanFederalStateCode(federalState)) {
    return federalState;
  }

  return "NW";
}

export function getGermanPublicHolidayKeys(
  year: number,
  federalState: string | undefined
) {
  const normalizedFederalState = normalizeFederalState(federalState);
  const holidays = new Holidays("DE", normalizedFederalState);

  return new Set(
    holidays
      .getHolidays(year)
      .filter((holiday) => holiday.type === "public")
      .map((holiday) => toDateOnlyKey(new Date(holiday.start)))
  );
}

export function isGermanPublicHoliday(
  date: Date,
  federalState: string | undefined
) {
  const holidays = getGermanPublicHolidayKeys(
    date.getUTCFullYear(),
    federalState
  );

  return holidays.has(toDateOnlyKey(date));
}

export function calculateBusinessDaysWithHolidays(
  startDate: string,
  endDate: string,
  federalState: string | undefined
) {
  const start = parseDateOnlyAsUtc(startDate);
  const end = parseDateOnlyAsUtc(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  if (end < start) {
    return 0;
  }

  const holidayKeysByYear = new Map<number, Set<string>>();
  let days = 0;
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const year = currentDate.getUTCFullYear();

    if (!holidayKeysByYear.has(year)) {
      holidayKeysByYear.set(
        year,
        getGermanPublicHolidayKeys(year, federalState)
      );
    }

    const holidayKeys = holidayKeysByYear.get(year);
    const dateKey = toDateOnlyKey(currentDate);

    if (!isWeekend(currentDate) && !holidayKeys?.has(dateKey)) {
      days += 1;
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return days;
}

export function getGermanPublicHolidaysForYear(
  year: number,
  federalState: string | undefined
) {
  const normalizedFederalState = normalizeFederalState(federalState);
  const holidays = new Holidays("DE", normalizedFederalState);

  return holidays
    .getHolidays(year)
    .filter((holiday) => holiday.type === "public")
    .map((holiday) => ({
      date: toDateOnlyKey(new Date(holiday.start)),
      name: holiday.name,
    }));
}