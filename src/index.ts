import { zValidator } from '@hono/zod-validator';
import { Index } from '@upstash/vector';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { cors } from 'hono/cors';
import { z } from 'zod';

import { rateLimiter } from '@/middlewares';
import { textToSemantics, textToWords } from '@/utils';

const app = new Hono();

app.use(cors());
app.use(rateLimiter);

const WHITE_LIST: string[] = [];

app.post(
	'/',
	zValidator('json', z.object({ text: z.string().min(2).max(1000) })),
	async (ctx) => {
		try {
			const rateLimiter = ctx.get('rate-limiter');
			const ip = ctx.req.raw.headers.get('Cf-Connecting-IP');
			const res = await rateLimiter.limit(ip ?? 'anonynmous');

			if (!res.success) {
				return ctx.json({ message: 'Too many requests' }, 429);
			}

			const { VECTOR_URL, VECTOR_TOKEN } = env<Environment>(ctx);

			const index = new Index({
				url: VECTOR_URL,
				token: VECTOR_TOKEN,
				cache: false,
			});

			let { text } = ctx.req.valid('json');

			text = text
				.split(/\s/)
				.filter((word) => !WHITE_LIST.includes(word.toLowerCase()))
				.join(' ');

			const [words, semantics] = await Promise.all([
				textToWords(text),
				textToSemantics(text),
			]);

			const flags = new Set<{ text: string; score: number }>();

			await Promise.all([
				...words.map(async (word) => {
					const [vector] = await index.query({
						topK: 1,
						data: word,
						includeMetadata: true,
					});

					if (vector?.score > 0.95) {
						flags.add({
							text: vector.metadata!.text as string,
							score: vector.score,
						});
					}
				}),
				...semantics.map(async (semantic) => {
					const [vector] = await index.query({
						topK: 1,
						data: semantic,
						includeMetadata: true,
					});

					if (vector?.score > 0.86) {
						flags.add({
							text: vector.metadata!.text as string,
							score: vector.score,
						});
					}
				}),
			]);

			const maxScore = Math.max(...[...flags].map((f) => f.score));

			if (flags.size > 0) {
				return ctx.json({
					isProfanity: true,
					flags: [...flags].map((f) => f.text),
					score: maxScore,
				});
			} else {
				return ctx.json({
					isProfanity: false,
					score: maxScore,
				});
			}
		} catch (error) {
			console.error(error);
			return ctx.json({ error: 'Unexpected error occurred' }, 500);
		}
	},
);

export default app;
