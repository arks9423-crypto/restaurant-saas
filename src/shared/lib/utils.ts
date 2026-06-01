import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w؀-ۿ-]/g, '')
    .slice(0, 50) + '-' + Math.random().toString(36).slice(2, 7)
}

export function formatPrice(price: number, currency = 'ر.ع'): string {
  return `${price.toFixed(3)} ${currency}`
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('ar-OM', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-OM')
}
