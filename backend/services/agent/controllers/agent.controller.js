import redis from "../../../shared/redis/redis.js";
import { graph } from "../graph/supervisor.graph.js";
import { addMessage } from "../utils/memory.js";
import axios from "axios";

export const chat = async (req, res, next) => {
  try {
    const { prompt, conversationId, agent } = req.body;
    const userId = req.headers["x-user-id"];

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    await addMessage(conversationId, "user", prompt);

    try {
      await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
        conversationId,
        role: "user",
        content: prompt
      });
    } catch (e) {
      console.warn("Save user message warning:", e.message);
    }

    let result;
    try {
      result = await graph.invoke({
        prompt,
        conversationId,
        userId,
        agent,
        file: req.file
      });
    } catch (llmErr) {
      console.error("LLM Execution error:", llmErr);
      const isMissingKey =
        llmErr.message?.includes("API key") ||
        llmErr.message?.includes("401") ||
        llmErr.message?.includes("GROQ_API_KEY") ||
        llmErr.message?.includes("dummy_key") ||
        llmErr.status === 401;

      const fallbackMsg = isMissingKey
        ? `Hello! I received your prompt: "${prompt}".\n\nTo enable full AI intelligence across agents, please add your AI API Key (Groq, OpenRouter, or Gemini) in \`backend/services/agent/.env\`.\n\n*Agent selected:* \`${agent || "chat"}\``
        : `⚠️ Could not complete request: ${llmErr.message}`;

      result = {
        response: fallbackMsg,
        images: [],
        artifacts: []
      };
    }

    const responseText = result.response || "No response generated.";
    const images = result.images || [];
    const artifacts = result.artifacts || [];

    await addMessage(conversationId, "assistant", responseText);

    try {
      await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
        conversationId,
        role: "assistant",
        content: responseText,
        images: images,
        artifacts: artifacts
      });
    } catch (e) {
      console.warn("Save assistant message warning:", e.message);
    }

    return res.json({
      success: true,
      answer: responseText,
      images: images,
      artifacts: artifacts
    });
  } catch (error) {
    next(error);
  }
};