// Seeds the Vectorize index with dataset.csv through the Cloudflare CLI.
// Run `cf auth login` first, then `npm run db:seed`.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const INDEX = 'profanity-api';
const MODEL = '@cf/baai/bge-small-en-v1.5';
const BATCH_SIZE = 100;

const cf = (...args) =>
	JSON.parse(
		execFileSync('cf', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }),
	);

const terms = [
	...new Set(
		readFileSync('dataset.csv', 'utf8')
			.split('\n')
			.slice(1)
			.map((term) => term.trim().toLowerCase())
			.filter(Boolean),
	),
];

const dir = mkdtempSync(join(tmpdir(), 'profanity-seed-'));
try {
	for (let i = 0; i < terms.length; i += BATCH_SIZE) {
		const batch = terms.slice(i, i + BATCH_SIZE);
		const { data } = cf(
			'ai',
			'run',
			MODEL,
			'--body',
			JSON.stringify({ text: batch }),
		);

		const file = join(dir, 'batch.ndjson');
		writeFileSync(
			file,
			batch
				.map((text, j) =>
					JSON.stringify({
						id: String(i + j),
						values: data[j],
						metadata: { text },
					}),
				)
				.join('\n'),
		);
		execFileSync('cf', ['vectorize', 'upsert', INDEX, '--file', file], {
			stdio: 'ignore',
		});

		console.log(
			`Seeded ${Math.min(i + BATCH_SIZE, terms.length)}/${terms.length}`,
		);
	}
} finally {
	rmSync(dir, { recursive: true, force: true });
}
