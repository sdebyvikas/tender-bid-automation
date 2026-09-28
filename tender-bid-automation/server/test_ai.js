import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const groqKey = process.env.GROQ_API_KEY;

async function listGroq() {
  try {
    const res = await axios.get("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${groqKey}` },
    });
    console.log(
      "Available Groq models:",
      res.data?.data?.map((m) => m.id),
    );
  } catch (e) {
    console.log("Groq list error:", e.response?.data || e.message);
  }
}

listGroq();

