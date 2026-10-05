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

  // 1. If inlineData (e.g. Scanned PDF / Image) is provided or general Gemini text query
  if (geminiKey && !geminiKey.includes("your_gemini")) {
    const geminiModels = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.8-flash",
      "gemini-3.1-pro-preview",
      "gemini-flash-latest",
    ];
    for (const model of geminiModels) {
      try {
        console.log(
          `🤖 Invoking Gemini Model: ${model} ${inlineData ? "(with Multimodal PDF/Image)" : "(Digital Text)"}`,
        );
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
          { timeout: 120000 },
        );

        const content =
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          console.log(`✅ Gemini ${model} successfully extracted tender data.`);
          return content;
        }
      } catch (err) {
        const status = err.response?.status;
        const msg = err.response?.data?.error?.message || err.message;
        console.warn(`⚠️ [Gemini ${model} Failed]: Status ${status} - ${msg}`);
      }
    }
  }

  // 2. Try Groq models in sequence (for pure text prompts or text fallback)
  if (groqKey && !groqKey.includes("your_groq") && !inlineData) {
    const groqModels = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
    ];
    for (const model of groqModels) {
      try {
        console.log(`⚡ Invoking Groq Model: ${model}`);
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
        if (content) {
          console.log(`✅ Groq ${model} successfully returned response.`);
          return content;
        }
      } catch (err) {
        const status = err.response?.status;
        const msg = err.response?.data?.error?.message || err.message;
        console.warn(`⚠️ [Groq ${model} Failed]: Status ${status} - ${msg}`);
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
      console.warn("OpenAI call failed:", err.message);
    }
  }

  throw new Error("No working AI provider configured or all models failed.");
}
