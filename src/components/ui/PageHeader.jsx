export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header flex items-end justify-between gap-5 max-[860px]:items-stretch max-[860px]:flex-col">
      <div>
        {eyebrow && <span className="eyebrow block text-[var(--blue)] text-[12px] font-extrabold uppercase tracking-[0.08em] mb-2">{eyebrow}</span>}
        <h1 className="m-0 text-[32px] leading-[1.15] tracking-[0px] max-[560px]:text-[26px]">{title}</h1>
        {description && <p className="m-0 mt-[6px] text-[var(--muted)] leading-[1.55]">{description}</p>}
      </div>
      {actions && <div className="page-actions flex items-center gap-2.5 flex-wrap max-[860px]:w-full">{actions}</div>}
    </div>
  );
}
