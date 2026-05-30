import Icon from './Icon';

export default function Button({ children, icon, variant = 'primary', type = 'button' }) {
  return (
    <button className={`app-button ${variant}`} type={type}>
      {icon && <Icon name={icon} size={17} />}
      {children}
    </button>
  );
}
