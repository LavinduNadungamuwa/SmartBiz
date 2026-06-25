export default function PrimaryButton({ loading = false, loadingText, children }) {
  return (
    <button
      type="submit"
      className="w-full px-6 py-[13px] mt-1.5 flex items-center justify-center gap-2 text-white text-sm font-bold rounded-[10px] border border-[rgba(37,99,235,0.08)] cursor-pointer transition-[transform,box-shadow,opacity] duration-[120ms] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:-translate-y-[3px] hover:not-disabled:shadow-[0_18px_60px_rgba(37,99,235,0.08),0_6px_20px_rgba(13,37,95,0.08)]"
      style={{
        background: 'linear-gradient(90deg, var(--blue), var(--blue-600))',
      }}
      disabled={loading}
    >
      {loading ? (
        <>
          <span
            className="w-4 h-4 rounded-full border-2 border-[rgba(2,6,8,0.3)] border-t-[var(--blue-600)] shrink-0"
            style={{ animation: 'spin 0.7s linear infinite' }}
          />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
