import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis/cloudflare';
import { Context, Env } from 'hono';
import { env } from 'hono/adapter';
import { BlankInput } from 'hono/types';

const cache = new Map<string, number>();

export class RedisRateLimiter {
	static instance: Ratelimit;

	static getInstance(ctx: Context<Env, never, BlankInput>) {
		if (!this.instance) {
			const { REDIS_URL, REDIS_TOKEN } = env<Environment>(ctx);

			const redisClient = new Redis({
				url: REDIS_URL,
				token: REDIS_TOKEN,
			});

			this.instance = new Ratelimit({
				ephemeralCache: cache,
				redis: redisClient,
				limiter: Ratelimit.slidingWindow(10, '30 s'),
			});
		}

		return this.instance;
	}
}
