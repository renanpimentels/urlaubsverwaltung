export function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE").format(new Date(date));
}

export function formatDateRange(startDate: string, endDate: string) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}