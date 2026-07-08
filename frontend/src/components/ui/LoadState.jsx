import Button from './Button';

export function LoadingState({ message = 'Loading SmartBiz data...' }) {
  return (
    <div className="state-panel grid place-items-center gap-3.5 min-h-[calc(100vh-160px)] p-7 text-center text-muted">
      <span className="app-spinner w-[34px] h-[34px] border-3 border-[#dbe7ff] dark:border-blue-soft border-t-blue rounded-full animate-spin" />
      <p className="m-0 max-w-[520px] leading-[1.6]">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-panel error grid place-items-center gap-3.5 min-h-[calc(100vh-160px)] p-7 text-center text-[#b42318] dark:text-red">
      <h2 className="m-0 text-text">Could not load live data</h2>
      <p className="m-0 max-w-[520px] leading-[1.6]">{message}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Retry</Button>}
    </div>
  );
}
