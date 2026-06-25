import Button from './Button';

export default function EmptyState({ title, description, action, onAction }) {
  return (
    <div className="empty-state grid justify-items-center gap-2.5 text-center p-7 text-[var(--text)] border border-dashed border-[#cbd5e1] rounded-[var(--radius)] bg-[var(--surface)]">
      <div className="empty-illustration relative w-[120px] h-[70px] rounded-[18px] bg-gradient-to-br from-[var(--blue-soft)] to-white border border-[#dbe7ff]">
        <span className="absolute left-[18px] right-[18px] h-2 rounded-full bg-[#c8d8ff] top-[18px]" />
        <span className="absolute left-[18px] right-[18px] h-2 rounded-full bg-[#c8d8ff] top-[34px] w-[56px]" />
        <span className="absolute left-[18px] right-[18px] h-2 rounded-full bg-[#c8d8ff] top-[50px] w-[76px]" />
      </div>
      <h3 className="m-0 mt-1.5">{title}</h3>
      <p className="m-0 mt-1.5 text-[var(--muted)] leading-[1.55]">{description}</p>
      {action ? <Button icon="plus" onClick={onAction}>{action}</Button> : null}
    </div>
  );
}
