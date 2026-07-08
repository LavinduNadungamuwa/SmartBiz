import Icon from './Icon';

export default function StatCard({ label, value, growth, trend = 'up', icon }) {
  const trendClasses = trend === 'up' 
    ? 'text-green bg-green-soft' 
    : 'text-red bg-red-soft';

  return (
    <article className="stat-card relative grid grid-cols-[auto_minmax(0,1fr)] gap-3.5 p-[18px] min-h-[118px] bg-surface border border-border rounded-radius shadow-shadow max-[560px]:min-h-[108px]">
      <div className="stat-icon inline-flex items-center justify-center w-[42px] h-[42px] text-blue bg-blue-soft rounded-[12px]">
        <Icon name={icon} />
      </div>
      <div>
        <span className="stat-label block text-muted text-[13px] mb-1.5">{label}</span>
        <strong className="stat-value block text-[24px] leading-[1.15]">{value}</strong>
      </div>
      <span className={`trend absolute right-4 bottom-4 text-[12px] font-extrabold p-[4px_8px] rounded-full ${trendClasses}`}>{growth}</span>
    </article>
  );
}
