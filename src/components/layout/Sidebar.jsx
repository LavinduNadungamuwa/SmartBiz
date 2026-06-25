import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import useAuth from '../../store/useAuth';

const navItems = [
  ['Dashboard', '/dashboard', 'dashboard'],
  ['Customers', '/customers', 'customers'],
  ['Products', '/products', 'products'],
  ['Suppliers', '/suppliers', 'suppliers'],
  ['Sales', '/sales', 'sales'],
  ['Invoices', '/invoices', 'invoices'],
  ['Expenses', '/expenses', 'expenses'],
  ['Reports', '/reports', 'reports'],
  ['AI Insights', '/ai-insights', 'ai'],
  ['Settings', '/settings', 'settings'],
];

export default function Sidebar({ collapsed, onToggle }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  return (
    <aside
      className="flex flex-col gap-[22px] h-screen py-[18px] px-4 bg-[var(--surface)] border-r border-[var(--border)]"
    >
      {/* Brand row */}
      <div className={`flex items-center gap-3 min-h-[44px] ${collapsed ? 'justify-center' : ''}`}>
        {/* Logo mark */}
        <span
          className="inline-flex items-center justify-center shrink-0 w-[42px] h-[42px] rounded-xl
                     bg-gradient-to-br from-[var(--blue)] to-[#38bdf8] text-white font-extrabold"
        >
          SB
        </span>

        {/* Brand text — hidden when collapsed */}
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <strong className="text-[var(--text)] text-[15px]">SmartBiz</strong>
            <span className="text-[var(--muted)] text-xs">Business OS</span>
          </div>
        )}

        {/* Toggle button */}
        <button
          type="button"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className={[
            'relative inline-flex items-center justify-center w-[38px] h-[38px]',
            'text-[var(--text)] border border-[var(--border)] bg-[var(--surface)] rounded-[10px] cursor-pointer',
            collapsed ? '' : 'ml-auto',
          ].join(' ')}
        >
          <Icon name="menu" size={18} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-[6px]" aria-label="Main navigation">
        {navItems.map(([label, to, icon]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 min-h-[42px] px-3 rounded-xl',
                'border-0 bg-transparent cursor-pointer text-[14px] font-semibold no-underline',
                'transition-colors duration-150',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'text-[var(--blue)] bg-[var(--blue-soft)]'
                  : 'text-[#475467] hover:text-[var(--blue)] hover:bg-[var(--blue-soft)]',
              ].join(' ')
            }
          >
            <Icon name={icon} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        type="button"
        onClick={() => setShowLogoutModal(true)}
        className={[
          'mt-auto flex items-center gap-3 min-h-[42px] px-3 rounded-xl',
          'border-0 bg-transparent cursor-pointer text-[14px] font-semibold',
          'text-[#b42318] hover:bg-[var(--red-soft)] transition-colors duration-150',
          collapsed ? 'justify-center' : '',
        ].join(' ')}
      >
        <Icon name="logout" />
        {!collapsed && <span>Logout</span>}
      </button>

      {/* Logout confirmation modal — classes kept from app.css (shared with other pages) */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm logout</h3>
              <button className="modal-close" onClick={() => setShowLogoutModal(false)} aria-label="Close">
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="modal-body">
              Are you sure you want to logout? You will be redirected to the login page.
            </div>
            <div className="modal-footer">
              <Button variant="ghost" onClick={() => setShowLogoutModal(false)}>Cancel</Button>
              <Button onClick={handleLogoutConfirm}>Logout</Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
