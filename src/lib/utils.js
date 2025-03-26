import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Объединяет классы Tailwind CSS, разрешая конфликты
 * @param {string[]} inputs - Классы Tailwind CSS для объединения
 * @returns {string} - Объединенные классы без конфликтов
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
