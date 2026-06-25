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

      {/* Logout confirmation modal — migrated to Tailwind */}
      {showLogoutModal && (
        <div className="modal-overlay fixed inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[6px] flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease-out]" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-container bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-[min(540px,94vw)] max-h-[90vh] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between py-5 px-6 border-b border-[var(--border)]">
              <h3 className="m-0 text-[18px] font-bold text-[var(--text)]">Confirm logout</h3>
              <button className="modal-close bg-transparent border-0 text-[var(--muted)] cursor-pointer flex items-center justify-center p-1 rounded-[6px] transition-colors duration-200 hover:bg-[var(--app-bg)] hover:text-[var(--text)]" onClick={() => setShowLogoutModal(false)} aria-label="Close">
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="modal-body p-6 overflow-y-auto text-[var(--text)]">
              Are you sure you want to logout? You will be redirected to the login page.
            </div>
            <div className="modal-footer flex justify-end gap-3 py-[18px] px-6 bg-[var(--surface-soft)] border-t border-[var(--border)]">
              <Button variant="ghost" onClick={() => setShowLogoutModal(false)}>Cancel</Button>
              <Button onClick={handleLogoutConfirm}>Logout</Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
