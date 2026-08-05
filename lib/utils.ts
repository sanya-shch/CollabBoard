import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const COLORS = [
  "#e78d92",
  "#6b4c8f",
  "#4b8c5a",
  "#ff3333",
  "#f57f20",
  "#2b6c93",
  "#6e99c2",
  "#b2dfdb",
  "#f7e4b8",
  "#8d2e3b",
  "#a8e8d0",
  "#4caf50",
  "#f9c9c9",
  "#f27b9a",
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function connectionIdToColor(connectionId: number): string {
  return COLORS[connectionId % COLORS.length];
}
