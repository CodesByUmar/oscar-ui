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

// MUHIM: Telegram Mini App ichida oddiy window.open("_blank") ko'pincha
// jim (silent) bloklanadi — WebView popup'larni ruxsatsiz to'xtatadi,
// ayniqsa await'lardan keyin chaqirilganda (foydalanuvchi gesture
// zanjiri uzilgan hisoblanadi). Telegram'ning o'z Telegram.WebApp.openLink()
// funksiyasi esa buni to'g'ri, tizim brauzerida ochadi.
export function openExternalLink(url: string) {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.openLink) {
    tg.openLink(url);
  } else {
    window.open(url, "_blank");
  }
}
