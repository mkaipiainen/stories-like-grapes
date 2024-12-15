import {publicProcedure} from "../trpc";

export const protectedProcedure = publicProcedure.use((opts) => {
	if (!opts.ctx.user) {
		throw new Error('Not authenticated');
	}
	return opts.next({
		ctx: {
			...(opts.ctx ?? {}),
			// If you want, rename sub to userId or similar here
			userId: opts.ctx.user.sub as string,
		},
	});
})