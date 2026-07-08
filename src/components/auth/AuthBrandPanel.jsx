const DEFAULT_FEATURES = [
  'Sales & invoice tracking',
  'Inventory management',
  'AI business insights',
  'Customer & supplier CRM',
];

export default function AuthBrandPanel({
  subtitle = 'AI-powered business management for small & medium enterprises',
  features = DEFAULT_FEATURES,
}) {
  return (
    <div
      className="relative hidden md:flex flex-col justify-center w-[420px] shrink-0 h-full px-12 py-[60px] overflow-hidden border-r border-border bg-gradient-to-b from-blue-500/[0.06] to-blue-500/[0.03] backdrop-blur-sm"
    >
      {/* Content */}
      <div className="relative z-10">
        {/* Logo */}
        <div
          className="inline-flex items-center justify-center w-[52px] h-[52px] rounded-xl mb-7 bg-gradient-to-br from-blue to-blue-600 shadow-[0_10px_40px_rgba(37,99,235,0.08)]"
        >
          <span
            className="text-xl text-white"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            SB
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-[42px] leading-[1.05] tracking-[-1px] mb-3 text-blue"
          style={{
            fontFamily: "'DM Serif Display', serif",
            textShadow: '0 6px 22px rgba(37,99,235,0.06)',
          }}
        >
          SmartBiz
        </h1>

        {/* Subtitle */}
        <p
          className="text-sm leading-[1.6] max-w-[300px] mb-9 text-muted"
        >
          {subtitle}
        </p>

        {/* Feature list */}
        <ul className="flex flex-col gap-3 list-none p-0 m-0">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-3 text-sm text-muted"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 bg-blue"
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Subtle grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '28px 28px, 28px 28px',
        }}
      />
    </div>
  );
}
