export default function PasswordStrength({ password }) {
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#e55', '#f90', '#4caf50', '#2196f3'];

  return (
    <div className="flex items-center gap-2.5 mb-[18px]">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-[3px] transition-[background] duration-300"
            style={{
              background: i <= score ? colors[score] : 'rgba(255,255,255,0.03)',
            }}
          />
        ))}
      </div>
      <span
        className="text-[12px] min-w-[40px] text-right font-medium text-muted"
        style={colors[score] ? { color: colors[score] } : undefined}
      >
        {labels[score]}
      </span>
    </div>
  );
}
