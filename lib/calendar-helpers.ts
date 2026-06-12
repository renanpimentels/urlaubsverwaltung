export type CalendarDay = {
  date: string;
  dayOfMonth: number;
  weekdayShort: string;
  isToday: boolean;
  isWeekend: boolean;
};

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createUtcDate(year: number, monthIndex: number, day: number) {
  return new Date(Date.UTC(year, monthIndex, day));
}

export function getCurrentCalendarMonth() {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

export function normalizeCalendarMonth(input: {
  year?: string;
  month?: string;
}) {
  const currentMonth = getCurrentCalendarMonth();

  const parsedYear = input.year ? Number(input.year) : currentMonth.year;
  const parsedMonth = input.month ? Number(input.month) : currentMonth.month;

  const year = Number.isInteger(parsedYear) ? parsedYear : currentMonth.year;
  const month = Number.isInteger(parsedMonth) ? parsedMonth : currentMonth.month;

  if (month < 1 || month > 12) {
    return currentMonth;
  }

  if (year < 2000 || year > currentMonth.year + 5) {
    return currentMonth;
  }

  return {
    year,
    month,
  };
}

export function getMonthDateRange(year: number, month: number) {
  const monthIndex = month - 1;

  const startDate = createUtcDate(year, monthIndex, 1);
  const endDate = createUtcDate(year, monthIndex + 1, 0);

  return {
    startDate: toDateOnly(startDate),
    endDate: toDateOnly(endDate),
  };
}

export function getPreviousCalendarMonth(year: number, month: number) {
  if (month === 1) {
    return {
      year: year - 1,
      month: 12,
    };
  }

  return {
    year,
    month: month - 1,
  };
}

export function getNextCalendarMonth(year: number, month: number) {
  if (month === 12) {
    return {
      year: year + 1,
      month: 1,
    };
  }

  return {
    year,
    month: month + 1,
  };
}

export function formatCalendarMonthTitle(year: number, month: number) {
  return new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric",
  }).format(createUtcDate(year, month - 1, 1));
}

export function getDaysInCalendarMonth(year: number, month: number) {
  const monthIndex = month - 1;
  const lastDay = createUtcDate(year, monthIndex + 1, 0).getUTCDate();
  const today = toDateOnly(new Date());

  return Array.from({ length: lastDay }, (_, index): CalendarDay => {
    const dayOfMonth = index + 1;
    const date = createUtcDate(year, monthIndex, dayOfMonth);
    const dateOnly = toDateOnly(date);
    const weekday = date.getUTCDay();

    return {
      date: dateOnly,
      dayOfMonth,
      weekdayShort: new Intl.DateTimeFormat("de-DE", {
        weekday: "short",
      }).format(date),
      isToday: dateOnly === today,
      isWeekend: weekday === 0 || weekday === 6,
    };
  });
}

export function isDateWithinDateRange(input: {
  date: string;
  startDate: string;
  endDate: string;
}) {
  return input.date >= input.startDate && input.date <= input.endDate;
}

export function getCalendarMonthHref(input: {
  year: number;
  month: number;
}) {
  return `/kalender?year=${input.year}&month=${input.month}`;
}