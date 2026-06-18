/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";

const MODELS = [
  { id: "openai/gpt-4o", name: "GPT-4o" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5" },
  { id: "google/gemini-1.5-pro", name: "Gemini 1.5" },
];

const SYSTEM_PROMPTS: Record<string, string> = {
  improve:
    "Improve this prompt by making it more specific, structured, and effective. Add clear context, constraints, and output format. Return only the improved prompt.",
  expand:
    "Expand this prompt with more detail, examples, edge cases, and structured instructions. Return only the expanded prompt.",
  rewrite:
    "Rewrite this prompt for maximum clarity and effectiveness. Use role assignment, clear objectives, and output formatting. Return only the rewritten prompt.",
  translate:
    "Translate this prompt to English while preserving technical meaning. Return only the translated prompt.",
};

const MODEL_CONVERSIONS: Record<string, string> = {
  ChatGPT:
    "Convert this prompt for ChatGPT (GPT-4o). Use clear role-setting and step-by-step instructions.",
  Claude:
    "Convert this prompt for Claude 3.5. Use XML tags for structure and Claude best practices.",
  Gemini:
    "Convert this prompt for Gemini 1.5. Optimize for context window and multi-modal capabilities.",
  Midjourney:
    "Convert this prompt for Midjourney v6. Use Midjourney parameter syntax (--ar, --v, --s, etc).",
  Flux: "Convert this prompt for Flux Pro with Flux-optimized formatting.",
};

async function callOpenRouter(
  messages: { role: string; content: string }[],
  model = "openai/gpt-4o-mini",
) {
  const apiKey = process.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.VITE_APP_URL || "http://localhost:8080",
    },
    body: JSON.stringify({ model, messages, max_tokens: 2000 }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

export const optimizePrompt = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  const { prompt, action, targetModel } = ctx.data || {};
  if (!prompt?.trim()) return { error: "Prompt is required" };

  let systemPrompt = SYSTEM_PROMPTS[action] || SYSTEM_PROMPTS.improve;
  if (targetModel && MODEL_CONVERSIONS[targetModel]) {
    systemPrompt = MODEL_CONVERSIONS[targetModel];
  }

  const result = await callOpenRouter([
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ]);

  if (!result) {
    return {
      result: `[${(action || "improve").toUpperCase()}]\n\n${prompt}\n\n---\nDemo mode. Set VITE_OPENROUTER_API_KEY in .env for AI optimization.`,
    };
  }

  return { result };
});

export const testPrompt = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  const { prompt } = ctx.data || {};
  if (!prompt?.trim()) return { error: "Prompt is required" };

  const results: Record<string, string> = {};

  await Promise.all(
    MODELS.map(async (model) => {
      const response = await callOpenRouter([{ role: "user", content: prompt }], model.id);
      results[model.id] = response || `[Simulated] ${model.name} response would appear here.`;
    }),
  );

  return { results };
});
