export default function ChartCard({ title, subtitle, children }) {
  return (
    <section className="card chart-card bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] p-5">
      <div className="card-header flex justify-between gap-4 mb-[18px]">
        <div>
          <h2 className="m-0 text-[17px] font-bold text-[var(--text)]">{title}</h2>
          {subtitle && <p className="m-0 mt-1.5 text-[var(--muted)] leading-[1.55]">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
