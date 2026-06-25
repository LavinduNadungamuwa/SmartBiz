export default function FormField({
  name,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  autoComplete = name,
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
      <input
        id={name}
        name={name}
        type={type}
        className={`auth-input w-full bg-[var(--surface)] border rounded-[10px] px-[14px] py-[11px] text-sm text-[var(--text)] caret-[var(--text)] outline-none transition-[border-color,box-shadow,transform] duration-[140ms] placeholder:text-[var(--muted)] focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] focus:-translate-y-px${
          error
            ? ' border-[rgba(220,38,38,0.4)]'
            : ' border-[var(--border)]'
        }`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
      {error && (
        <span className="text-[12px] text-[#ffbebe] -mt-0.5">{error}</span>
      )}
    </div>
  );
}
