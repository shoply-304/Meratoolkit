import { type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { BarChart3, CalendarDays, ChevronRight, Clock3, Compass, FileStack, Grid2X2, Home, Menu, Settings, Sparkles, Tags, X } from 'lucide-react';
import { useState } from 'react';

const primaryNav = [
  { href: '/dashboard', label: 'Workspace', icon: Home },
  { href: '/tools', label: 'AI toolkit', icon: Sparkles },
  { href: '/templates', label: 'Templates', icon: FileStack },
  { href: '/history', label: 'History', icon: Clock3 },
];

const quickTools = [
  { href: '/tools/ideas', label: 'Idea engine', icon: Compass },
  { href: '/tools/titles', label: 'Title studio', icon: Tags },
  { href: '/tools/script-outline', label: 'Script outline', icon: Grid2X2 },
  { href: '/tools/content-calendar', label: 'Content calendar', icon: CalendarDays },
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" data-testid="brand-creatorflow">
      <span className={`relative grid h-8 w-8 place-items-center rounded-[10px] ${light ? 'bg-[#ff9663]' : 'bg-[hsl(var(--accent))]'}`}>
        <span className={`h-3 w-3 rotate-45 rounded-[3px] ${light ? 'bg-[#17313b]' : 'bg-[hsl(var(--foreground))]'}`} />
        <span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-[hsl(var(--sidebar))]" />
      </span>
      <span className={`font-display text-[17px] font-bold tracking-[-.03em] ${light ? 'text-white' : 'text-[hsl(var(--foreground))]'}`}>CreatorFlow <span className={light ? 'text-[#ff9663]' : 'text-[hsl(var(--primary))]'}>AI</span></span>
    </div>
  );
}

function NavItem({ href, label, icon: Icon, onNavigate }: { href: string; label: string; icon: typeof Home; onNavigate?: () => void }) {
  const [location] = useLocation();
  const active = location === href || (href !== '/dashboard' && location.startsWith(`${href}/`));
  return (
    <Link href={href} onClick={onNavigate} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${active ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))] shadow-[inset_3px_0_0_hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-foreground)/.64)] hover:bg-[hsl(var(--sidebar-accent)/.65)] hover:text-[hsl(var(--sidebar-foreground))]'}`}>
      <Icon size={17} strokeWidth={active ? 2.4 : 1.8} />
      <span>{label}</span>
      {active && <ChevronRight className="ml-auto text-[hsl(var(--sidebar-primary))]" size={14} />}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="cf-noise min-h-[100dvh] bg-background">
      <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] px-4 backdrop-blur-md lg:hidden">
        <Logo />
        <button onClick={() => setMobileOpen((open) => !open)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Toggle navigation" data-testid="button-toggle-navigation">
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[250px] flex-col bg-[hsl(var(--sidebar))] px-4 py-5 transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-9 px-2"><Logo light /></div>
        <p className="mb-2 px-3 font-mono-app text-[9px] font-medium uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.34)]">Command center</p>
        <nav className="space-y-1">
          {primaryNav.map((item) => <NavItem key={item.href} {...item} onNavigate={() => setMobileOpen(false)} />)}
        </nav>
        <p className="mb-2 mt-8 px-3 font-mono-app text-[9px] font-medium uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.34)]">Quick launch</p>
        <nav className="space-y-1">
          {quickTools.map((item) => <NavItem key={item.href} {...item} onNavigate={() => setMobileOpen(false)} />)}
        </nav>
        <div className="mt-auto space-y-1">
          <NavItem href="/settings" label="Settings" icon={Settings} onNavigate={() => setMobileOpen(false)} />
          <div className="mt-4 flex items-center gap-3 border-t border-[hsl(var(--sidebar-border))] px-3 pt-4">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[hsl(var(--primary)/.22)] font-display text-xs font-bold text-[hsl(var(--primary))]">CR</div>
            <div className="min-w-0"><p className="truncate text-xs font-bold text-[hsl(var(--sidebar-foreground))]">Creator workspace</p><p className="font-mono-app text-[9px] text-[hsl(var(--sidebar-foreground)/.43)]">Local profile</p></div>
          </div>
        </div>
      </aside>
      {mobileOpen && <button className="fixed inset-0 z-20 bg-[hsl(var(--foreground)/.25)] lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation" />}
      <main className="min-h-[100dvh] pt-16 lg:ml-[250px] lg:pt-0">{children}</main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="flex flex-col gap-5 border-b border-[hsl(var(--border))] px-5 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:py-10">
      <div className="cf-page-in">
        {eyebrow && <p className="mb-2 font-mono-app text-[10px] font-medium uppercase tracking-[.18em] text-[hsl(var(--primary))]">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-bold tracking-[-.045em] text-foreground sm:text-[40px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="cf-page-in cf-delay-1">{action}</div>}
    </header>
  );
}

export function ButtonLink({ href, children, variant = 'primary' }: { href: string; children: ReactNode; variant?: 'primary' | 'secondary' }) {
  return <Link href={href} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all duration-200 hover:-translate-y-0.5 ${variant === 'primary' ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-[0_5px_0_hsl(var(--accent)/.22)] hover:shadow-[0_7px_0_hsl(var(--accent)/.22)]' : 'border border-[hsl(var(--border))] bg-card text-foreground hover:bg-muted'}`}>{children}</Link>;
}