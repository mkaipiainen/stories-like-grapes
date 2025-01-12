import { db } from '../db/db';
import type { CalendarPermissionLevel } from '../constants/calendar.constant';
import { TRPCError } from '@trpc/server';

export function CalendarService() {
  async function getUserCalendars(userId: string) {
    // Get calendars where user is either the tenant owner or has a share
    return await db
      .selectFrom('calendar')
      .leftJoin('calendar_share', 'calendar.id', 'calendar_share.calendar_id')
      .selectAll('calendar')
      .where('calendar.tenant_id', '=', userId)
      .where('calendar_share.user_id', '=', userId)
      .execute();
  }

  async function checkCalendarAccess(
    calendarId: string,
    userId: string,
    requiredPermission: CalendarPermissionLevel,
  ) {
    const calendar = await db
      .selectFrom('calendar')
      .leftJoin('calendar_share', 'calendar.id', 'calendar_share.calendar_id')
      .selectAll('calendar')
      .select('calendar_share.permission_level')
      .where('calendar.id', '=', calendarId)
      .where((eb) =>
        eb
          .where('calendar.tenant_id', '=', userId)
          .orWhere('calendar_share.user_id', '=', userId),
      )
      .executeTakeFirst();

    if (!calendar) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'No access to this calendar',
      });
    }

    // Tenant owner always has full access
    if (calendar.tenant_id === userId) {
      return true;
    }

    // Check if user has required permission level
    if (
      calendar.permission_level !== 'admin' &&
      requiredPermission === 'admin'
    ) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      });
    }

    if (calendar.permission_level === 'view' && requiredPermission !== 'view') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      });
    }

    return true;
  }

  async function getCalendarEvents(
    calendarId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return await db
      .selectFrom('calendar_event')
      .selectAll('calendar_event')
      .where('calendar_id', '=', calendarId)
      .where('start_time', '>=', startDate)
      .where('start_time', '<=', endDate)
      .execute();
  }

  return {
    getUserCalendars,
    checkCalendarAccess,
    getCalendarEvents,
  };
}

export const calendarService = CalendarService();
