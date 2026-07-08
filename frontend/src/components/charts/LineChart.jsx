export default function LineChart({ data, labels = [] }) {
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - value;
    return `${x},${y}`;
  }).join(' ');

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
