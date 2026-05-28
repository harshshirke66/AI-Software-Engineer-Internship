import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)} Lakh`;
  }
  return `₹${value.toLocaleString()}`;
}

export function formatSalary(value: number): string {
  return `₹${value.toFixed(1)} LPA`;
}
