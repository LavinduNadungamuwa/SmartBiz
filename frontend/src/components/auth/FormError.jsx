export default function FormError({ message }) {
  if (!message) return null;

  return (
    <div
      className="flex items-center gap-2.5 bg-red-50 dark:bg-rose-950/20 border border-red-200 dark:border-rose-900/40 rounded-[8px] px-3 py-2.5 text-red-600 dark:text-rose-400 text-[13px] mb-[18px]"
      role="alert"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {message}
    </div>
  );
}
