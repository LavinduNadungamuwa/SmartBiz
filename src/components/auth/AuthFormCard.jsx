export default function AuthFormCard({
  title,
  subtitle,
  wide = false,
  children,
  footer,
}) {
  return (
    <div className="flex-1 h-full flex items-center justify-center px-5 py-8 md:px-10 md:py-12 bg-transparent overflow-hidden">
      <div
        className={`w-full max-w-[550px] bg-surface border border-border rounded-[20px] p-7 shadow-shadow backdrop-blur-[6px] backdrop-saturate-[120%] max-h-[calc(100vh-96px)] [@media(max-height:700px)]:max-h-[calc(100vh-48px)] overflow-y-auto relative${
          wide ? ' form-card--wide' : ''
        }`}
      >
        <div className="mb-6">
          <h2
            className="text-[30px] text-blue mb-2"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            {title}
          </h2>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>

        {children}

        {footer && (
          <p className="text-center mt-[18px] text-[13px] text-muted">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
