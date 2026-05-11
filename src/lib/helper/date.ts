export const LOCAL_DATE_MIN = "1970-01-01";

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addDaysToLocalDateString(dateString: string, days: number) {
  const nextDate = new Date(`${dateString}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + days);
  return getLocalDateString(nextDate);
}

export function formatBookingDate(dateString: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

export function formatHoldTime(createdAt: string, holdMinutes: number, now = Date.now()) {
  const deadline = new Date(createdAt);
  deadline.setMinutes(deadline.getMinutes() + holdMinutes);

  const diffMs = deadline.getTime() - now;
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const minutes = String(Math.floor(diffSeconds / 60)).padStart(2, "0");
  const seconds = String(diffSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function isDateWithinRange(dateString: string, minDate: string, maxDate: string) {
  return dateString >= minDate && dateString <= maxDate;
}
