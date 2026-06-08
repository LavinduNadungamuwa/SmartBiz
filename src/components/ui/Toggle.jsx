export default function Toggle({ label = '', checked = false, onChange = () => {}, ariaLabel }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
      />
      <i />
    </label>
  );
}
