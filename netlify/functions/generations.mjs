const MODEL = 'gemini-3.6-flash';
const MAX_TOPIC_LENGTH = 500;
const MAX_BODY_BYTES = 24_000;

const TOOLS = new Set([
  'ideas',
  'titles',
  'hooks',
  'description',
  'thumbnail',
  'hashtags',
  'script-outline',
  'content-calendar',
]);

const LIMITS = {
  platform: 80,
  contentType: 80,
  audience: 120,
  tone: 80,
  language: 80,
  niche: 120,
  keywords: 500,
  videoLength: 40,
  postingFrequency: 40,
  duration: 40,
  title: 300,
  style: 120,
  goal: 160,
};

const toolInstructions = {
  ideas:
    'Create original video ideas. Each item title is the idea, body is a useful explanation, and meta includes target audience and suggested format.',
  titles:
    'Create compelling but truthful title options. Each item title is the title, body explains why it works, and meta states the title style.',
  hooks:
    'Create attention-grabbing but non-deceptive opening hooks. Each item title is a category and body is the hook.',
  description:
    'Create one polished description package. Use sections with labels Professional description, Short summary, Suggested keywords, and Suggested call-to-action.',
  thumbnail:
    'Create one practical thumbnail concept. Use sections with labels Thumbnail concept, Main visual, Suggested text, Composition, Background idea, Facial expression, and AI image-generation prompt. Do not generate an image.',
  hashtags:
    'Create useful hashtag suggestions. Use sections with labels Primary, Secondary, and Niche-specific. Do not promise reach or virality.',
  'script-outline':
    'Create a structured outline. Use sections with labels Hook, Introduction, Main Point 1, Main Point 2, Main Point 3, Conclusion, and Call-to-action.',
  'content-calendar':
    'Create a calendar with one row per planned post. Put date, contentType, topic, titleIdea, hook, cta, and platform in calendar rows.',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function stringField(value, max) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string' || value.length > max) return null;
  return value;
}

function validateInput(input) {
  if (!input || typeof input !== 'object') return 'Invalid request body.';
  if (!TOOLS.has(input.tool)) return 'Invalid generation tool.';
  if (typeof input.topic !== 'string' || !input.topic.trim() || input.topic.length > MAX_TOPIC_LENGTH) {
    return 'Please enter a valid topic.';
  }

  for (const [key, max] of Object.entries(LIMITS)) {
    const value = stringField(input[key], max);
    if (value === null) return `The ${key} field is too long.`;
  }

  if (input.count !== undefined) {
    if (!Number.isInteger(input.count) || input.count < 1 || input.count > 20) {
      return 'Generation count must be between 1 and 20.';
    }
  }

  return null;
}

function buildPrompt(input) {
  const count = Number.isInteger(input.count) ? input.count : 5;
  const context = [
    `Topic: ${input.topic}`,
    `Platform: ${input.platform ?? 'not specified'}`,
    `Content type: ${input.contentType ?? 'not specified'}`,
    `Audience: ${input.audience ?? 'general creators'}`,
    `Tone: ${input.tone ?? 'professional'}`,
    `Language: ${input.language ?? 'English'}`,
    `Niche: ${input.niche ?? 'not specified'}`,
    `Keywords: ${input.keywords ?? 'none provided'}`,
    `Video length: ${input.videoLength ?? 'not specified'}`,
    `Posting frequency: ${input.postingFrequency ?? 'not specified'}`,
    `Duration: ${input.duration ?? 'not specified'}`,
    `Existing title: ${input.title ?? 'not specified'}`,
    `Thumbnail style: ${input.style ?? 'not specified'}`,
    `Content goal: ${input.goal ?? 'consistent, useful content'}`,
  ].join('\n');

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

function extractText(payload) {
  const candidates = payload?.candidates;
  if (!Array.isArray(candidates)) return '';
  const parts = candidates[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map((part) => (typeof part?.text === 'string' ? part.text : '')).join('').trim();
}

function parseJson(text) {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('AI response was not an object');
  }

  const items = Array.isArray(parsed.items)
    ? parsed.items
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          title: String(item.title ?? ''),
          body: String(item.body ?? ''),
          ...(item.meta ? { meta: String(item.meta) } : {}),
        }))
        .filter((item) => item.title && item.body)
    : [];

  const sections = Array.isArray(parsed.sections)
    ? parsed.sections
        .filter((section) => section && typeof section === 'object')
        .map((section) => ({
          label: String(section.label ?? ''),
          body: String(section.body ?? ''),
        }))
        .filter((section) => section.label && section.body)
    : [];

  const calendar = Array.isArray(parsed.calendar)
    ? parsed.calendar
        .filter((row) => row && typeof row === 'object')
        .map((row) => ({
          date: String(row.date ?? ''),
          contentType: String(row.contentType ?? ''),
          topic: String(row.topic ?? ''),
          titleIdea: String(row.titleIdea ?? ''),
          hook: String(row.hook ?? ''),
          cta: String(row.cta ?? ''),
          platform: String(row.platform ?? ''),
        }))
        .filter((row) => row.date && row.titleIdea)
    : [];

  const headline = String(parsed.headline ?? '').trim();
  const summary = String(parsed.summary ?? '').trim();
  const rawText = String(parsed.rawText ?? '').trim();

  if (!headline || (!items.length && !sections.length && !calendar.length)) {
    throw new Error('AI response was incomplete');
  }

  return {
    headline,
    summary,
    items,
    sections,
    calendar,
    rawText: rawText || buildRawText({ headline, summary, items, sections, calendar }),
  };
}

function buildRawText(result) {
  const lines = [result.headline, result.summary].filter(Boolean);
  for (const item of result.items) lines.push(`${item.title}\n${item.body}${item.meta ? `\n${item.meta}` : ''}`);
  for (const section of result.sections) lines.push(`${section.label}\n${section.body}`);
  for (const row of result.calendar) lines.push(`${row.date} — ${row.titleIdea}\n${row.hook}\n${row.cta}`);
  return lines.join('\n\n');
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json({ error: 'AI generation is not configured yet. Add GEMINI_API_KEY in Netlify environment variables.' }, 503);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json({ error: 'Request is too large.' }, 413);
  }

  let input;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return json({ error: 'Request is too large.' }, 413);
    }
    input = JSON.parse(raw);
  } catch {
    return json({ error: 'Invalid JSON request.' }, 400);
  }

  const validationError = validateInput(input);
  if (validationError) return json({ error: validationError }, 400);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: buildPrompt(input) }] }],
          generationConfig: {
            temperature: 0.85,
            responseMimeType: 'application/json',
            maxOutputTokens: 8192,
          },
        }),
        signal: AbortSignal.timeout(45_000),
      },
    );

    if (response.status === 429) {
      return json({ error: 'The AI service is busy right now. Please try again in a moment.' }, 429);
    }

    if (!response.ok) {
      return json({ error: 'AI service is temporarily unavailable. Please try again.' }, 503);
    }

    const payload = await response.json();
    const text = extractText(payload);
    if (!text) throw new Error('Gemini returned no text');

    const result = parseJson(text);
    return json({
      id: crypto.randomUUID(),
      tool: input.tool,
      createdAt: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('CreatorFlow generation failed:', error instanceof Error ? error.message : 'unknown error');
    return json({ error: 'Something went wrong while generating your content. Please try again.' }, 503);
  }
}
