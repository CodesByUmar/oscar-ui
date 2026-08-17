import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Reliable thousand-separator formatter for UZS (so'm) amounts.
// Avoids relying on "uz-UZ" locale via toLocaleString(), which in some
// browser/Node environments treats the comma as a decimal separator
// instead of a thousands separator (e.g. 25000 -> "25,00" instead of "25,000" / "25 000").
export function formatUZS(value: number, separator: string = " "): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded).toString();
  const withSeparators = digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return `${sign}${withSeparators}`;
}
