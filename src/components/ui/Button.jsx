import Icon from './Icon';

export default function Button({ children, icon, variant = 'primary', type = 'button', onClick, className = '' }) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-[10px] font-bold whitespace-nowrap cursor-pointer transition-all duration-150 border';
  
  const variantClasses = {
    primary: 'text-white bg-blue border-transparent shadow-md shadow-blue/20 hover:bg-blue-600 min-h-[38px] px-[14px]',
    secondary: 'text-blue bg-blue-soft border-[#c8d8ff] min-h-[38px] px-[14px]',
    ghost: 'text-text bg-surface border-border shadow-none hover:bg-surface-soft min-h-[32px] px-[10px]',
    danger: 'text-red bg-red-soft border-[#ffd1d1] shadow-none min-h-[32px] px-[10px]',
  }[variant] || '';

  return (
    <button className={`app-button ${variant} ${baseClasses} ${variantClasses} ${className}`} type={type} onClick={onClick}>
      {icon && <Icon name={icon} size={17} />}
      {children}
    </button>
  );
}
