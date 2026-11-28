import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { VISIT } from '../data/visit';
import { Icon, type IconName } from './Icon';
import { OpenHoodLogo } from './OpenHoodLogo';

type TabId = 'car' | 'inspection' | 'help';
const TABS: { id: TabId; to: string; label: string; icon: IconName }[] = [
  { id: 'car', to: '/', label: 'My car', icon: 'home' },
  { id: 'inspection', to: '/inspect', label: 'Inspection', icon: 'car' },
  { id: 'help', to: '/help', label: 'Help', icon: 'help' },
];

export function activeTab(pathname: string): TabId {
  if (pathname.startsWith('/inspect') || pathname.startsWith('/findings')) return 'inspection';
  if (pathname.startsWith('/help')) return 'help';
  return 'car';
}

export function AppShell() {
  const { pathname } = useLocation();
  const tab = activeTab(pathname);

  useEffect(() => {
    if (!navigator.userAgent.includes('jsdom')) window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app oh-app">
      <header className="app-top oh-topbar">
        <OpenHoodLogo />
        <span className="oh-topbar__end">
          <span className="oh-tag oh-tag--navy">{VISIT.ro}</span>
        </span>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <nav className="app-tabs oh-tabbar" aria-label="Main">
        {TABS.map((t) => (
          <Link key={t.id} to={t.to} aria-current={tab === t.id ? 'page' : undefined}>
            <Icon name={t.icon} />
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
