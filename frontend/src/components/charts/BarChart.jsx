export default function BarChart({ revenue, expenses, labels }) {
  // Compute a shared max so both series are on the same scale
  const allValues = [...(revenue || []), ...(expenses || [])];
  const max = Math.max(...allValues, 1);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-1.5 h-[210px] pt-2">
        {(revenue || []).map((rev, index) => {
          const exp = expenses?.[index] ?? 0;
          const revH = Math.max(4, Math.round((rev / max) * 96));
          const expH = Math.max(4, Math.round((exp / max) * 96));
          return (
            <div className="flex flex-col items-center justify-end gap-1 flex-1 min-w-0 h-full" key={index}>
              <div className="flex items-end justify-center gap-[3px] flex-1 w-full border-b border-border">
                <span
                  className="w-2 min-h-1 rounded-t-[4px] transition-[height] duration-[400ms] ease-in-out bg-blue"
                  style={{ height: `${revH}%` }}
                  title={`Revenue: ${rev}`}
                />
                <span
                  className="w-2 min-h-1 rounded-t-[4px] transition-[height] duration-[400ms] ease-in-out bg-red opacity-70"
                  style={{ height: `${expH}%` }}
                  title={`Expenses: ${exp}`}
                />
              </div>
              {labels?.[index] && (
                <span className="text-[10px] text-muted text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full pt-1">
                  {labels[index]}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted px-0.5">
        <span className="flex items-center">
          <span className="inline-block w-2.5 h-2.5 rounded-full mr-1 bg-blue" />
          Revenue
        </span>
        <span className="flex items-center">
          <span className="inline-block w-2.5 h-2.5 rounded-full mr-1 bg-red opacity-70" />
          Expenses
        </span>
      </div>
    </div>
  );
}
