'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, BookOpenText, Calendar, FileText, LayoutDashboard, Settings, Users } from 'lucide-react';
import { Avatar, IconButton, Logo, cn } from '@/components/ui';
import { api } from '@/lib/api';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  shortcut?: string;
}

const NAV: NavItem[] = [
  { href: '/app/dashboard', label: 'Today', icon: <LayoutDashboard size={16} strokeWidth={1.75} />, shortcut: 'T' },
  { href: '/app/patients', label: 'Patients', icon: <Users size={16} strokeWidth={1.75} />, shortcut: 'P' },
  { href: '/app/schedule', label: 'Schedule', icon: <Calendar size={16} strokeWidth={1.75} />, shortcut: 'S' },
  { href: '/app/notes', label: 'Notes', icon: <FileText size={16} strokeWidth={1.75} />, shortcut: 'N' },
  { href: '/app/templates', label: 'Templates', icon: <BookOpenText size={16} strokeWidth={1.75} /> },
  { href: '/app/audit', label: 'Audit', icon: <Activity size={16} strokeWidth={1.75} /> },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [clinicianName, setClinicianName] = useState<string>('Loading…');
  const [practiceName, setPracticeName] = useState<string>('');

  useEffect(() => {
    try {
      // store is the source of truth on the client; SSR returns the seed snapshot.
      const snap = api.listEncounters();
      const enc = snap.data[0];
      const clin = enc?.clinician;
      if (clin) setClinicianName(clin.name);
      // We can't reach tenant.name through the api wrapper today; hardcoded to seed value.
      setPracticeName('Riverside Family Practice');
    } catch {
      setClinicianName('Demo Clinician');
      setPracticeName('Riverside Family Practice');
    }
  }, []);

  function resetDemo() {
    api.reset();
    if (typeof window !== 'undefined') window.location.reload();
  }

  return (
    <div className="min-h-dvh grid grid-cols-[260px_1fr] bg-[oklch(98%_0.005_240)]">
      <aside className="sticky top-0 h-dvh border-r border-[oklch(92%_0.008_240)] bg-white px-3 py-5 flex flex-col">
        <div className="px-2 flex items-center gap-2.5 text-[oklch(20%_0.02_240)]">
          <Logo className="h-6 w-6 text-[oklch(50%_0.14_250)]" />
          <div className="leading-tight">
            <div className="text-[14px] font-semibold tracking-[-0.01em]">Clinical Notes</div>
            <div className="text-[11px] text-[oklch(55%_0.012_240)] truncate max-w-[180px]" title={practiceName}>
              {practiceName}
            </div>
          </div>
        </div>

        <nav className="mt-7 flex flex-col gap-0.5" aria-label="Primary">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== '/app/dashboard' && pathname?.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(50%_0.14_250)]',
                  active
                    ? 'bg-[oklch(96%_0.02_250)] text-[oklch(35%_0.14_250)] font-medium'
                    : 'text-[oklch(40%_0.015_240)] hover:bg-[oklch(96%_0.008_240)] hover:text-[oklch(20%_0.02_240)]',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className={cn('shrink-0', active ? 'text-[oklch(50%_0.14_250)]' : 'text-[oklch(48%_0.012_240)]')}>
                  {n.icon}
                </span>
                <span className="flex-1">{n.label}</span>
                {n.shortcut && (
                  <kbd className="hidden lg:inline text-[10px] font-mono text-[oklch(45%_0.012_240)] bg-[oklch(96%_0.008_240)] rounded px-1.5 py-0.5">
                    {n.shortcut}
                  </kbd>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <button
            type="button"
            onClick={resetDemo}
            className="w-full text-left flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] text-[oklch(45%_0.012_240)] hover:bg-[oklch(96%_0.008_240)] hover:text-[oklch(20%_0.02_240)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(50%_0.14_250)] transition-colors"
            title="Restore the demo to its seeded state"
          >
            <Settings size={14} strokeWidth={1.75} />
            Reset demo
          </button>
          <div className="mt-2 flex items-center gap-2.5 rounded-md px-2 py-2 bg-[oklch(98%_0.005_240)]">
            <Avatar name={clinicianName} size="sm" />
            <div className="leading-tight min-w-0">
              <div className="text-[12.5px] font-medium truncate">{clinicianName}</div>
              <div className="text-[10.5px] text-[oklch(55%_0.012_240)]">Family medicine</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex flex-col">
        <TopBar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="h-14 border-b border-[oklch(92%_0.008_240)] bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-[12px] uppercase tracking-[0.06em] text-[oklch(55%_0.012_240)]">
          {greeting()} · {today()}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <IconButton label="Search">
          <SearchIcon />
        </IconButton>
        <IconButton label="Notifications">
          <BellIcon />
        </IconButton>
      </div>
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Late shift';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function today(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
