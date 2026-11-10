
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

async function testGemini() {
  console.log("1. Starting Gemini API test...");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  console.log("2. API key loaded");
  console.log("3. Initializing Gemini client...");

  const ai = new GoogleGenAI({ apiKey });

  console.log("4. Sending request to Gemini...");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "Say hello"
    });

    console.log("5. Response received!");
    console.log(response.text);

  } catch (error) {
    console.error("Gemini API failed:", error);
  }
}

testGemini();
