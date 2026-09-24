import fs from "fs";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createVectorStore } from "../utils/vectorStore.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../utils/model.js";
import { QdrantVectorStore } from "@langchain/qdrant";

export const pdfRagAgent = async (state) => {
  let collectionName = null;
  try {
    if (!state.file?.path || !fs.existsSync(state.file.path)) {
      return {
        ...state,
        response: "❌ No PDF file uploaded or file path not found.",
      };
    }

    const buffer = fs.readFileSync(state.file.path);

    // Try extracting digital text first
    let text = "";
    try {
      const pdf = new PDFParse({
        data: buffer,
      });
      const result = await pdf.getText();
      text = result?.text?.trim() || "";
    } catch (parseErr) {
      console.warn("Digital PDF text extraction skipped:", parseErr.message);
    }

    // Strip pdf-parse internal page markers like "-- 1 of 69 --" to check for real text
    const cleanText = text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "").trim();

    // If real digital text is found and long enough, use Vector RAG
    if (cleanText && cleanText.length > 80) {
      console.log("Digital PDF detected. Using Vector Store RAG...");
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      let docs = await splitter.createDocuments([text]);
      // Filter out empty or whitespace-only documents to prevent empty embeddings
      docs = docs.filter(
        (doc) => doc.pageContent && doc.pageContent.trim().length > 0
      );

      if (docs.length > 0) {
        try {
          collectionName = `pdf-${Date.now()}`;
          const vectorStore = await createVectorStore(collectionName, docs);
          const relevantDocs = await vectorStore.similaritySearch(
            state.prompt,
            5
          );

          const context = relevantDocs
            .map((doc) => doc.pageContent)
            .join("\n\n");

          const llm = getModel("pdf-rag");
          const messages = [
            new SystemMessage(`
You are Bearly PDF Assistant.

Rules:
- Answer ONLY from the uploaded PDF.
- Never make up information.
- If the answer is not present in the PDF, reply:
"I couldn't find this information in the uploaded PDF."
- Use Markdown formatting.
`),
            new HumanMessage(`
Context:
${context}

Question:
${state.prompt}
`),
          ];

          const response = await llm.invoke(messages);
          return {
            ...state,
            docs,
            response: response.content,
          };
        } catch (ragErr) {
          console.warn(
            "Vector RAG search failed, falling back to Vision/Multimodal AI:",
            ragErr.message
          );
        }
      }
    }

    // Multimodal Fallback: For scanned PDFs, image-based PDFs, or handwritten documents
    const visionLlm = getModel("vision");
    const base64Pdf = buffer.toString("base64");

    const messages = [
      new SystemMessage(`
You are Bearly PDF Assistant.

Rules:
- You analyze the uploaded PDF document (which may include scanned papers, forms, agreements, and legal documents).
- Answer the user's question accurately and thoroughly based on the document.
- If the user asks in Hindi, answer in Hindi/Hinglish as appropriate.
- Use clear Markdown formatting with headings and bullet points.
`),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: state.prompt || "Please analyze and explain the contents of this PDF.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:application/pdf;base64,${base64Pdf}`,
            },
          },
        ],
      }),
    ];

    const response = await visionLlm.invoke(messages);

    return {
      ...state,
      response: response.content,
    };
  } finally {
    try {
      if (state.file?.path && fs.existsSync(state.file.path)) {
        fs.unlinkSync(state.file.path);
      }
      if (collectionName) {
        await QdrantVectorStore.deleteCollection(collectionName);
      }
    } catch (err) {
      console.log("Cleanup warning:", err.message);
    }
  }
};
