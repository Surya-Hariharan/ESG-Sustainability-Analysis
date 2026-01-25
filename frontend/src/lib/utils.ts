import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${formatNumber(value, 1)}%`;
}

export function getRiskColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'low':
      return 'text-esg-low';
    case 'medium':
      return 'text-esg-medium';
    case 'high':
      return 'text-esg-high';
    default:
      return 'text-muted-foreground';
  }
}

export function getRiskBgColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'low':
      return 'bg-esg-low/10 border-esg-low';
    case 'medium':
      return 'bg-esg-medium/10 border-esg-medium';
    case 'high':
      return 'bg-esg-high/10 border-esg-high';
    default:
      return 'bg-muted';
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
