import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';

import dataset from '../dataset.csv';
import { textToSemantics, textToWords } from '@/utils';

const EMBEDDING_MODEL = '@cf/baai/bge-small-en-v1.5';
// Tuned for bge-small-en-v1.5: clean phrases scored up to ~0.69, profane variants from ~0.88.
const SEMANTIC_THRESHOLD = 0.8;
// Each chunk is one Vectorize query; 500 characters keeps a request under the free plan's 50 subrequests.
const MAX_TEXT_LENGTH = 500;

const TERMS = new Set(
	dataset
		.split('\n')
		.slice(1)
		.map((term) => term.trim().toLowerCase())
		.filter(Boolean),
);

const app = new Hono<{ Bindings: Env }>();

app.use(cors());

app.get('/', (ctx) =>
	ctx.json({
		name: 'profanity-api',
		usage: `POST / with JSON {"text": "..."} (2 to ${MAX_TEXT_LENGTH} characters)`,
		response: '{ isVulgar: boolean, flags?: string[], avgScore: number }',
		source: 'https://github.com/nyintosh/profanity-api',
	}),
);

app.post(
	'/',
	zValidator(
		'json',
		z.object({ text: z.string().min(2).max(MAX_TEXT_LENGTH) }),
	),
	async (ctx) => {
		try {
			const ip = ctx.req.header('Cf-Connecting-IP') ?? 'anonymous';
			const { success } = await ctx.env.RATE_LIMITER.limit({ key: ip });

			if (!success) {
				return ctx.json({ message: 'Too many requests' }, 429);
			}

			const { text } = ctx.req.valid('json');
			const flags = new Map<string, number>();

			for (const word of textToWords(text)) {
				if (TERMS.has(word)) flags.set(word, 1);
			}

			const semantics = textToSemantics(text);

			if (semantics.length) {
				const embeddings = await ctx.env.AI.run(EMBEDDING_MODEL, {
					text: semantics,
				});
				if (!('data' in embeddings) || !embeddings.data) {
					throw new Error('No embeddings returned');
				}

				const results = await Promise.all(
					embeddings.data.map((values) =>
						ctx.env.VECTORIZE.query(values, { topK: 1, returnMetadata: 'all' }),
					),
				);

				for (const { matches } of results) {
					const [match] = matches;
					if (match && match.score > SEMANTIC_THRESHOLD) {
						const term = String(match.metadata?.text);
						flags.set(term, Math.max(flags.get(term) ?? 0, match.score));
					}
				}
			}

			const isVulgar = flags.size > 0;
			const avgScore = isVulgar
				? [...flags.values()].reduce((a, b) => a + b, 0) / flags.size
				: 0;

			return ctx.json({
				isVulgar,
				...(isVulgar && { flags: [...flags.keys()] }),
				avgScore,
			});
		} catch (error) {
			console.error(error);
			return ctx.json({ error: 'Unexpected error occurred' }, 500);
		}
	},
);

export default app;
