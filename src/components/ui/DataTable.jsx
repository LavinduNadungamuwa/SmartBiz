import Button from './Button';
import StatusBadge from './StatusBadge';

export default function DataTable({ columns, rows, actions = false, onEdit, onDelete, onView, onPrint, onDownloadPDF }) {
  return (
    <div className="table-wrap w-full overflow-x-auto">
      <table className="data-table w-full border-collapse min-w-[760px]">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} className="p-[14px_12px] border-b border-border text-left text-[12px] font-semibold text-muted uppercase tracking-[0.04em] bg-surface-soft">{column}</th>
            ))}
            {actions && <th className="p-[14px_12px] border-b border-border text-left text-[12px] font-semibold text-muted uppercase tracking-[0.04em] bg-surface-soft">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const isLastRow = index === rows.length - 1;
            const cellBorderClass = isLastRow ? 'border-b-0' : 'border-b border-border';
            return (
              <tr key={`${row.join('-')}-${index}`}>
                {row.map((cell, indexCell) => (
                  <td key={`${cell}-${indexCell}`} className={`p-[14px_12px] text-left text-[14px] text-text ${cellBorderClass}`}>
                    {isStatusCell(cell) ? <StatusBadge>{cell}</StatusBadge> : cell}
                  </td>
                ))}
                {actions && (
                  <td className={`p-[14px_12px] text-left text-[14px] text-text ${cellBorderClass}`}>
                    <div className="row-actions flex items-center gap-2.5 flex-wrap
                                    [&_.app-button]:min-w-[36px] [&_.app-button]:min-h-[36px] [&_.app-button]:px-2 [&_.app-button]:py-1.5 [&_.app-button]:rounded-lg
                                    [&_.app-button]:bg-transparent [&_.app-button]:border-transparent [&_.app-button]:shadow-none [&_.app-button]:translate-y-0
                                    [&_.app-button]:transition-all [&_.app-button]:duration-150
                                    [&_.app-button:hover]:bg-surface-soft [&_.app-button:hover]:text-text [&_.app-button:hover]:shadow-[0_8px_20px_rgba(2,6,23,0.06)] [&_.app-button:hover]:-translate-y-px
                                    [&_.app-button:focus]:outline-[2px] [&_.app-button:focus]:outline-[rgba(59,130,246,0.18)] [&_.app-button:focus]:outline-offset-2
                                    [&_.app-button.ghost]:text-muted
                                    [&_.app-button.danger]:text-red [&_.app-button.danger]:border-[rgba(220,38,38,0.08)]
                                    [&_.app-button.danger:hover]:bg-red-soft [&_.app-button.danger:hover]:text-red [&_.app-button.danger:hover]:shadow-[0_6px_16px_rgba(220,38,38,0.06)]
                                    [&_.app-button.primary]:text-blue [&_.app-button.primary]:border-[rgba(37,99,235,0.08)]
                                    [&_.app-button.primary:hover]:bg-blue-soft [&_.app-button.primary:hover]:text-blue [&_.app-button.primary:hover]:shadow-[0_6px_16px_rgba(37,99,235,0.08)]">
                      <Button variant="ghost" icon="view" onClick={() => onView?.(index)}>View</Button>
                      {actions !== 'invoice' && <Button variant="ghost" icon="edit" onClick={() => onEdit?.(index)}>Edit</Button>}
                      {actions === 'invoice' && <Button variant="ghost" icon="download" onClick={() => onDownloadPDF?.(index)}>PDF</Button>}
                      {actions === 'invoice' && <Button variant="ghost" icon="print" onClick={() => onPrint?.(index)}>Print</Button>}
                      {actions !== 'invoice' && <Button variant="danger" icon="trash" onClick={() => onDelete?.(index)}>Delete</Button>}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function isStatusCell(value) {
  return [
    'Paid',
    'Pending',
    'Overdue',
    'In Stock',
    'Low Stock',
    'Out of Stock',
    'Completed',
    'Pending',
    'Refunded',
  ].includes(value);
}
