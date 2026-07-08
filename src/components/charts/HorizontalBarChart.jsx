export default function HorizontalBarChart({ data }) {
  return (
    <div className="flex flex-col gap-[15px]">
      {data.map((item) => (
        <div
          key={item.label}
          className="grid items-center gap-3 text-[13px]"
          style={{ gridTemplateColumns: 'minmax(120px, 1fr) 2fr 44px' }}
        >
          <span>{item.label}</span>
          <div className="h-[10px] bg-border/30 rounded-full overflow-hidden">
            <i
              className="block h-full rounded-[inherit] bg-gradient-to-r from-blue to-[#06b6d4]"
              style={{ width: `${item.value}%` }}
            />
          </div>
          <strong>{item.value}%</strong>
        </div>
      ))}
    </div>
  );
}
