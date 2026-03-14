import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function toPercent(value: number) {
  return `${Math.max(0, Math.min(100, value)).toFixed(1)}%`;
}
