import { z } from 'zod';

export const CALENDAR_PERMISSION_LEVEL = {
  VIEW: 'view',
  EDIT: 'edit',
  ADMIN: 'admin',
} as const;

export type CalendarPermissionLevel =
  (typeof CALENDAR_PERMISSION_LEVEL)[keyof typeof CALENDAR_PERMISSION_LEVEL];

export const EVENT_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
} as const;

export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];

export const CALENDAR_PROVIDER = {
  NATIVE: 'native',
  GOOGLE: 'google',
  OUTLOOK: 'outlook',
} as const;

export type CalendarProvider =
  (typeof CALENDAR_PROVIDER)[keyof typeof CALENDAR_PROVIDER];

export const ZodCalendarPermissionLevel = z.enum([
  CALENDAR_PERMISSION_LEVEL.VIEW,
  CALENDAR_PERMISSION_LEVEL.EDIT,
  CALENDAR_PERMISSION_LEVEL.ADMIN,
]);

export const ZodEventStatus = z.enum([
  EVENT_STATUS.PENDING,
  EVENT_STATUS.ACCEPTED,
  EVENT_STATUS.DECLINED,
]);

export const ZodCalendarProvider = z.enum([
  CALENDAR_PROVIDER.NATIVE,
  CALENDAR_PROVIDER.GOOGLE,
  CALENDAR_PROVIDER.OUTLOOK,
]);
