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
    maxTokens: 2500
  });
};

const getGemini = () => {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY || "dummy_key"
  });
};

const getGroq = () => {
  return new ChatGroq({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    apiKey: process.env.GROQ_API_KEY || "dummy_key",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2
  });
};

export const gemini = {
  invoke: (input, options) => getGemini().invoke(input, options)
};

export const getModel = (agent) => {
  switch (agent) {
    case "coding":
      return getOpenRouter();
    case "image":
      return getGroq();
    case "search":
      return getGroq();
    case "chat":
      return getGroq();
    case "vision":
      return getGemini();
    default:
      return getGroq();
  }
};