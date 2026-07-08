import Button from './Button';
import Icon from './Icon';

export default function Toolbar({
  searchPlaceholder,
  filters = [],
  primaryAction,
  viewToggle = false,
  searchValue,
  onSearchChange,
  activeFilter,
  onFilterClick,
  onPrimaryActionClick,
}) {
  return (
    <div className="toolbar flex items-center justify-between gap-3.5 max-[860px]:items-stretch max-[860px]:flex-col">
      <label className="toolbar-search flex items-center gap-2.5 text-muted bg-surface border border-border rounded-[12px] px-3.5 w-[min(420px,100%)] h-[42px] max-[860px]:w-full">
        <Icon name="search" size={17} />
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={searchValue || ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full border-0 outline-0 bg-transparent text-text"
        />
      </label>
      <div className="toolbar-actions flex items-center gap-2.5 flex-wrap max-[860px]:w-full">
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          const filterChipClasses = isActive 
            ? 'border-blue text-blue bg-blue-soft' 
            : 'border-border bg-surface text-slate-600 dark:text-text';
          return (
            <button
              key={filter}
              className={`filter-chip inline-flex items-center gap-[7px] min-h-[38px] rounded-[10px] px-3 cursor-pointer font-semibold border ${filterChipClasses}`}
              type="button"
              onClick={() => onFilterClick?.(isActive ? null : filter)}
            >
              <Icon name="filter" size={15} />
              {filter}
            </button>
          );
        })}
        {viewToggle && (
          <div className="segmented inline-flex items-center min-h-[38px] border border-border bg-surface rounded-[10px] p-[3px]">
            <button type="button" className="h-[30px] px-3 border-0 rounded-[8px] bg-transparent text-blue bg-blue-soft font-extrabold cursor-pointer">Table</button>
            <button type="button" className="h-[30px] px-3 border-0 rounded-[8px] bg-transparent text-muted cursor-pointer">Cards</button>
          </div>
        )}
        {primaryAction && <Button icon="plus" onClick={onPrimaryActionClick}>{primaryAction}</Button>}
      </div>
    </div>
  );
}
