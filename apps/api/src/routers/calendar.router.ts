// routers/calendar.router.ts
import { router } from '../trpc';
import { protectedProcedure } from '../procedures/protected.procedure';
import { z } from 'zod';
import { calendarService } from '../services/calendar.service';
import {
  CALENDAR_PERMISSION_LEVEL,
  ZodCalendarPermissionLevel,
} from '../constants/calendar.constant';
import { db } from '../db/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

export const calendarRouter = router({
  list: protectedProcedure.query(async (opts) => {
    return calendarService.getUserCalendars(opts.ctx.userId);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async (opts) => {
      return await db
        .insertInto('calendar')
        .values({
          name: opts.input.name,
          description: opts.input.description,
          tenant_id: opts.ctx.userId,
        })
        .returningAll()
        .executeTakeFirst();
    }),

  share: protectedProcedure
    .input(
      z.object({
        calendarId: z.string(),
        userId: z.string(),
        permissionLevel: ZodCalendarPermissionLevel,
      }),
    )
    .mutation(async (opts) => {
      await calendarService.checkCalendarAccess(
        opts.input.calendarId,
        opts.ctx.userId,
        CALENDAR_PERMISSION_LEVEL.ADMIN,
      );

      return await db
        .insertInto('calendar_share')
        .values({
          calendar_id: opts.input.calendarId,
          user_id: opts.input.userId,
          permission_level: opts.input.permissionLevel,
        })
        .returningAll()
        .executeTakeFirst();
    }),

  getEvents: protectedProcedure
    .input(
      z.object({
        calendarId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async (opts) => {
      await calendarService.checkCalendarAccess(
        opts.input.calendarId,
        opts.ctx.userId,
        CALENDAR_PERMISSION_LEVEL.VIEW,
      );

      return await db
        .selectFrom('calendar_event')
        .selectAll('calendar_event')
        .select((eb) => [
          jsonArrayFrom(
            eb
              .selectFrom('calendar_event_user')
              .selectAll()
              .whereRef(
                'calendar_event_user.event_id',
                '=',
                'calendar_event.id',
              ),
          ).as('participants'),
        ])
        .where('calendar_id', '=', opts.input.calendarId)
        .where('start_time', '>=', opts.input.startDate)
        .where('start_time', '<=', opts.input.endDate)
        .execute();
    }),

  createEvent: protectedProcedure
    .input(
      z.object({
        calendarId: z.string(),
        title: z.string(),
        description: z.string().optional(),
        startTime: z.date(),
        endTime: z.date().optional(),
        participants: z.array(z.string()).optional(),
      }),
    )
    .mutation(async (opts) => {
      await calendarService.checkCalendarAccess(
        opts.input.calendarId,
        opts.ctx.userId,
        CALENDAR_PERMISSION_LEVEL.EDIT,
      );

      return await db.transaction().execute(async (trx) => {
        const event = await trx
          .insertInto('calendar_event')
          .values({
            calendar_id: opts.input.calendarId,
            title: opts.input.title,
            description: opts.input.description,
            start_time: opts.input.startTime.toISOString(),
            end_time: opts.input.endTime?.toISOString(),
            created_by: opts.ctx.userId,
          })
          .returningAll()
          .executeTakeFirst();

        if (event && opts.input.participants?.length) {
          await trx
            .insertInto('calendar_event_user')
            .values(
              opts.input.participants.map((userId) => ({
                event_id: event.id,
                user_id: userId,
                status: 'pending',
              })),
            )
            .execute();
        }

        return event;
      });
    }),
});
