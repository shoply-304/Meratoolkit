import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Clock3, Activity, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { useHealthCheck } from '@workspace/api-client-react';
import { AppShell, PageHeader, ButtonLink } from '@/components/app-shell';
import { GenerationWorkspace } from '@/components/generation-workspace';
import { readHistory, TOOL_META } from '@/lib/creatorflow';
import type { Generation } from '@workspace/api-client-react';

export default function Dashboard() {
  const [history, setHistory] = useState<Generation[]>([]);
  const health = useHealthCheck();
  useEffect(() => setHistory(readHistory()), []);
  return <AppShell><PageHeader eyebrow="Workspace / today" title="Make something worth saving." description="One idea in. A clearer path to publish out." action={<ButtonLink href="/tools"><Zap size={15} />Browse toolkit</ButtonLink>} />
    <div className="space-y-8 px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Generations saved" value={String(history.length)} detail="on this device" icon={CheckCircle2} />
        <StatCard label="Creative momentum" value={history.length > 0 ? 'Moving' : 'Ready'} detail={history.length > 0 ? 'keep the thread going' : 'your first idea is close'} icon={Activity} />
        <StatCard label="System status" value={health.isLoading ? 'Checking' : health.isError ? 'Offline' : 'Online'} detail="generation engine" icon={Clock3} />
      </section>
      <section><div className="mb-4 flex items-end justify-between"><div><p className="font-mono-app text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">Quick generation</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-.04em]">Start with a spark</h2></div><Link href="/tools/ideas" className="hidden items-center gap-1 text-xs font-bold text-[hsl(var(--primary))] sm:flex" data-testid="link-open-idea-engine">Open idea engine <ArrowUpRight size={14} /></Link></div><GenerationWorkspace tool="ideas" /></section>
      <section><div className="mb-4 flex items-end justify-between"><div><p className="font-mono-app text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">Local archive</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-.04em]">Recent work</h2></div><Link href="/history" className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))]" data-testid="link-open-history">Open history <ArrowUpRight size={14} /></Link></div>
        {history.length ? <div className="grid gap-3 lg:grid-cols-2">{history.slice(0, 4).map((item) => <Link key={item.id} href={`/history?open=${item.id}`} className="group flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-card p-4 transition hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/.45)] hover:shadow-[var(--shadow-sm)]" data-testid={`card-recent-generation-${item.id}`}><div className="min-w-0"><p className="mb-1 font-mono-app text-[9px] uppercase tracking-[.12em] text-muted-foreground">{TOOL_META[item.tool]?.label || item.tool} · {new Date(item.createdAt).toLocaleDateString()}</p><p className="truncate font-display text-sm font-bold">{item.headline}</p></div><ArrowUpRight size={16} className="shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[hsl(var(--primary))]" /></Link>)}</div> : <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/.25)] px-6 py-10 text-center"><p className="font-display font-bold">Your archive starts here.</p><p className="mt-1 text-sm text-muted-foreground">Generate something above and keep the good parts close.</p></div>}
      </section>
    </div>
  </AppShell>;
}

function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Activity }) {
  return <div className="rounded-xl border border-[hsl(var(--border))] bg-card p-4 shadow-[var(--shadow-sm)]"><div className="flex items-start justify-between"><p className="font-mono-app text-[9px] uppercase tracking-[.12em] text-muted-foreground">{label}</p><Icon size={15} className="text-[hsl(var(--primary))]" /></div><p className="mt-4 font-display text-2xl font-bold tracking-[-.05em]">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}