export default function StatusBadge({ children }) {
  const key = String(children).toLowerCase().replaceAll(' ', '-');
  
  const baseClasses = 'inline-flex items-center min-h-[24px] px-[9px] rounded-full text-[12px] font-extrabold';
  
  let colorClasses = 'text-[var(--blue)] bg-[var(--blue-soft)]'; // default
  
  if (['paid', 'in-stock', 'completed'].includes(key)) {
    colorClasses = 'text-[var(--green)] bg-[var(--green-soft)]';
  } else if (['pending', 'low-stock'].includes(key)) {
    colorClasses = 'text-[#b76b00] bg-[var(--orange-soft)]';
  } else if (['overdue', 'out-of-stock', 'refunded'].includes(key)) {
    colorClasses = 'text-[var(--red)] bg-[var(--red-soft)]';
  }

  return <span className={`status-badge ${key} ${baseClasses} ${colorClasses}`}>{children}</span>;
}
