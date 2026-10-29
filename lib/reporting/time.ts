import { parsedClientConfig } from "@/config/client.config";

export function monthKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: parsedClientConfig.business.timezone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  return `${parts.find((part) => part.type === "year")!.value.padStart(4, "0")}-${parts.find((part) => part.type === "month")!.value}`;
}

export function monthBounds(month: string): [Date, Date] {
  if (
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
    Number(month.slice(0, 4)) < 1 ||
    Number(month.slice(0, 4)) > 9998
  )
    throw new Error("Invalid month");
  const [year, number] = month.split("-").map(Number);
  const next =
    number === 12
      ? `${String(year + 1).padStart(4, "0")}-01`
      : `${String(year).padStart(4, "0")}-${String(number + 1).padStart(2, "0")}`;
  function boundary(key: string): Date {
    const [y, m] = key.split("-").map(Number);
    const nominal = new Date(0);
    nominal.setUTCFullYear(y, m - 1, 1);
    nominal.setUTCHours(0, 0, 0, 0);
    let low = +nominal - 3 * 86400000;
    let high = +nominal + 3 * 86400000;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (monthKey(new Date(mid)) < key) low = mid + 1;
      else high = mid;
    }
    return new Date(low);
  }
  return [boundary(month), boundary(next)];
}
