'use client';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export function Button({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
}: ButtonProps) {
  const baseClass = 'h-12 rounded-lg font-semibold text-base w-full transition-colors duration-200';

  const variantClass = disabled
    ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
    : variant === 'primary'
      ? 'bg-[#FF6B35] text-white hover:bg-[#e05a27]'
      : 'bg-white border border-[#FF6B35] text-[#FF6B35] hover:bg-orange-50';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass}`}
    >
      {children}
    </button>
  );
}
