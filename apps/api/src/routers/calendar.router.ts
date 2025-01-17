// routers/calendar.router.ts
import { router } from '../trpc';
import { protectedProcedure } from '../procedures/protected.procedure';
import { z } from 'zod';
import { db } from '../db/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { EVENT_STATUS, ZodEventStatus } from '../constants/calendar.constant';
import { TRPCError } from '@trpc/server';

export const calendarRouter = router({
  getEvents: protectedProcedure
    .input(
      z.object({
        tenantId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        userIds: z.array(z.string()).optional(), // Optional filter for specific users' calendars
      }),
    )
    .query(async (opts) => {
      // First verify user has access to this tenant
      const tenantAccess = await db
        .selectFrom('tenant_entity')
        .selectAll()
        .where('tenant_id', '=', opts.input.tenantId)
        .where('entity_id', '=', opts.ctx.userId)
        .executeTakeFirst();

      if (!tenantAccess) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No access to this tenant',
        });
      }

      // Get events visible to the user in this tenant
      let query = db
        .selectFrom('calendar_event')
        // Join to calendars through the join table
        .innerJoin(
          'calendar_event_calendar',
          'calendar_event_calendar.event_id',
          'calendar_event.id',
        )
        .innerJoin(
          'calendar',
          'calendar.id',
          'calendar_event_calendar.calendar_id',
        )
        // Join to tenant_entity to check tenant membership
        .innerJoin(
          'tenant_entity',
          'tenant_entity.entity_id',
          'calendar.user_id',
        )
        .select((eb) => [
          'calendar_event.id',
          'calendar_event.title',
          'calendar_event.description',
          'calendar_event.start_time',
          'calendar_event.end_time',
          'calendar_event.created_by',
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
        .where('tenant_entity.tenant_id', '=', opts.input.tenantId)
        .where('start_time', '>=', opts.input.startDate)
        .where('start_time', '<=', opts.input.endDate);

      // If specific users are requested, filter for only their calendars
      if (opts.input.userIds && opts.input.userIds.length > 0) {
        query = query.where('calendar.user_id', 'in', opts.input.userIds);
      }

      return await query.execute();
    }),
  createEvent: protectedProcedure
    .input(
      z.object({
        tenantId: z.string(),
        title: z.string(),
        description: z.string().optional(),
        startTime: z.date(),
        endTime: z.date().optional(),
        participants: z.array(z.string()),
      }),
    )
    .mutation(async (opts) => {
      return await db.transaction().execute(async (trx) => {
        // First verify user has access to this tenant
        const tenantAccess = await trx
          .selectFrom('tenant_entity')
          .selectAll()
          .where('tenant_id', '=', opts.input.tenantId)
          .where('entity_id', '=', opts.ctx.userId)
          .executeTakeFirst();

        if (!tenantAccess) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'No access to this tenant',
          });
        }

        // Verify all participants are part of the tenant
        const allParticipants = [
          ...new Set([...opts.input.participants, opts.ctx.userId]),
        ];
        const validParticipants = await trx
          .selectFrom('tenant_entity')
          .select('entity_id')
          .where('tenant_id', '=', opts.input.tenantId)
          .where('entity_id', 'in', allParticipants)
          .execute();

        if (validParticipants.length !== allParticipants.length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Some participants are not members of this tenant',
          });
        }

        // Get calendars for all participants
        const calendars = await trx
          .selectFrom('calendar')
          .selectAll()
          .where('user_id', 'in', allParticipants)
          .execute();

        if (calendars.length !== allParticipants.length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Some participants do not have calendars',
          });
        }

        // Create the event
        const event = await trx
          .insertInto('calendar_event')
          .values({
            title: opts.input.title,
            description: opts.input.description,
            start_time: opts.input.startTime.toISOString(),
            end_time: opts.input.endTime?.toISOString(),
            created_by: opts.ctx.userId,
          })
          .returningAll()
          .executeTakeFirst();

        if (!event) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create event',
          });
        }

        // Link event to all participants' calendars
        await trx
          .insertInto('calendar_event_calendar')
          .values(
            calendars.map((calendar) => ({
              calendar_id: calendar.id,
              event_id: event.id,
            })),
          )
          .execute();

        // Create participation records
        await trx
          .insertInto('calendar_event_user')
          .values(
            allParticipants.map((userId) => ({
              event_id: event.id,
              user_id: userId,
              status:
                userId === opts.ctx.userId
                  ? EVENT_STATUS.ACCEPTED
                  : EVENT_STATUS.PENDING,
            })),
          )
          .execute();

        return event;
      });
    }),

  deleteEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
      }),
    )
    .mutation(async (opts) => {
      return await db.transaction().execute(async (trx) => {
        // Check if user is the creator of the event
        const event = await trx
          .selectFrom('calendar_event')
          .selectAll()
          .where('id', '=', opts.input.eventId)
          .executeTakeFirst();

        if (!event) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Event not found',
          });
        }

        if (event.created_by !== opts.ctx.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only the event creator can delete this event',
          });
        }

        // The event will cascade delete from calendar_event_calendar and calendar_event_user
        await trx
          .deleteFrom('calendar_event')
          .where('id', '=', opts.input.eventId)
          .execute();
      });
    }),
  updateEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        startTime: z.date().optional(),
        endTime: z.date().optional(),
      }),
    )
    .mutation(async (opts) => {
      return await db.transaction().execute(async (trx) => {
        // Check if user is the creator
        const event = await trx
          .selectFrom('calendar_event')
          .selectAll()
          .where('id', '=', opts.input.eventId)
          .executeTakeFirst();

        if (!event) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Event not found',
          });
        }

        if (event.created_by !== opts.ctx.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only the event creator can update this event',
          });
        }

        // Update the event with any provided fields
        return await trx
          .updateTable('calendar_event')
          .set(opts.input)
          .where('id', '=', opts.input.eventId)
          .returningAll()
          .executeTakeFirst();
      });
    }),

  removeEventParticipant: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async (opts) => {
      return await db.transaction().execute(async (trx) => {
        // Check if event exists and get creator
        const event = await trx
          .selectFrom('calendar_event')
          .selectAll()
          .where('id', '=', opts.input.eventId)
          .executeTakeFirst();

        if (!event) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Event not found',
          });
        }

        const userToRemove = opts.input.userId;

        // If trying to remove someone else, verify user is the creator
        if (
          userToRemove !== opts.ctx.userId &&
          event.created_by !== opts.ctx.userId
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only the event creator can remove other participants',
          });
        }

        // Remove user from event_user table
        await trx
          .deleteFrom('calendar_event_user')
          .where('event_id', '=', opts.input.eventId)
          .where('user_id', '=', userToRemove)
          .execute();

        // Get user's calendar
        const userCalendar = await trx
          .selectFrom('calendar')
          .selectAll()
          .where('user_id', '=', userToRemove)
          .executeTakeFirst();

        if (!userCalendar) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Calendar not found for user',
          });
        }

        // Remove the event from user's calendar
        await trx
          .deleteFrom('calendar_event_calendar')
          .where('event_id', '=', opts.input.eventId)
          .where('calendar_id', '=', userCalendar.id)
          .execute();
      });
    }),
});
