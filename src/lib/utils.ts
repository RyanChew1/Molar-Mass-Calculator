import { type ClassValue, clsx } from "clsx";
import Cookies from "js-cookie";
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

export const reloadCookies = () => {
  let saveValueCookies = Array.from(
    new Set(
      Cookies.get()
        ["saves"].split(",")
        .filter((x) => x != "undefined" && x != "0.000000" && x != "")
        .reverse()
    )
  );
  let saveFormulaCookies = Array.from(
    new Set(
      Cookies.get()
        ["formula"].split(",")
        .filter((x) => x != "undefined" && x != "")
        .reverse()
    )
  );

  const cookies = saveValueCookies.map((saves, i) => ({
    saves,
    formula: saveFormulaCookies[i],
    onRerender: () => void {}
  }));

  return cookies;
};
