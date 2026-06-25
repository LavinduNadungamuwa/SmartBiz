import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../../styles/app.css';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className={[
        'grid h-screen bg-[var(--app-bg)]',
        collapsed
          ? '[grid-template-columns:88px_minmax(0,1fr)]'
          : '[grid-template-columns:280px_minmax(0,1fr)]',
      ].join(' ')}
    >
      {/* Desktop sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      {/* Mobile scrim */}
      <div
        className={[
          'fixed inset-0 z-30 bg-[rgba(15,23,42,0.35)] transition-opacity duration-200 md:hidden',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile sidebar drawer */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-40 w-[280px] transition-transform duration-[180ms] ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      {/* Main content column */}
      <div className="min-w-0 h-screen flex flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="page-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
