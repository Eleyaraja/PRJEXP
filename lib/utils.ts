import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatter for Indian Rupees
export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`
}

// Format large numbers with k suffix
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`
  }
  return `₹${amount}`
}
