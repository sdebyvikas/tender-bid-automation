import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenRouter } from "@langchain/openrouter";
import dotenv from "dotenv";

dotenv.config();

const getOpenRouter = () => {
  return new ChatOpenRouter({
    model: "deepseek/deepseek-chat",
    apiKey: process.env.OPENROUTER_API_KEY || "dummy_key",
    temperature: 0,
    maxTokens: 2500,
  });
};

const getGemini = () => {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY || "dummy_key",
  });
};

const getGroq = (
  modelName = process.env.GROQ_MODEL || "openai/gpt-oss-120b",
) => {
  return new ChatGroq({
    model: modelName,
    apiKey: process.env.GROQ_API_KEY || "dummy_key",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
  });
};

export const gemini = {
  invoke: (input, options) => getGemini().invoke(input, options),
};

export const getModel = (agent) => {
  switch (agent) {
    case "coding":
      if (
        process.env.OPENROUTER_API_KEY &&
        !process.env.OPENROUTER_API_KEY.includes("add open router") &&
        process.env.OPENROUTER_API_KEY.length > 20
      ) {
        return getOpenRouter();
      }
      return getGroq("openai/gpt-oss-120b");
    case "image":
      return getGroq("openai/gpt-oss-120b");
    case "search":
      return getGroq("openai/gpt-oss-120b");
    case "chat":
      return getGroq("openai/gpt-oss-120b");
    case "vision":
      return getGemini();
    case "pdf-rag":
    case "pdf":
    case "ppt":
    case "router":
    default:
      return getGroq("openai/gpt-oss-120b");
  }
};
