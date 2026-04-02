type ToggleChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

export function ToggleChip({ label, selected, onClick }: ToggleChipProps) {
  const baseClass =
    'px-4 py-2 rounded-full border text-sm font-medium cursor-pointer transition-all';
  const stateClass = selected
    ? 'bg-[#FFF3ED] border-[#FF6B35] text-[#FF6B35]'
    : 'bg-gray-100 border-gray-100 text-[#1A1A1A]';

  return (
    <button type="button" onClick={onClick} className={`${baseClass} ${stateClass}`}>
      {label}
    </button>
  );
}
