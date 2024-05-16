import { Index } from '@upstash/vector';
import csv from 'csv-parser';
import 'dotenv/config';
import fs from 'fs';

interface Row {
	text: string;
	// ...
}

async function parseCSV(filePath: string): Promise<Row[]> {
	return new Promise((resolve, reject) => {
		const rows: Row[] = [];

		fs.createReadStream(filePath)
			.pipe(csv({ separator: ',' }))
			.on('data', (row) => rows.push(row))
			.on('error', (error) => reject(error))
			.on('end', () => resolve(rows));
	});
}

const STEP_SIZE = 30;
(async function main() {
	const data = await parseCSV('dataset.csv');

	const index = new Index({
		url: process.env.VECTOR_URL,
		token: process.env.VECTOR_TOKEN,
	});

	for (let i = 0; i < data.length; i += STEP_SIZE) {
		const chunk = data.slice(i, i + STEP_SIZE);

		const formatted = chunk.map((row, j) => ({
			id: i + j,
			data: row.text,
			metadata: {
				text: row.text,
			},
		}));

		await index.upsert(formatted);
	}
})();
