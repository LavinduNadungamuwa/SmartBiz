import Icon from '../ui/Icon';
import Toggle from '../ui/Toggle';
import { useEffect, useState } from 'react';

export default function Topbar({ onMenuClick }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('sb_theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('sb_theme', theme);
  }, [theme]);

  const user = readSavedUser();
  const email = user.sub || user.email || 'smartbiz@account.com';
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" type="button" onClick={onMenuClick} aria-label="Open navigation">
        <Icon name="menu" />
      </button>
      <div className="topbar-logo">
        <span className="logo-mark small">SB</span>
        <strong>SmartBiz</strong>
      </div>
      <label className="global-search">
        <Icon name="search" size={18} />
        <input type="search" placeholder="Search customers, invoices, products..." />
      </label>
      <div className="topbar-actions">
        <button className="icon-button notification-button" type="button" aria-label="Notifications">
          <Icon name="bell" />
          <span className="notification-dot" />
        </button>
        <button className="business-switcher" type="button">
          {user.businessId ? `Business #${user.businessId}` : 'SmartBiz Business'}
          <span>v</span>
        </button>
        <Toggle
          label={theme === 'dark' ? 'Dark mode' : 'Light mode'}
          checked={theme === 'dark'}
          onChange={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
          ariaLabel="Toggle dark mode"
        />
        <div className="avatar" aria-label="User profile">
          {initials}
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
