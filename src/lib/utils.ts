import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d)
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return dateStr
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function maskSensitive(val: string, visibleStart = 0, visibleEnd = 4): string {
  if (!val) return ''
  if (val.length <= visibleStart + visibleEnd) return val
  const start = val.slice(0, visibleStart)
  const end = val.slice(val.length - visibleEnd)
  const maskedLength = val.length - visibleStart - visibleEnd
  return `${start}${'•'.repeat(maskedLength)}${end}`
}
