export default function Toggle({ label, checked = false, onChange = () => {}, ariaLabel }) {
  const containerClasses = label 
    ? "toggle-row grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 relative"
    : "toggle-row grid grid-cols-[auto] items-center gap-3 relative";

  return (
    <label className={containerClasses}>
      {label ? <span className="text-muted text-[13px] font-bold">{label}</span> : null}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
        className="absolute opacity-0 peer"
      />
      <i className="relative w-[46px] h-[26px] rounded-full bg-border cursor-pointer transition-colors duration-200 block
                  after:content-[''] after:absolute after:w-5 after:h-5 after:left-[3px] after:top-[3px] after:rounded-full after:bg-surface after:shadow-[0_2px_8px_rgba(30,41,59,0.2)] after:transition-transform after:duration-180 peer-checked:after:translate-x-5
                  before:content-['☀'] before:absolute before:left-1.5 before:top-[3px] before:text-[12px] before:text-[#f6b73b]
                  peer-checked:before:content-['☾'] peer-checked:before:left-auto peer-checked:before:right-1.5 peer-checked:before:text-[#cbd5e1] peer-checked:bg-blue" />
    </label>
  );
}
