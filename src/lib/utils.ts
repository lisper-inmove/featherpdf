import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomString(length: number): string {
  // Define the characters that can be used in the random string
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  // Generate a random index to pick a character from the 'characters' string and append it to the 'result'
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

export function isInteger(str: string): boolean {
  // 正则表达式检查字符串是否只包含数字（也可以处理正负号）
  return /^-?\d+$/.test(str);
}
