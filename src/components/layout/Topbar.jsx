import Icon from '../ui/Icon';
import Toggle from '../ui/Toggle';
import { useEffect, useState } from 'react';
import useAuth from '../../store/useAuth';

export default function Topbar({ onMenuClick }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('sb_theme') || 'dark');
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('sb_theme', theme);
  }, [theme]);

  // Use reactive context user; fall back to localStorage for page-refresh safety
  const user = authUser || readSavedUser();
  const email = user.sub || user.email || 'smartbiz@account.com';
  const initials = email.slice(0, 2).toUpperCase();
  const businessName = user.businessName || 'SmartBiz Business';
  const businessLogo = user.businessLogo || null;

  return (
    <header
      className="flex items-center gap-[18px] h-[72px] px-7 shrink-0
                 bg-surface border-b border-border backdrop-blur-[12px]"
    >
      {/* Mobile hamburger — hidden on md+ */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="relative inline-flex items-center justify-center w-[38px] h-[38px]
                   text-text border border-border bg-surface
                   rounded-[10px] cursor-pointer md:hidden"
      >
        <Icon name="menu" />
      </button>

      {/* Mobile logo — hidden on md+ */}
      <div className="hidden items-center gap-[10px] md:hidden [.mobile-open_&]:flex">
        <span
          className="inline-flex items-center justify-center shrink-0 w-[34px] h-[34px] rounded-[10px]
                     bg-gradient-to-br from-blue to-[#38bdf8] text-white font-extrabold text-[13px]"
        >
          SB
        </span>
        <strong className="text-text text-[15px]">SmartBiz</strong>
      </div>

      {/* Global search — hidden on mobile */}
      <label
        className="hidden md:flex items-center gap-[10px] h-[44px] w-[min(520px,44vw)]
                   px-[14px] text-muted bg-surface
                   border border-border rounded-xl cursor-text"
      >
        <Icon name="search" size={18} />
        <input
          type="search"
          placeholder="Search customers, invoices, products..."
          className="w-full border-0 outline-none bg-transparent text-text"
        />
      </label>

      {/* Right-side actions */}
      <div className="ml-auto flex items-center gap-3">
        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex items-center justify-center w-[38px] h-[38px]
                     text-text border border-border bg-surface
                     rounded-[10px] cursor-pointer"
        >
          <Icon name="bell" />
          {/* Notification dot */}
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full
                       bg-red border-2 border-surface"
          />
        </button>

        {/* Business switcher — hidden on mobile */}
        <button
          type="button"
          className="hidden md:inline-flex items-center gap-2 h-[38px] px-3
                     border border-border rounded-[10px]
                     text-text bg-surface font-semibold cursor-pointer"
        >
          {businessName}
        </button>

        {/* Dark-mode toggle */}
        <Toggle
          checked={theme === 'dark'}
          onChange={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          ariaLabel="Toggle dark mode"
        />

        {/* Avatar */}
        <div
          aria-label="User profile"
          className="inline-flex items-center justify-center w-[38px] h-[38px]
                     rounded-full bg-text text-surface
                     text-[13px] font-bold cursor-pointer overflow-hidden"
        >
          {businessLogo
            ? <img src={businessLogo} alt="Business logo" className="w-full h-full object-cover rounded-[inherit]" />
            : initials}
        </div>
      </div>
    </header>
  );
}

function readSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('sb_user') || '{}');
  } catch {
    return {};
  }
}
