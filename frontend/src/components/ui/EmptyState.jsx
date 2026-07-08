import Button from './Button';

export default function EmptyState({ title, description, action, onAction }) {
  return (
    <div className="empty-state grid justify-items-center gap-2.5 text-center p-7 text-text border border-dashed border-border rounded-2xl bg-surface">
      <div className="empty-illustration relative w-[120px] h-[70px] rounded-[18px] bg-gradient-to-br from-blue-soft to-surface border border-border">
        <span className="absolute left-[18px] right-[18px] h-2 rounded-full bg-[#c8d8ff] dark:bg-blue-soft top-[18px]" />
        <span className="absolute left-[18px] right-[18px] h-2 rounded-full bg-[#c8d8ff] dark:bg-blue-soft top-[34px] w-[56px]" />
        <span className="absolute left-[18px] right-[18px] h-2 rounded-full bg-[#c8d8ff] dark:bg-blue-soft top-[50px] w-[76px]" />
      </div>
      <h3 className="m-0 mt-1.5">{title}</h3>
      <p className="m-0 mt-1.5 text-muted leading-[1.55]">{description}</p>
      {action ? <Button icon="plus" onClick={onAction}>{action}</Button> : null}
    </div>
  );
}
