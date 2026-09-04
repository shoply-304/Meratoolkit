import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import { GenerateContentBody } from "@workspace/api-zod";

const generationRouter: IRouter = Router();

const MODEL = "gemini-3.6-flash";
const MAX_TOPIC_LENGTH = 500;

type GenerationRequest = {
  tool:
    | "ideas"
    | "titles"
    | "hooks"
    | "description"
    | "thumbnail"
    | "hashtags"
    | "script-outline"
    | "content-calendar";
  topic: string;
  platform?: string;
  contentType?: string;
  audience?: string;
  tone?: string;
  language?: string;
  niche?: string;
  count?: number;
  keywords?: string;
  videoLength?: string;
  postingFrequency?: string;
  duration?: string;
  title?: string;
  style?: string;
  goal?: string;
};

type Generation = {
  id: string;
  tool: GenerationRequest["tool"];
  createdAt: string;
  headline: string;
  summary: string;
  items: Array<{ title: string; body: string; meta?: string }>;
  sections: Array<{ label: string; body: string }>;
  calendar: Array<{
    date: string;
    contentType: string;
    topic: string;
    titleIdea: string;
    hook: string;
    cta: string;
    platform: string;
  }>;
  rawText: string;
};

const toolInstructions: Record<GenerationRequest["tool"], string> = {
  ideas:
    "Create original video ideas. Each item title is the idea, body is a useful explanation, and meta includes target audience and suggested format.",
  titles:
    "Create compelling but truthful title options. Each item title is the title, body explains why it works, and meta states the title style.",
  hooks:
    "Create attention-grabbing but non-deceptive opening hooks. Each item title is a category and body is the hook.",
  description:
    "Create one polished description package. Use sections with labels Professional description, Short summary, Suggested keywords, and Suggested call-to-action.",
  thumbnail:
    "Create one practical thumbnail concept. Use sections with labels Thumbnail concept, Main visual, Suggested text, Composition, Background idea, Facial expression, and AI image-generation prompt. Do not generate an image.",
  hashtags:
    "Create useful hashtag suggestions. Use sections with labels Primary, Secondary, and Niche-specific. Do not promise reach or virality.",
  "script-outline":
    "Create a structured outline. Use sections with labels Hook, Introduction, Main Point 1, Main Point 2, Main Point 3, Conclusion, and Call-to-action.",
  "content-calendar":
    "Create a calendar with one row per planned post. Put date, contentType, topic, titleIdea, hook, cta, and platform in calendar rows.",
};

function buildPrompt(input: GenerationRequest): string {
  const count =
    input.count && Number.isInteger(input.count) ? input.count : 5;
  const context = [
    `Topic: ${input.topic}`,
    `Platform: ${input.platform ?? "not specified"}`,
    `Content type: ${input.contentType ?? "not specified"}`,
    `Audience: ${input.audience ?? "general creators"}`,
    `Tone: ${input.tone ?? "professional"}`,
    `Language: ${input.language ?? "English"}`,
    `Niche: ${input.niche ?? "not specified"}`,
    `Keywords: ${input.keywords ?? "none provided"}`,
    `Video length: ${input.videoLength ?? "not specified"}`,
    `Posting frequency: ${input.postingFrequency ?? "not specified"}`,
    `Duration: ${input.duration ?? "not specified"}`,
    `Existing title: ${input.title ?? "not specified"}`,
    `Thumbnail style: ${input.style ?? "not specified"}`,
    `Content goal: ${input.goal ?? "consistent, useful content"}`,
  ].join("\n");

  return `You are CreatorFlow AI, a professional content strategist helping creators make useful, original, platform-appropriate content.

General rules:
- Do not guarantee virality, views, followers, rankings, or income.
- Do not fabricate facts.
- Do not intentionally create misleading clickbait.
- Respect copyright and never reproduce copyrighted text.
- Return content in the requested language.
- Keep suggestions specific and practical.

Task: ${toolInstructions[input.tool]}

Creator context:
${context}

Return ONLY valid JSON with this exact shape:
{
  "headline": "short result title",
  "summary": "one or two sentence overview",
  "items": [{"title": "string", "body": "string", "meta": "optional string"}],
  "sections": [{"label": "string", "body": "string"}],
  "calendar": [{"date": "string", "contentType": "string", "topic": "string", "titleIdea": "string", "hook": "string", "cta": "string", "platform": "string"}],
  "rawText": "plain text version of the complete result"
}

For list tools return exactly ${count} items unless the tool is description, thumbnail, hashtags, script-outline, or content-calendar. For non-list tools, use sections and/or calendar and keep items empty.`;
}

function extractText(payload: unknown): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "candidates" in payload &&
    Array.isArray(payload.candidates)
  ) {
    const first = payload.candidates[0];
    if (
      typeof first === "object" &&
      first !== null &&
      "content" in first &&
      typeof first.content === "object" &&
      first.content !== null &&
      "parts" in first.content &&
      Array.isArray(first.content.parts)
    ) {
      return first.content.parts
        .map((part: unknown) => {
          if (typeof part === "object" && part !== null && "text" in part) {
            return String(part.text ?? "");
          }
          return "";
        })
        .join("")
        .trim();
    }
  }
  return "";
}

function parseJson(text: string): Omit<Generation, "id" | "tool" | "createdAt"> {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const parsed: unknown = JSON.parse(cleaned);

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("AI response was not an object");
  }

  const record = parsed as Record<string, unknown>;
  const items = Array.isArray(record.items)
    ? record.items
        .filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null,
        )
        .map((item) => ({
          title: String(item.title ?? ""),
          body: String(item.body ?? ""),
          ...(item.meta ? { meta: String(item.meta) } : {}),
        }))
        .filter((item) => item.title && item.body)
    : [];
  const sections = Array.isArray(record.sections)
    ? record.sections
        .filter(
          (section): section is Record<string, unknown> =>
            typeof section === "object" && section !== null,
        )
        .map((section) => ({
          label: String(section.label ?? ""),
          body: String(section.body ?? ""),
        }))
        .filter((section) => section.label && section.body)
    : [];
  const calendar = Array.isArray(record.calendar)
    ? record.calendar
        .filter(
          (row): row is Record<string, unknown> =>
            typeof row === "object" && row !== null,
        )
        .map((row) => ({
          date: String(row.date ?? ""),
          contentType: String(row.contentType ?? ""),
          topic: String(row.topic ?? ""),
          titleIdea: String(row.titleIdea ?? ""),
          hook: String(row.hook ?? ""),
          cta: String(row.cta ?? ""),
          platform: String(row.platform ?? ""),
        }))
        .filter((row) => row.date && row.titleIdea)
    : [];

  const headline = String(record.headline ?? "").trim();
  const summary = String(record.summary ?? "").trim();
  const rawText = String(record.rawText ?? "").trim();

  if (!headline || (!items.length && !sections.length && !calendar.length)) {
    throw new Error("AI response was incomplete");
  }

  return { headline, summary, items, sections, calendar, rawText };
}

generationRouter.post("/generations", async (req, res) => {
  const parsed = GenerateContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check your topic and generation settings." });
    return;
  }

  const input = parsed.data as GenerationRequest;
  if (
    !input.topic.trim() ||
    input.topic.length > MAX_TOPIC_LENGTH ||
    (input.count !== undefined &&
      (!Number.isInteger(input.count) || input.count < 1 || input.count > 20))
  ) {
    res.status(400).json({ error: "Please enter a valid topic and generation count." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: "AI generation is not configured yet. Add a Gemini API key in project secrets.",
    });
    return;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
          generationConfig: {
            temperature: 0.85,
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
          },
        }),
        signal: AbortSignal.timeout(45_000),
      },
    );

    if (response.status === 429) {
      res.status(429).json({ error: "The AI service is busy right now. Please try again in a moment." });
      return;
    }
    if (!response.ok) {
      const providerMessage = (await response.text()).slice(0, 500);
      req.log.warn({ status: response.status, providerMessage }, "Gemini request failed");
      res.status(503).json({ error: "AI service is temporarily unavailable. Please try again." });
      return;
    }

    const payload: unknown = await response.json();
    const text = extractText(payload);
    if (!text) {
      throw new Error("Gemini returned no text");
    }
    const result = parseJson(text);
    const generation: Generation = {
      id: randomUUID(),
      tool: input.tool,
      createdAt: new Date().toISOString(),
      ...result,
    };
    res.json(generation);
  } catch (error) {
    req.log.error({ err: error }, "Content generation failed");
    res.status(503).json({ error: "Something went wrong while generating your content. Please try again." });
  }
});

export default generationRouter;