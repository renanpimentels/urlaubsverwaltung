export function formatDate(date: string) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("de-DE").format(new Date(date));
}

export function formatDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    return "";
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}