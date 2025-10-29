import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Small helper to merge Tailwind class strings while preserving shadcn/ui variants.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
