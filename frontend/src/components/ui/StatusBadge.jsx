export default function StatusBadge({ children }) {
  const key = String(children).toLowerCase().replaceAll(' ', '-');
  
  const baseClasses = 'inline-flex items-center min-h-[24px] px-[9px] rounded-full text-[12px] font-extrabold';
  
  let colorClasses = 'text-blue bg-blue-soft'; // default
  
  if (['paid', 'in-stock', 'completed'].includes(key)) {
    colorClasses = 'text-green bg-green-soft';
  } else if (['pending', 'low-stock'].includes(key)) {
    colorClasses = 'text-[#b76b00] bg-orange-soft';
  } else if (['overdue', 'out-of-stock', 'refunded'].includes(key)) {
    colorClasses = 'text-red bg-red-soft';
  }

  return <span className={`status-badge ${key} ${baseClasses} ${colorClasses}`}>{children}</span>;
}
