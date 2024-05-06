import { Context, Env } from 'hono';
import { BlankInput, Next } from 'hono/types';

import { RedisRateLimiter } from '@/libs';

export const rateLimiter = async (
	ctx: Context<Env, never, BlankInput>,
	next: Next,
) => {
	const limiter = RedisRateLimiter.getInstance(ctx);
	ctx.set('rate-limiter', limiter);

	await next();
};
