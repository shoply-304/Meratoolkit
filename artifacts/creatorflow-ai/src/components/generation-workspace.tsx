import { useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Copy, LoaderCircle, Play, RotateCcw, Sparkles } from 'lucide-react';
import { useGenerateContent } from '@workspace/api-client-react';
import type { Generation, GenerationInput } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { readPrefs, saveGeneration, TOOL_META } from '@/lib/creatorflow';

type GeneratorProps = { tool: GenerationInput['tool']; compact?: boolean };

export function GenerationWorkspace({ tool, compact = false }: GeneratorProps) {
  const meta = TOOL_META[tool];
  const generate = useGenerateContent();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('YouTube');
  const [tone, setTone] = useState('Clear and energetic');
  const [audience, setAudience] = useState('');
  const [keywords, setKeywords] = useState('');
  const [result, setResult] = useState<Generation | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const prefs = readPrefs();
    setPlatform(prefs.platform || 'YouTube');
    setTone(prefs.tone || 'Clear and energetic');
    setAudience(prefs.audience || '');
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!topic.trim()) return;
    generate.mutate({ data: { tool, topic, platform, tone, audience, keywords, count: tool === 'ideas' || tool === 'titles' ? 5 : undefined } }, {
      onSuccess: (payload) => {
        setResult(payload);
        saveGeneration(payload);
      },
    });
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard?.writeText(result.rawText || result.summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={`grid gap-6 ${compact ? '' : 'xl:grid-cols-[minmax(330px,410px)_1fr]'}`}>
      <form onSubmit={submit} className="surface-grid relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-card p-5 shadow-[var(--shadow-sm)] sm:p-6">
        <div className="absolute right-5 top-5 rounded-full bg-[hsl(var(--accent)/.12)] p-2.5 text-[hsl(var(--accent))]"><Sparkles size={16} /></div>
        <p className="mb-1 font-mono-app text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">Input desk</p>
        <h2 className="font-display text-xl font-bold tracking-[-.03em]">{meta.label}</h2>
        <p className="mb-6 mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{meta.description}</p>
        <label className="mb-5 block"><span className="mb-2 block text-xs font-bold">What are you making?</span><textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="A weekly video series about making better creative habits…" rows={4} className="w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.68)] px-3.5 py-3 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/.14)]" data-testid="input-generation-topic" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-2 block text-xs font-bold">Platform</span><select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.68)] px-3 py-2.5 text-xs outline-none focus:border-[hsl(var(--primary))]" data-testid="select-generation-platform"><option>YouTube</option><option>Instagram</option><option>TikTok</option><option>LinkedIn</option><option>Podcast</option></select></label>
          <label className="block"><span className="mb-2 block text-xs font-bold">Tone</span><select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.68)] px-3 py-2.5 text-xs outline-none focus:border-[hsl(var(--primary))]" data-testid="select-generation-tone"><option>Clear and energetic</option><option>Warm and candid</option><option>Sharp and contrarian</option><option>Playful and smart</option><option>Calm and instructional</option></select></label>
        </div>
        <label className="mt-4 block"><span className="mb-2 block text-xs font-bold">Who is it for? <span className="font-normal text-muted-foreground">Optional</span></span><input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Independent designers building an audience" className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.68)] px-3.5 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))]" data-testid="input-generation-audience" /></label>
        <label className="mt-4 block"><span className="mb-2 block text-xs font-bold">Keywords <span className="font-normal text-muted-foreground">Optional</span></span><input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="consistency, systems, creative energy" className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.68)] px-3.5 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))]" data-testid="input-generation-keywords" /></label>
        <button type="submit" disabled={generate.isPending || !topic.trim()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_7px_16px_hsl(var(--primary)/.2)] disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-generate-content">{generate.isPending ? <><LoaderCircle size={16} className="animate-spin" />Working through it</> : <><Play size={15} fill="currentColor" />Generate {meta.label.toLowerCase()}</>}</button>
        {generate.isError && <p className="mt-3 rounded-lg bg-[hsl(var(--destructive)/.1)] px-3 py-2 text-xs text-[hsl(var(--destructive))]" data-testid="status-generation-error">Something interrupted the generation. Check the server and try again.</p>}
      </form>
      <ResultPanel result={result} copied={copied} onCopy={copyResult} onReset={() => setResult(null)} tool={tool} />
    </div>
  );
}

function ResultPanel({ result, copied, onCopy, onReset, tool }: { result: Generation | null; copied: boolean; onCopy: () => void; onReset: () => void; tool: string }) {
  if (!result) return <div className="flex min-h-[470px] flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/.28)] px-8 text-center"><div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]"><Sparkles size={24} /></div><h3 className="font-display text-xl font-bold tracking-[-.03em]">Your workbench is ready</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Give the generator a direction. Your result will land here, ready to shape and ship.</p><div className="mt-5 flex items-center gap-2 font-mono-app text-[10px] uppercase tracking-[.14em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" /> No drafts yet</div></div>;
  return <div className="cf-rise overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-card shadow-[var(--shadow-md)]" data-testid="panel-generation-result">
    <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border))] px-5 py-5 sm:px-7"><div><p className="mb-1 font-mono-app text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary))]">Fresh from the desk</p><h2 className="max-w-2xl font-display text-xl font-bold tracking-[-.03em] sm:text-2xl">{result.headline}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{result.summary}</p></div><div className="flex shrink-0 gap-1.5"><button onClick={onCopy} className="rounded-lg border border-[hsl(var(--border))] p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Copy result" data-testid="button-copy-result">{copied ? <Check size={16} className="text-[hsl(var(--primary))]" /> : <Copy size={16} />}</button><button onClick={onReset} className="rounded-lg border border-[hsl(var(--border))] p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Start over" data-testid="button-reset-generation"><RotateCcw size={16} /></button></div></div>
    <div className="space-y-4 p-5 sm:p-7">{result.items?.map((item, index) => <article key={`${item.title}-${index}`} className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.5)] p-4 transition hover:border-[hsl(var(--primary)/.45)] hover:bg-[hsl(var(--primary)/.035)]" data-testid={`card-generation-item-${index}`}><div className="flex gap-3"><span className="font-mono-app pt-0.5 text-[10px] text-[hsl(var(--accent))]">0{index + 1}</span><div className="min-w-0"><h3 className="font-display text-base font-bold">{item.title}</h3><p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-muted-foreground">{item.body}</p>{item.meta && <p className="mt-3 font-mono-app text-[10px] uppercase tracking-[.1em] text-[hsl(var(--primary))]">{item.meta}</p>}</div></div></article>)}{result.sections?.map((section, index) => <article key={`${section.label}-${index}`} className="border-l-2 border-[hsl(var(--accent))] pl-4"><p className="font-mono-app text-[10px] uppercase tracking-[.14em] text-[hsl(var(--accent))]">{section.label}</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{section.body}</p></article>)}{tool === 'content-calendar' && result.calendar?.length > 0 && <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]"><table className="w-full min-w-[650px] text-left text-xs"><thead className="bg-[hsl(var(--muted)/.55)] font-mono-app text-[9px] uppercase tracking-[.12em] text-muted-foreground"><tr><th className="px-3 py-3">Date</th><th className="px-3 py-3">Format</th><th className="px-3 py-3">Title idea</th><th className="px-3 py-3">Hook</th></tr></thead><tbody>{result.calendar.map((row, index) => <tr key={`${row.date}-${index}`} className="border-t border-[hsl(var(--border))]"><td className="px-3 py-3 font-mono-app text-[10px]">{row.date}</td><td className="px-3 py-3">{row.contentType}</td><td className="px-3 py-3 font-semibold">{row.titleIdea}</td><td className="px-3 py-3 text-muted-foreground">{row.hook}</td></tr>)}</tbody></table></div>}</div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/.3)] px-5 py-4 sm:px-7"><p className="font-mono-app text-[10px] text-muted-foreground">Saved to your local history</p><Link href="/history" className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))] hover:underline" data-testid="link-view-history">View history <ArrowUpRight size={13} /></Link></div>
  </div>;
}