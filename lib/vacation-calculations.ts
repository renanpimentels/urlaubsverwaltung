function parseLocalDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function isWeekend(date: Date) {
  const day = date.getDay();

  return day === 0 || day === 6;
}

export function calculateBusinessDays(startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  if (end < start) {
    return 0;
  }

  let businessDays = 0;
  const currentDate = new Date(start);

  while (currentDate <= end) {
    if (!isWeekend(currentDate)) {
      businessDays += 1;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
}