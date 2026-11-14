const CHUNK_SIZE = 25;
const CHUNK_OVERLAP = 12;

// Splits text into overlapping chunks of whole words, each at most CHUNK_SIZE characters.
export const textToSemantics = (text: string) => {
	const words = text.split(/\s+/).filter(Boolean);
	if (words.length < 2) return [];

	const chunks: string[] = [];
	let start = 0;

	while (start < words.length) {
		let end = start;
		let length = words[start].length;

		while (
			end + 1 < words.length &&
			length + 1 + words[end + 1].length <= CHUNK_SIZE
		) {
			length += 1 + words[++end].length;
		}

		chunks.push(words.slice(start, end + 1).join(' '));
		if (end === words.length - 1) break;

		let next = end + 1;
		let overlap = 0;
		while (
			next - 1 > start &&
			overlap + words[next - 1].length + 1 <= CHUNK_OVERLAP
		) {
			overlap += words[--next].length + 1;
		}
		start = next;
	}

	return chunks;
};
