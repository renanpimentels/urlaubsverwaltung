function parseLocalDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function getFullMonthsRemainingInYear(employmentStartDate: string) {
  const startDate = parseLocalDate(employmentStartDate);
  const startMonth = startDate.getMonth();
  const startDay = startDate.getDate();

  const startsOnFirstDayOfMonth = startDay === 1;

  if (startsOnFirstDayOfMonth) {
    return 12 - startMonth;
  }

  return 11 - startMonth;
}

export function calculateProRatedVacationEntitlement(
  employmentStartDate: string,
  contractVacationDaysPerYear: number,
  targetYear: number
) {
  const startDate = parseLocalDate(employmentStartDate);
  const startYear = startDate.getFullYear();

  if (startYear < targetYear) {
    return contractVacationDaysPerYear;
  }

  if (startYear > targetYear) {
    return 0;
  }

  const fullMonthsRemaining = getFullMonthsRemainingInYear(employmentStartDate);
  const entitlement =
    (contractVacationDaysPerYear / 12) * fullMonthsRemaining;

  return Math.ceil(entitlement);
}