
import { Router } from "express";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { z } from "zod";

import { gemini } from "../config/gemini.js";

const router = Router();

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().trim().min(1).max(10000)
    })
  )
  .min(1)
  .max(50)
});

const REQUEST_TIMEOUT = 90000;

router.post("/", async (req, res) => {
  const requestId = randomUUID();
  const requestStart = performance.now();

  const model =
    process.env.GEMINI_MODEL || "gemini-3.8-flash";

  const log = (message: string) => {
    console.log(`[${requestId}] ${message}`);
  };

  const logTime = (step: string, start: number) => {
    const duration = performance.now() - start;

    log(`${step}: ${duration.toFixed(2)}ms`);

    return duration;
  };

  log("Incoming chat request");

  try {
    // 1. Validate request
    const validationStart = performance.now();

    const validation = chatSchema.safeParse(req.body);

    logTime("Validation", validationStart);

    if (!validation.success) {
      log("Request validation failed");

      return res.status(400).json({
        error: "Invalid chat messages.",
        details: validation.error.flatten()
      });
    }

    const { messages } = validation.data;

    log(`Message count: ${messages.length}`);
    log(`Model: ${model}`);

    // 2. Prepare Gemini input
    const preparationStart = performance.now();

    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    }));

    logTime("Message preparation", preparationStart);

    // 3. Call Gemini API
    const geminiStart = performance.now();

    log("Calling Gemini...");

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      const response = await Promise.race([
        gemini.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction:
              "You are a helpful AI assistant. " +
              "Provide clear, accurate, and friendly answers. " +
              "Use Markdown when appropriate."
          }
        }),

        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(
              new Error(
                `Gemini request timed out after ${REQUEST_TIMEOUT / 1000} seconds`
              )
            );
          }, REQUEST_TIMEOUT);
        })
      ]);

      logTime("Gemini API", geminiStart);

      // 4. Extract response
      const extractionStart = performance.now();

      const message =
        response.text || "No response generated.";

      logTime("Response extraction", extractionStart);

      // 5. Return response
      logTime("Total backend time", requestStart);

      log("Request completed successfully");

      return res.status(200).json({
        message,
        requestId
      });

    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }

  } catch (error: unknown) {
    const totalTime = performance.now() - requestStart;

    log(`Request failed after ${totalTime.toFixed(2)}ms`);

    if (error instanceof Error) {
      console.error(`[${requestId}] Gemini API Error:`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error(`[${requestId}] Unknown Gemini API Error:`, error);
    }

    if (error instanceof Error &&
        error.message.includes("timed out")) {
      return res.status(504).json({
        error: "Gemini took too long to respond. Please try again.",
        requestId
      });
    }

    return res.status(500).json({
      error: "Something went wrong while generating the response.",
      requestId
    });
  }
});

export default router;
