import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const checkUpperCase = (character: string) => {
  if (character == character.toUpperCase()) {
    return true;
  }
  return false;
};
