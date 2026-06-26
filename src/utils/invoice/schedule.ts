import { IntervalUnit, Service } from '@/types/invoice';

export const parseISODate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const formatISODate = (date: Date) => date.toISOString().slice(0, 10);

export const todayISO = () => formatISODate(new Date());

export const addDays = (dateISO: string, days: number) => {
  const date = parseISODate(dateISO);
  date.setUTCDate(date.getUTCDate() + days);
  return formatISODate(date);
};

export const addInterval = (dateISO: string, count: number, unit: IntervalUnit) => {
  const date = parseISODate(dateISO);

  if (unit === 'days') {
    date.setUTCDate(date.getUTCDate() + count);
    return formatISODate(date);
  }

  if (unit === 'weeks') {
    date.setUTCDate(date.getUTCDate() + count * 7);
    return formatISODate(date);
  }

  if (unit === 'months') {
    const day = date.getUTCDate();
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + count);
    const daysInTargetMonth = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
    ).getUTCDate();
    date.setUTCDate(Math.min(day, daysInTargetMonth));
    return formatISODate(date);
  }

  const day = date.getUTCDate();
  const month = date.getUTCMonth();
  date.setUTCDate(1);
  date.setUTCFullYear(date.getUTCFullYear() + count);
  date.setUTCMonth(month);
  const daysInTargetMonth = new Date(
    Date.UTC(date.getUTCFullYear(), month + 1, 0)
  ).getUTCDate();
  date.setUTCDate(Math.min(day, daysInTargetMonth));
  return formatISODate(date);
};

export const diffInDays = (fromISO: string, toISO: string) => {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};

export const computeNextRun = (
  startDate: string,
  intervalCount: number,
  intervalUnit: IntervalUnit,
  currentDate: string
) => {
  if (!startDate) return currentDate;
  let next = startDate;
  while (next < currentDate) {
    next = addInterval(next, intervalCount, intervalUnit);
  }
  return next;
};

export const normalizeServices = (items: Service[]) =>
  items.map((service) => {
    const lineTotal = service.quantity * service.unitPrice;
    return {
      ...service,
      total: Math.max(0, lineTotal - service.discount),
    };
  });

export const calculateSubtotalFromServices = (items: Service[]) =>
  items.reduce((acc, service) => acc + service.total, 0);

export const makeInvoiceNumber = (clientName: string, dateISO: string) => {
  const datePart = dateISO.replace(/-/g, '');
  const initials = clientName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
  return initials ? `INV-${datePart}-${initials}` : `INV-${datePart}`;
};

export const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
