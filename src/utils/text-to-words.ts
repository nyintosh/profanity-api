export const textToWords = (text: string) => {
	return text
		.split(/\s+/)
		.map((word) => word.toLowerCase().replace(/^["'(]+|[.,!?;:"')]+$/g, ''))
		.filter(Boolean);
};
