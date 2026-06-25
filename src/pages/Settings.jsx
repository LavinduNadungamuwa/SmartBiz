import { useState, useRef } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { useBusinessData } from '../api/resources';
import { number } from '../utils/formatters';
import useAuth from '../store/useAuth';

// ── helpers ────────────────────────────────────────────────────────────────

function readSavedUser() {
  try { return JSON.parse(localStorage.getItem('sb_user') || '{}'); } catch { return {}; }
}

function initials(name) {
  if (!name) return 'U';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── sub-components ─────────────────────────────────────────────────────────

function SectionCard({ icon, title, description, children, actions }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] overflow-hidden transition-shadow duration-200 hover:shadow-[0_20px_48px_rgba(30,41,59,0.11)]">
      <div className="flex items-start gap-3.5 p-[22px_24px_18px] border-b border-[var(--border)] bg-[var(--surface-soft)] max-[560px]:p-[16px_16px_14px]">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-[12px] bg-[var(--blue-soft)] text-[var(--blue)] shrink-0">{icon}</div>
        <div>
          <h2 className="m-0 mb-[2px] text-[16px] font-bold text-[var(--text)]">{title}</h2>
          {description && <p className="m-0 text-[13px] text-[var(--muted)]">{description}</p>}
        </div>
        {actions && <div className="ml-auto flex gap-2 shrink-0">{actions}</div>}
      </div>
      <div className="p-6 grid gap-5 max-[560px]:p-4">{children}</div>
    </div>
  );
}

function FormField({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-[var(--text)]">{label}</label>
      {children}
      {hint && <span className="text-[12px] text-[var(--muted)] mt-0.5">{hint}</span>}
    </div>
  );
}

function SInput({ value, onChange, placeholder, type = 'text', readOnly }) {
  return (
    <input
      className="h-[42px] px-[13px] border-[1.5px] border-[var(--border)] rounded-[10px] bg-[var(--surface)] text-[var(--text)] font-inherit text-[14px] outline-none transition-all duration-[180ms] w-full box-border focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
    />
  );
}

function SSelect({ value, onChange, options }) {
  return (
    <select className="h-[42px] px-[13px] border-[1.5px] border-[var(--border)] rounded-[10px] bg-[var(--surface)] text-[var(--text)] font-inherit text-[14px] outline-none transition-all duration-[180ms] w-full box-border focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] cursor-pointer appearance-auto" value={value} onChange={onChange}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function SettingsToggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-[var(--border)] last:border-b-0 transition-colors duration-150">
      <div className="grid gap-[2px] min-w-0">
        <span className="text-[14px] font-semibold text-[var(--text)]">{label}</span>
        {description && <span className="text-[12px] text-[var(--muted)] leading-[1.4]">{description}</span>}
      </div>
      <button
        className={`relative w-12 h-[27px] rounded-full border-0 cursor-pointer shrink-0 transition-colors duration-200 p-0 flex items-center ${checked ? 'bg-[var(--blue)]' : 'bg-[var(--border)]'}`}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span className={`absolute top-[3px] left-[3px] w-[21px] h-[21px] rounded-full bg-white shadow-[0_2px_6px_rgba(30,41,59,0.22)] transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] block ${checked ? 'translate-x-[21px]' : ''}`} />
      </button>
    </div>
  );
}

function StatPill({ label, value, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-[var(--blue-soft)] border-[rgba(37,99,235,0.12)] text-[var(--blue)]',
    green: 'bg-[var(--green-soft)] border-[rgba(22,163,74,0.12)] text-[var(--green)]',
    purple: 'bg-[rgba(139,92,246,0.07)] border-[rgba(139,92,246,0.12)] text-[#7c3aed] dark:text-[#a78bfa] dark:bg-[rgba(139,92,246,0.1)]',
    orange: 'bg-[var(--orange-soft)] border-[rgba(245,158,11,0.12)] text-[var(--orange)]',
  }[color] || '';

  return (
    <div className={`grid gap-1.5 p-[14px_16px] rounded-[14px] border-[1.5px] ${colorClasses}`}>
      <span className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-75">{label}</span>
      <strong className="text-[22px] font-extrabold">{value}</strong>
    </div>
  );
}

function AiStatusDot({ connected }) {
  return (
    <span className={`inline-flex items-center gap-[7px] text-[13px] font-bold ${connected ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
      {connected ? (
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--green)] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--green)]"></span>
        </span>
      ) : (
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--red)] shrink-0" />
      )}
      {connected ? 'Connected' : 'Disconnected'}
    </span>
  );
}

// ── Main Settings page ─────────────────────────────────────────────────────

export default function Settings() {
  const { data } = useBusinessData();
  const { user: authUser, updateUser } = useAuth();
  const user = authUser || readSavedUser();
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // ── Business profile state
  const [business, setBusiness] = useState({
    logo: user.businessLogo || null,
    name: user.businessName || 'SmartBiz Solutions',
    email: user.email || user.sub || 'admin@smartbiz.lk',
    phone: '+94 77 123 4567',
    address: '42 Galle Road, Colombo 03, Sri Lanka',
    regNumber: 'PV 00127843',
  });

  // ── Account state
  const [profilePic, setProfilePic] = useState(null);

  // ── Notification toggles
  const [notifs, setNotifs] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    invoiceDueReminders: true,
    monthlyReports: false,
    customerActivity: false,
    aiInsights: true,
  });

  // ── Preferences
  const [prefs, setPrefs] = useState({
    currency: 'LKR',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Colombo',
    darkMode: document.documentElement.classList.contains('dark'),
    compactView: false,
  });

  // ── AI Settings
  const [aiStatus, setAiStatus] = useState({ connected: true, testing: false });
  const [monthlyUsed] = useState(287);
  const [monthlyLimit] = useState(500);

  // ── Handlers
  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const logoDataUrl = ev.target.result;
      setBusiness(b => ({ ...b, logo: logoDataUrl }));
      updateUser({ businessLogo: logoDataUrl });
    };
    reader.readAsDataURL(file);
  }

  function handleProfilePicChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePic(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handlePrefChange(key, value) {
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', value);
    }
    setPrefs(p => ({ ...p, [key]: value }));
  }

  async function handleTestConnection() {
    setAiStatus(s => ({ ...s, testing: true }));
    await new Promise(r => setTimeout(r, 1800));
    setAiStatus({ connected: true, testing: false });
  }

  function handleSaveAll() {
    // persist prefs to localStorage for persistence
    localStorage.setItem('sb_prefs', JSON.stringify(prefs));
    localStorage.setItem('sb_notifs', JSON.stringify(notifs));
    // toast-style feedback via CSS class momentarily
    const btn = document.getElementById('save-all-btn');
    if (btn) {
      btn.textContent = '✓ Saved!';
      btn.classList.add('saved');
      setTimeout(() => { btn.textContent = 'Save All Changes'; btn.classList.remove('saved'); }, 2000);
    }
  }

  const userName = user.fullName || user.sub || 'Lavindu Nadungamuwa';
  const userRole = user.role || 'OWNER';
  const usagePct = Math.round((monthlyUsed / monthlyLimit) * 100);

  return (
    <div className="flex flex-col gap-[22px] max-w-[1600px] mx-auto px-[15px] pb-[100px]">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Manage your business profile, account, notifications, and preferences."
      />

      <div className="grid gap-5">

        {/* ── 1. BUSINESS PROFILE ─────────────────────────────────────── */}
        <SectionCard
          icon={<BriefcaseIcon />}
          title="Business Profile"
          description="Your public business information and branding"
        >
          <div className="flex items-start gap-5 p-4 border-[1.5px] border-dashed border-[var(--border)] rounded-[14px] bg-[var(--surface-soft)] cursor-pointer transition-all duration-[180ms] hover:border-[var(--blue)] hover:bg-[var(--blue-soft)] max-[860px]:flex-col">
            <div className="w-20 h-20 rounded-[14px] border-[1.5px] border-[var(--border)] bg-[var(--surface)] flex items-center justify-center shrink-0 overflow-hidden cursor-pointer transition-all duration-[180ms] hover:border-[var(--blue)]" onClick={() => logoInputRef.current?.click()}>
              {business.logo
                ? <img src={business.logo} alt="Business logo" className="w-full h-full object-cover" />
                : <div className="flex flex-col items-center gap-[5px] text-[var(--muted)] text-[11px] text-center"><CameraIcon /><span>Upload Logo</span></div>}
            </div>
            <div className="grid gap-1 min-w-0">
              <p className="m-0 text-[14px] font-semibold text-[var(--text)]">Click to upload your business logo</p>
              <p className="m-0 text-[12px] text-[var(--muted)]">PNG, JPG or SVG · Max 2 MB · Recommended 200×200 px</p>
              <button type="button" className="inline-flex items-center gap-[7px] h-[38px] px-4 rounded-[10px] border-[1.5px] border-[var(--border)] font-inherit text-[14px] font-semibold cursor-pointer transition-all duration-150 active:scale-[0.98] whitespace-nowrap bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-soft)]" onClick={() => logoInputRef.current?.click()}>
                <UploadIcon /> Change Logo
              </button>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
          </div>

          <h3 className="m-[4px_0_16px] text-[13px] font-bold text-[var(--muted)] uppercase tracking-[0.07em] pb-2.5 border-b border-[var(--border)]">Edit Business Details</h3>
          <div className="grid grid-cols-2 gap-4 max-[1180px]:grid-cols-1">
            <FormField label="Business Name">
              <SInput value={business.name} onChange={e => setBusiness(b => ({ ...b, name: e.target.value }))} placeholder="Your Business Name" />
            </FormField>
            <FormField label="Business Email">
              <SInput value={business.email} onChange={e => setBusiness(b => ({ ...b, email: e.target.value }))} type="email" placeholder="email@business.com" />
            </FormField>
            <FormField label="Phone Number">
              <SInput value={business.phone} onChange={e => setBusiness(b => ({ ...b, phone: e.target.value }))} placeholder="+94 77 000 0000" />
            </FormField>
            <FormField label="Business Registration Number">
              <SInput value={business.regNumber} onChange={e => setBusiness(b => ({ ...b, regNumber: e.target.value }))} placeholder="PV 00000000" />
            </FormField>
          </div>
          <FormField label="Business Address">
            <SInput value={business.address} onChange={e => setBusiness(b => ({ ...b, address: e.target.value }))} placeholder="Street, City, Country" />
          </FormField>

          <div className="flex gap-2.5 flex-wrap pt-1">
            <button
              type="button"
              className="inline-flex items-center gap-[7px] h-[38px] px-4 rounded-[10px] border-[1.5px] border-transparent font-inherit text-[14px] font-semibold cursor-pointer transition-all duration-150 active:scale-[0.98] whitespace-nowrap bg-[var(--blue)] text-white shadow-[0_6px_18px_rgba(37,99,235,0.25)] hover:bg-[var(--blue-600)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.3)] [&.saved]:bg-[var(--green)] [&.saved]:border-[var(--green)] [&.saved]:shadow-[0_6px_18px_rgba(22,163,74,0.25)]"
              onClick={() => {
                updateUser({ businessName: business.name });
                const btn = document.getElementById('biz-save-btn');
                if (btn) {
                  btn.textContent = '✓ Saved!';
                  btn.classList.add('saved');
                  setTimeout(() => { btn.textContent = 'Save Changes'; btn.classList.remove('saved'); }, 2000);
                }
              }}
              id="biz-save-btn"
            >
              <SaveIcon /> Save Changes
            </button>
          </div>
        </SectionCard>

        {/* ── 2. ACCOUNT SETTINGS ─────────────────────────────────────── */}
        <SectionCard
          icon={<UserIcon />}
          title="Account Settings"
          description="Your personal account information and security"
        >
          <div className="flex items-start gap-5 max-[860px]:flex-col">
            <div className="relative shrink-0">
              <div className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center cursor-pointer overflow-hidden border-3 border-[var(--surface)] shadow-[0_0_0_2px_var(--blue)] hover:shadow-[0_0_0_3px_var(--blue)] transition-shadow duration-200" onClick={() => fileInputRef.current?.click()}>
                {profilePic
                  ? <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="text-[22px] font-extrabold text-white">{initials(userName)}</span>}
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity duration-180 rounded-full"><CameraIcon /></div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePicChange} />
            </div>
            <div className="grid gap-1.5 min-w-0">
              <div className="flex items-center gap-2.5">
                <strong className="text-[18px] font-bold text-[var(--text)]">{userName}</strong>
                <span className={`role-badge role-${userRole.toLowerCase()}`}>{userRole}</span>
              </div>
              <span className="text-[14px] text-[var(--muted)]">{user.email || user.sub || 'user@smartbiz.lk'}</span>
              <div className="flex flex-col gap-1 mt-1">
                <span><ClockIcon /> Last login: <b>Today, 09:40 AM</b></span>
                <span><CalendarIcon /> Member since: <b>Jan 15, 2025</b></span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 flex-wrap pt-1">
            <button type="button" className="inline-flex items-center gap-[7px] h-[38px] px-4 rounded-[10px] border-[1.5px] border-[var(--border)] font-inherit text-[14px] font-semibold cursor-pointer transition-all duration-150 active:scale-[0.98] whitespace-nowrap bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-soft)]">
              <KeyIcon /> Change Password
            </button>
            <button type="button" className="inline-flex items-center gap-[7px] h-[38px] px-4 rounded-[10px] border-[1.5px] border-[rgba(37,99,235,0.15)] font-inherit text-[14px] font-semibold cursor-pointer transition-all duration-150 active:scale-[0.98] whitespace-nowrap bg-[var(--blue-soft)] text-[var(--blue)] hover:bg-[rgba(37,99,235,0.12)]">
              <EditIcon /> Edit Profile
            </button>
          </div>
        </SectionCard>

        {/* ── 3. NOTIFICATION SETTINGS ────────────────────────────────── */}
        <SectionCard
          icon={<BellIcon />}
          title="Notifications"
          description="Choose what you want to be notified about"
        >
          <div className="grid gap-0">
            <SettingsToggle
              checked={notifs.emailNotifications}
              onChange={v => setNotifs(n => ({ ...n, emailNotifications: v }))}
              label="Email Notifications"
              description="Receive important updates and alerts via email"
            />
            <SettingsToggle
              checked={notifs.lowStockAlerts}
              onChange={v => setNotifs(n => ({ ...n, lowStockAlerts: v }))}
              label="Low Stock Alerts"
              description="Get notified when product inventory falls below threshold"
            />
            <SettingsToggle
              checked={notifs.invoiceDueReminders}
              onChange={v => setNotifs(n => ({ ...n, invoiceDueReminders: v }))}
              label="Invoice Due Reminders"
              description="Automatic reminders for upcoming and overdue invoices"
            />
            <SettingsToggle
              checked={notifs.monthlyReports}
              onChange={v => setNotifs(n => ({ ...n, monthlyReports: v }))}
              label="Monthly Business Reports"
              description="Receive a summary of your monthly business performance"
            />
            <SettingsToggle
              checked={notifs.customerActivity}
              onChange={v => setNotifs(n => ({ ...n, customerActivity: v }))}
              label="Customer Activity Alerts"
              description="Notifications about new customers and significant activity"
            />
            <SettingsToggle
              checked={notifs.aiInsights}
              onChange={v => setNotifs(n => ({ ...n, aiInsights: v }))}
              label="AI Insights Notifications"
              description="Get proactive AI-generated insights and recommendations"
            />
          </div>
        </SectionCard>

        {/* ── 4. SYSTEM PREFERENCES ───────────────────────────────────── */}
        <SectionCard
          icon={<SlidersIcon />}
          title="Preferences"
          description="Customize how SmartBiz looks and behaves"
        >
          <div className="grid grid-cols-2 gap-4 max-[1180px]:grid-cols-1">
            <FormField label="Currency">
              <SSelect
                value={prefs.currency}
                onChange={e => handlePrefChange('currency', e.target.value)}
                options={[
                  { value: 'LKR', label: '🇱🇰 LKR – Sri Lankan Rupee' },
                  { value: 'USD', label: '🇺🇸 USD – US Dollar' },
                  { value: 'EUR', label: '🇪🇺 EUR – Euro' },
                  { value: 'GBP', label: '🇬🇧 GBP – British Pound' },
                  { value: 'INR', label: '🇮🇳 INR – Indian Rupee' },
                  { value: 'AUD', label: '🇦🇺 AUD – Australian Dollar' },
                ]}
              />
            </FormField>
            <FormField label="Language">
              <SSelect
                value={prefs.language}
                onChange={e => handlePrefChange('language', e.target.value)}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'si', label: 'සිංහල (Sinhala)' },
                  { value: 'ta', label: 'தமிழ் (Tamil)' },
                ]}
              />
            </FormField>
            <FormField label="Date Format">
              <SSelect
                value={prefs.dateFormat}
                onChange={e => handlePrefChange('dateFormat', e.target.value)}
                options={[
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
                  { value: 'D MMM YYYY', label: 'D MMM YYYY' },
                ]}
              />
            </FormField>
            <FormField label="Time Zone">
              <SSelect
                value={prefs.timezone}
                onChange={e => handlePrefChange('timezone', e.target.value)}
                options={[
                  { value: 'Asia/Colombo', label: 'Asia/Colombo (IST +05:30)' },
                  { value: 'UTC', label: 'UTC +00:00' },
                  { value: 'America/New_York', label: 'US Eastern (UTC-5)' },
                  { value: 'Europe/London', label: 'London (UTC+0/+1)' },
                  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)' },
                  { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' },
                ]}
              />
            </FormField>
          </div>

          <div className="grid gap-0 border-t border-[var(--border)] pt-1">
            <SettingsToggle
              checked={prefs.darkMode}
              onChange={v => handlePrefChange('darkMode', v)}
              label="Dark Mode"
              description="Switch between light and dark interface themes"
            />
            <SettingsToggle
              checked={prefs.compactView}
              onChange={v => handlePrefChange('compactView', v)}
              label="Compact View"
              description="Reduce spacing for a denser information layout"
            />
          </div>
        </SectionCard>

        {/* ── 5. AI SETTINGS ──────────────────────────────────────────── */}
        <SectionCard
          icon={<SparkleIcon />}
          title="AI Insights Configuration"
          description="Manage your AI assistant connection and usage"
        >
          <div className="grid grid-cols-[1fr_1.5fr] gap-6 p-5 border-[1.5px] border-[var(--border)] rounded-[14px] bg-[var(--surface-soft)] max-[1180px]:grid-cols-1">
            <div className="grid gap-3.5 content-start">
              <div className="flex flex-col gap-1.25">
                <span className="text-[12px] font-bold text-[var(--muted)] uppercase tracking-[0.06em]">Status</span>
                <AiStatusDot connected={aiStatus.connected} />
              </div>
              <div className="flex flex-col gap-1.25">
                <span className="text-[12px] font-bold text-[var(--muted)] uppercase tracking-[0.06em]">Current Model</span>
                <span className="inline-flex items-center h-[26px] px-2.5 rounded-[8px] bg-[var(--blue-soft)] text-[var(--blue)] text-[13px] font-bold border border-[rgba(37,99,235,0.15)] w-fit">GPT-4o-mini</span>
              </div>
            </div>
            <div className="grid gap-2 content-start">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-bold text-[var(--muted)] uppercase tracking-[0.06em]">Monthly Requests Used</span>
                <span className="text-[13px] text-[var(--muted)]"><strong className="text-[var(--text)] text-[15px] font-bold">{monthlyUsed}</strong> / {monthlyLimit}</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)]" style={{ width: `${usagePct}%`, background: usagePct > 80 ? 'var(--orange)' : 'var(--blue)' }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
                  <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: usagePct > 80 ? 'var(--orange)' : 'var(--green)' }} />
                  {monthlyLimit - monthlyUsed} requests remaining
                </span>
                <span className="text-[12px] text-[var(--muted)] font-semibold">{usagePct}% used</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 flex-wrap pt-1">
            <button
              type="button"
              className={`inline-flex items-center gap-[7px] h-[38px] px-4 rounded-[10px] border-[1.5px] border-[var(--border)] font-inherit text-[14px] font-semibold cursor-pointer transition-all duration-150 active:scale-[0.98] whitespace-nowrap bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-soft)] ${aiStatus.testing ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={handleTestConnection}
              disabled={aiStatus.testing}
            >
              {aiStatus.testing ? <SpinnerIcon /> : <ZapIcon />}
              {aiStatus.testing ? 'Testing…' : 'Test Connection'}
            </button>
            <button type="button" className="inline-flex items-center gap-[7px] h-[38px] px-4 rounded-[10px] border-[1.5px] border-[var(--border)] font-inherit text-[14px] font-semibold cursor-pointer transition-all duration-150 active:scale-[0.98] whitespace-nowrap bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-soft)]" onClick={() => setAiStatus(s => ({ ...s }))}>
              <RefreshIcon /> Refresh Status
            </button>
          </div>
        </SectionCard>

        {/* ── 6. SUBSCRIPTION & USAGE ─────────────────────────────────── */}
        <SectionCard
          icon={<CrownIcon />}
          title="Subscription & Usage"
          description="Your current plan and resource consumption"
        >
          <div className="flex items-center justify-between p-[18px_22px] rounded-[14px] bg-gradient-to-br from-[var(--blue)] to-[#0ea5e9] text-white max-[860px]:flex-col max-[860px]:items-start max-[860px]:gap-2.5">
            <div className="grid gap-1">
              <span className="text-[11px] font-extrabold tracking-[0.1em] opacity-85">PRO PLAN</span>
              <span className="text-[13px] opacity-70">Billed monthly</span>
            </div>
            <div className="flex items-baseline gap-1">
              <strong className="text-[28px] font-extrabold">LKR 2,990</strong>
              <span className="text-[14px] opacity-75">/month</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2">
            <StatPill label="Total Products" value={number(data.products?.length ?? 48)} color="blue" />
            <StatPill label="Total Customers" value={number(data.customers?.length ?? 134)} color="green" />
            <StatPill label="Total Invoices" value={number(data.invoices?.length ?? 312)} color="purple" />
            <StatPill label="Storage Used" value="1.4 GB" color="orange" />
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-bold text-[var(--muted)] uppercase tracking-[0.06em]">Storage Usage</span>
              <span className="text-[12px] text-[var(--muted)] font-semibold">1.4 GB of 5 GB</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--blue)] to-[#06b6d4] transition-all duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)]" style={{ width: '28%' }} />
            </div>
          </div>

          <div className="flex gap-2.5 flex-wrap pt-1">
            <button type="button" className="inline-flex items-center gap-[7px] h-[38px] px-4 rounded-[10px] border-[1.5px] border-transparent font-inherit text-[14px] font-semibold cursor-pointer transition-all duration-150 active:scale-[0.98] whitespace-nowrap bg-[var(--blue)] text-white shadow-[0_6px_18px_rgba(37,99,235,0.25)] hover:bg-[var(--blue-600)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.3)]">
              <CrownIcon /> Upgrade Plan
            </button>
            <button type="button" className="inline-flex items-center gap-[7px] h-[38px] px-4 rounded-[10px] border-[1.5px] border-[var(--border)] font-inherit text-[14px] font-semibold cursor-pointer transition-all duration-150 active:scale-[0.98] whitespace-nowrap bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-soft)]">
              <ReceiptIcon /> View Billing History
            </button>
          </div>
        </SectionCard>

      </div>

      {/* ── STICKY FOOTER ───────────────────────────────────────────────── */}
      <div className="sticky bottom-0 z-20 bg-[var(--surface)] border-t border-[var(--border)] backdrop-blur-md shadow-[0_-6px_24px_rgba(30,41,59,0.08)] mx-[-28px] mb-[-28px] max-[860px]:mx-[-20px] max-[860px]:mb-[-20px] max-[560px]:mx-[-16px] max-[560px]:mb-[-16px]">
        <div className="flex items-center justify-end gap-3 p-[14px_28px] max-w-[1600px] mx-auto">
          <button type="button" className="inline-flex items-center gap-[7px] px-[22px] rounded-[10px] border-[1.5px] border-[var(--border)] font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98] whitespace-nowrap bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-soft)] h-[44px] text-[15px]">
            Cancel
          </button>
          <button
            id="save-all-btn"
            type="button"
            className="inline-flex items-center gap-[7px] px-[22px] rounded-[10px] border-[1.5px] border-transparent font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98] whitespace-nowrap bg-[var(--blue)] text-white shadow-[0_6px_18px_rgba(37,99,235,0.25)] hover:bg-[var(--blue-600)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.3)] h-[44px] text-[15px] [&.saved]:bg-[var(--green)] [&.saved]:border-[var(--green)] [&.saved]:shadow-[0_6px_18px_rgba(22,163,74,0.25)]"
            onClick={handleSaveAll}
          >
            <SaveIcon /> Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Inline SVG icons (no extra dependency) ─────────────────────────────────

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M2 20h20" />
      <path d="M5 20V8l7-5 7 5v12" />
      <path d="M12 3v5" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="16" height="16" style={{ animation: 'spin 0.7s linear infinite' }}>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}
