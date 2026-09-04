import { useParams } from 'wouter';
import { AppShell, PageHeader } from '@/components/app-shell';
import { GenerationWorkspace } from '@/components/generation-workspace';
import { TOOL_META } from '@/lib/creatorflow';
import type { GenerationInput } from '@workspace/api-client-react';

export default function ToolPage() {
  const params = useParams<{ tool: string }>();
  const tool = (params.tool || 'ideas') as GenerationInput['tool'];
  const meta = TOOL_META[tool] || TOOL_META.ideas;
  return <AppShell><PageHeader eyebrow={`Toolkit / ${meta.label}`} title={meta.short} description={meta.description} /><div className="px-5 py-7 sm:px-8 lg:px-12 lg:py-10"><GenerationWorkspace tool={tool} /></div></AppShell>;
}