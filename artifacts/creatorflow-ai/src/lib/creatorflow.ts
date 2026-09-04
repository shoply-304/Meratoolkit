import type { Generation, GenerationInput } from '@workspace/api-client-react';

export const TOOL_META: Record<string, { label: string; short: string; description: string; color: string }> = {
  ideas: { label: 'Idea engine', short: 'Find the next spark', description: 'Turn a loose thought into a set of strong, specific directions.', color: 'orange' },
  titles: { label: 'Title studio', short: 'Name the moment', description: 'Build titles with enough pull to earn the first click.', color: 'teal' },
  hooks: { label: 'Hook lab', short: 'Win the first second', description: 'Open with tension, clarity, and a reason to keep watching.', color: 'violet' },
  description: { label: 'Description writer', short: 'Give it context', description: 'Make every word after the hook do useful work.', color: 'blue' },
  thumbnail: { label: 'Thumbnail brief', short: 'Make it visible', description: 'Art-direct a thumbnail concept that reads at a glance.', color: 'pink' },
  hashtags: { label: 'Hashtag map', short: 'Reach the right room', description: 'Build a practical hashtag mix around intent and discovery.', color: 'green' },
  'script-outline': { label: 'Script outline', short: 'Shape the story', description: 'Go from premise to beat-by-beat structure without the blank page.', color: 'amber' },
  'content-calendar': { label: 'Content calendar', short: 'Keep the rhythm', description: 'Turn an ambition into a cadence you can actually keep.', color: 'indigo' },
};

export const toolPath = (tool: string) => `/tools/${tool}`;

export function readHistory(): Generation[] {
  try {
    return JSON.parse(localStorage.getItem('creatorflow:history') || '[]') as Generation[];
  } catch { return []; }
}

export function saveGeneration(generation: Generation) {
  const history = readHistory().filter((item) => item.id !== generation.id);
  localStorage.setItem('creatorflow:history', JSON.stringify([generation, ...history].slice(0, 40)));
}

export function removeGeneration(id: string) {
  localStorage.setItem('creatorflow:history', JSON.stringify(readHistory().filter((item) => item.id !== id)));
}

export function readPrefs(): Partial<GenerationInput> {
  try { return JSON.parse(localStorage.getItem('creatorflow:prefs') || '{}') as Partial<GenerationInput>; } catch { return {}; }
}

export function savePrefs(prefs: Partial<GenerationInput>) {
  localStorage.setItem('creatorflow:prefs', JSON.stringify({ ...readPrefs(), ...prefs }));
}

export const toolList = Object.entries(TOOL_META).map(([id, meta]) => ({ id, ...meta }));