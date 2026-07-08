export default function AreaChart({ labels = [], values = [], data = [] }) {
  const chartValues = values.length ? values : data;
  if (!chartValues.length) return null;

  const n = Math.max(chartValues.length, 1);
  const max = Math.max(...chartValues, 1);

  // Scale value to [6, 96] range to match LineChart scaling
  const scaledValues = chartValues.map((v) => Math.max(6, Math.round((v / max) * 96)));

  const points = scaledValues.map((value, index) => {
    const x = n === 1 ? 50 : (index / (n - 1)) * 100;
    const y = 100 - value;
    return `${x},${y}`;
  }).join(' ');

  const polygonPoints = `0,100 ${points} 100,100`;

  return (
    <div className="h-[250px]">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-[210px] overflow-visible"
        style={{
          background: 'linear-gradient(var(--border) 1px, transparent 1px) 0 0 / 100% 25%',
        }}
      >
        <polygon points={polygonPoints} style={{ fill: 'rgba(37,99,235,0.14)' }} />
        <polyline
          points={points}
          style={{ fill: 'none', stroke: 'var(--blue)', strokeWidth: 3, vectorEffect: 'non-scaling-stroke' }}
        />
      </svg>
      <div className="flex justify-between text-muted text-xs mt-2.5">
        {(labels.length ? labels : ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov']).map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

