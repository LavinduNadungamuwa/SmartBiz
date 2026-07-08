import { currency } from '../../utils/formatters';

const PALETTE = [
  '#3b82f6',         // blue-500
  '#10b981',         // emerald-500
  '#f59e0b',         // amber-500
  '#ef4444',         // red-500
  '#8b5cf6',         // Purple
  '#ec4899',         // Pink
  '#06b6d4',         // Cyan
  '#14b8a6',         // Teal
  '#f43f5e',         // Rose
  '#10b981',         // Emerald
  '#84cc16',         // Lime
  '#eab308',         // Yellow
  '#6366f1',         // Indigo
  '#64748b'          // Slate
];

export default function PieChart({ data = [] }) {
  // Calculate total
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  // If total is 0, render empty/placeholder state
  if (total === 0 || data.length === 0) {
    return (
      <div className="flex items-center justify-center gap-[26px] min-h-[240px] max-sm:flex-col max-sm:items-start">
        <div
          className="w-[168px] h-[168px] rounded-full shrink-0"
          style={{
            background: 'conic-gradient(var(--border) 0% 100%)',
            boxShadow: 'inset 0 0 0 26px var(--surface), 0 12px 30px rgba(30,41,59,0.12)',
          }}
        />
        <div className="grid gap-[10px]">
          <span className="flex items-center gap-2 text-muted text-[13px]">
            <i className="w-2.5 h-2.5 rounded-full bg-muted" />
            No expense data recorded
          </span>
        </div>
      </div>
    );
  }

  // Sort data descending by value to make largest slices first
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // Generate color mapping and conic-gradient sectors
  let currentPercent = 0;
  const gradientSlices = [];
  const chartItems = sortedData.map((item, index) => {
    const value = Number(item.value || 0);
    const percentage = (value / total) * 100;
    const color = PALETTE[index % PALETTE.length];
    
    const start = currentPercent;
    const end = currentPercent + percentage;
    currentPercent = end;

    gradientSlices.push(`${color} ${start.toFixed(2)}% ${end.toFixed(2)}%`);

    return {
      ...item,
      value,
      percentage,
      color,
    };
  });

  const backgroundStyle = `conic-gradient(${gradientSlices.join(', ')})`;

  return (
    <div className="flex items-center justify-center gap-[26px] min-h-[240px] max-sm:flex-col max-sm:items-start">
      <div
        className="w-[168px] h-[168px] rounded-full shrink-0"
        style={{
          background: backgroundStyle,
          boxShadow: 'inset 0 0 0 26px var(--surface), 0 12px 30px rgba(30,41,59,0.12)',
        }}
      />
      <div className="grid gap-[10px]">
        {chartItems.map((item) => (
          <span key={item.label || item.name} className="flex items-center gap-2 text-muted text-[13px]">
            <i className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="font-semibold text-text">
              {item.label || item.name}
            </span>
            <span className="text-[12px] text-muted ml-4">
              ({item.percentage.toFixed(1)}% &bull; {currency(item.value)})
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
