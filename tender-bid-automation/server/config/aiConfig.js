import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**
 * Multi-provider AI Caller (Groq -> Gemini -> OpenAI -> Fallback)
 */
export async function callLLM({
  systemPrompt,
  userPrompt,
  temperature = 0.3,
  responseFormat = "text",
  inlineData = null,
}) {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. If inlineData (e.g. Scanned PDF / Image) is provided, prioritize Multimodal Gemini
  if (geminiKey && !geminiKey.includes("your_gemini")) {
    const geminiModels = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash-lite",
      "gemini-3.8-flash",
      "gemini-flash-latest",
    ];
    for (const model of geminiModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

        const parts = [];
        if (inlineData) {
          parts.push({
            inlineData: {
              data: inlineData.data,
              mimeType: inlineData.mimeType || "application/pdf",
            },
          });
        }
        parts.push({
          text: `${systemPrompt ? `[SYSTEM INSTRUCTIONS]:\n${systemPrompt}\n\n` : ""}${userPrompt}`,
        });

        const response = await axios.post(
          geminiUrl,
          {
            contents: [{ parts }],
            generationConfig: {
              temperature: temperature,
              ...(responseFormat === "json"
                ? { responseMimeType: "application/json" }
                : {}),
            },
          },
          { timeout: 90000 },
        );

        const content =
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) return content;
      } catch (err) {
        // try next model
      }
    }
  }

  // 2. Try Groq models in sequence (for pure text prompts or text fallback)
  if (groqKey && !groqKey.includes("your_groq")) {
    const groqModels = [
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "qwen/qwen3.8-27b",
      "allam-2-7b",
    ];
    for (const model of groqModels) {
      try {
        const response = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: model,
            messages: [
              {
                role: "system",
                content:
                  systemPrompt ||
                  "You are an expert AI Tender, RFP, and Bid Management consultant.",
              },
              { role: "user", content: userPrompt },
            ],
            temperature: temperature,
            ...(responseFormat === "json"
              ? { response_format: { type: "json_object" } }
              : {}),
          },
          {
            headers: {
              Authorization: `Bearer ${groqKey}`,
              "Content-Type": "application/json",
            },
            timeout: 30000,
          },
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (content) return content;
      } catch (err) {
        // try next model
      }
    }
  }

  // 3. Try OpenAI
  if (openaiKey && !openaiKey.includes("your_openai")) {
    try {
      const messages = [
        {
          role: "system",
          content:
            systemPrompt ||
            "You are an expert AI Tender and Bid Management consultant.",
        },
      ];

      if (inlineData && inlineData.mimeType?.startsWith("image/")) {
        messages.push({
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${inlineData.mimeType};base64,${inlineData.data}`,
              },
            },
          ],
        });
      } else {
        messages.push({ role: "user", content: userPrompt });
      }

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: messages,
          temperature: temperature,
          ...(responseFormat === "json"
            ? { response_format: { type: "json_object" } }
            : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 45000,
        },
      );
      const content = response.data?.choices?.[0]?.message?.content;
      if (content) return content;
    } catch (err) {
      // ignore
    }
  }

  throw new Error("No working AI provider configured or quota reached.");
}
