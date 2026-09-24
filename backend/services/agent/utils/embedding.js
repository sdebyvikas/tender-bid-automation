import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

let _embeddings = null;

export const getEmbeddings = () => {
  if (!_embeddings) {
    _embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY || "dummy_key",
      model: "gemini-embedding-001",
    });
  }
  return _embeddings;
};

export const embeddings = {
  embedDocuments: (docs) => getEmbeddings().embedDocuments(docs),
  embedQuery: (text) => getEmbeddings().embedQuery(text),
};
