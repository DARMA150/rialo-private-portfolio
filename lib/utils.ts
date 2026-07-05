import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function maskValue(
  value: number,
  isPrivate: boolean,
  hasOverride: boolean = false,
  formatFn: (v: number) => string = formatCurrency
): string {
  if (isPrivate && !hasOverride) {
    return "••••••";
  }
  return formatFn(value);
}

export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
}
