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
        className="text-[13px] font-medium text-muted"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`auth-input w-full bg-surface border rounded-[10px] px-[14px] py-[11px] text-sm text-text caret-text outline-none transition-[border-color,box-shadow,transform] duration-[140ms] placeholder:text-muted focus:border-blue focus:ring-2 focus:ring-blue/20 focus:-translate-y-px${
          error
            ? ' border-[rgba(220,38,38,0.4)]'
            : ' border-border'
        }`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
      {error && (
        <span className="text-[12px] text-red -mt-0.5">{error}</span>
      )}
    </div>
  );
}
