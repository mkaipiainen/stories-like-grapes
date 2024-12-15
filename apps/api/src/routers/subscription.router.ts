import {router} from "../trpc";
import {z} from "zod";
import {protectedProcedure} from "../procedures/protected.procedure";
import { db } from "../db/db";
import {webPushService} from "../services/web-push.service";

export const subscriptionRouter = router({
	subscribe: protectedProcedure.input(z.object({
		endpoint: z.string(),
		p256dh: z.string(),
		auth: z.string(),
	})).mutation(async (opts) => {
		const userId = opts.ctx.userId;
		return db.insertInto('subscription').values({
			auth: opts.input.auth,
			endpoint: opts.input.endpoint,
			p256dh: opts.input.p256dh,
			user_id: userId
		}).returningAll().execute();
	}),
	test: protectedProcedure.mutation(async (opts) => {
		await webPushService.sendToUser(opts.ctx.userId, {
			title: 'Test title',
			body: 'Test message'
		})
	})

})