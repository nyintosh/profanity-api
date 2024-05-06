import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const semanticSplitter = new RecursiveCharacterTextSplitter({
	chunkOverlap: 12,
	chunkSize: 25,
	separators: [' '],
});

export const textToSemantics = async (text: string) => {
	if (text.split(/\s+/).length === 1) return [];
	const documents = await semanticSplitter.createDocuments([text]);
	const chunks = documents.map((chunk) => chunk.pageContent);

	return chunks;
};
