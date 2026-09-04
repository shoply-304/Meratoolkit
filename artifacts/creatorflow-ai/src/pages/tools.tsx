import { ArrowUpRight, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell, PageHeader } from '@/components/app-shell';
import { toolList } from '@/lib/creatorflow';

export default function Tools() {
  const [query, setQuery] = useState('');
  const filtered = toolList.filter((tool) => `${tool.label} ${tool.description}`.toLowerCase().includes(query.toLowerCase()));
  return <AppShell><PageHeader eyebrow="The toolkit" title="From blank page to next move." description="Focused instruments for the moments where creator work tends to stall." />
    <div className="px-5 py-7 sm:px-8 lg:px-12 lg:py-10"><div className="mb-8 flex max-w-md items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-card px-3.5 py-2.5"><Search size={16} className="text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a tool" className="w-full bg-transparent text-sm outline-none" data-testid="input-search-tools" /></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((tool, index) => <Link href={`/tools/${tool.id}`} key={tool.id} className={`group relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[hsl(var(--primary)/.5)] hover:shadow-[var(--shadow-md)] ${index === 0 ? 'md:col-span-2 xl:col-span-1 xl:row-span-2 xl:flex xl:flex-col xl:justify-between xl:p-7' : ''}`} data-testid={`card-tool-${tool.id}`}><div className="absolute right-5 top-5 h-14 w-14 rounded-full bg-[hsl(var(--accent)/.12)] transition-transform duration-300 group-hover:scale-125" /><div><div className="mb-8 flex items-center justify-between"><span className="relative grid h-9 w-9 place-items-center rounded-xl bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]"><Sparkles size={17} /></span><ArrowUpRight size={18} className="text-muted-foreground transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[hsl(var(--primary))]" /></div><p className="font-mono-app text-[9px] uppercase tracking-[.15em] text-muted-foreground">0{index + 1} / instrument</p><h2 className="mt-2 font-display text-xl font-bold tracking-[-.04em]">{tool.label}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{tool.description}</p></div><p className="mt-7 text-xs font-bold text-[hsl(var(--primary))]">{tool.short}</p></Link>)}</div>
      {!filtered.length && <p className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-muted-foreground">No tools match that search.</p>}
    </div>
  </AppShell>;
}