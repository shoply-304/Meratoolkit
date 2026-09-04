import { ArrowUpRight, Bookmark, Layers3, Play, Target } from 'lucide-react';
import { Link } from 'wouter';
import { AppShell, PageHeader } from '@/components/app-shell';

const templates = [
  { id: 'weekly-series', name: 'The weekly series', type: 'Video system', detail: 'A repeatable structure for a show people can recognize.', tool: '/tools/script-outline', icon: Play, tone: 'bg-[hsl(var(--accent)/.14)] text-[hsl(var(--accent))]' },
  { id: 'launch-week', name: 'Launch week map', type: 'Campaign rhythm', detail: 'Build anticipation without turning every post into a pitch.', tool: '/tools/content-calendar', icon: Target, tone: 'bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]' },
  { id: 'point-of-view', name: 'Point of view', type: 'Idea starter', detail: 'Turn the thing you believe into a clear creative direction.', tool: '/tools/ideas', icon: Layers3, tone: 'bg-violet-100 text-violet-700' },
  { id: 'short-form-pack', name: 'Short-form pack', type: 'Repurpose kit', detail: 'One idea, five angles, a week of useful momentum.', tool: '/tools/hooks', icon: Bookmark, tone: 'bg-sky-100 text-sky-700' },
];

export default function Templates() {
  return <AppShell><PageHeader eyebrow="Starting points" title="Skip the blank page." description="Opinionated structures for when you know what you want to say, but not how to begin." /><div className="px-5 py-7 sm:px-8 lg:px-12 lg:py-10"><div className="grid gap-4 lg:grid-cols-2">{templates.map((template, index) => { const Icon = template.icon; return <article key={template.id} className={`group relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-card p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-md)] ${index === 0 ? 'lg:row-span-2 lg:flex lg:flex-col lg:justify-between lg:p-8' : ''}`} data-testid={`card-template-${template.id}`}><div><div className="mb-9 flex items-center justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${template.tone}`}><Icon size={18} /></span><span className="font-mono-app text-[9px] uppercase tracking-[.13em] text-muted-foreground">{template.type}</span></div><h2 className="font-display text-2xl font-bold tracking-[-.045em]">{template.name}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{template.detail}</p></div><Link href={template.tool} className="mt-9 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]" data-testid={`link-use-template-${template.id}`}>Use this starting point <ArrowUpRight size={14} /></Link></article>; })}</div></div></AppShell>;
}