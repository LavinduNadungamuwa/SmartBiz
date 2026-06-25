export default function PasswordField({
  name = 'password',
  label = 'Password',
  placeholder = '',
  value,
  onChange,
  error = '',
  autoComplete = 'current-password',
  showPassword,
  onToggleShow,
  half = false,
}) {
  return (
    <div className={`mb-[14px] flex flex-col gap-[7px]${half ? ' flex-1 min-w-0' : ''}`}>
      <label
        className="text-[13px] font-medium text-[var(--muted)]"
        htmlFor={name}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          className={`auth-input w-full bg-[var(--surface)] border rounded-[10px] px-[14px] py-[11px] pr-11 text-sm text-[var(--text)] caret-[var(--text)] outline-none transition-[border-color,box-shadow,transform] duration-[140ms] placeholder:text-[var(--muted)] focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] focus:-translate-y-px${
            error
              ? ' border-[rgba(220,38,38,0.4)]'
              : ' border-[var(--border)]'
          }`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer text-[var(--muted)] flex p-1 hover:text-[var(--blue)] transition-colors duration-[140ms]"
          onClick={onToggleShow}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <span className="text-[12px] text-[#ffbebe] -mt-0.5">{error}</span>
      )}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
