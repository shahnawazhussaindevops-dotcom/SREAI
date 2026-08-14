import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: '#EF4444',
    high: '#F97316',
    medium: '#F59E0B',
    low: '#3B82F6',
    info: '#8B9CAF',
    success: '#22C55E',
  };
  return colors[severity] || colors.info;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    healthy: '#22C55E',
    degraded: '#F59E0B',
    down: '#EF4444',
    unknown: '#8B9CAF',
    firing: '#EF4444',
    acknowledged: '#F59E0B',
    resolved: '#22C55E',
    investigating: '#EF4444',
    identified: '#F97316',
    monitoring: '#3B82F6',
    success: '#22C55E',
    failed: '#EF4444',
    rolling: '#3B82F6',
    pending: '#8B9CAF',
    Running: '#22C55E',
    CrashLoopBackOff: '#EF4444',
    connected: '#22C55E',
    disconnected: '#EF4444',
    open: '#EF4444',
    mitigated: '#22C55E',
    accepted: '#F59E0B',
  };
  return colors[status] || '#8B9CAF';
}
