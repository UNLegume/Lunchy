type SelectCardProps = {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
};

export function SelectCard({ emoji, label, selected, onClick }: SelectCardProps) {
  const baseClass =
    'w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 cursor-pointer transition-all text-left';
  const stateClass = selected
    ? 'bg-[#FFF3ED] border-[#FF6B35] text-[#FF6B35]'
    : 'bg-white border-gray-300 text-[#1A1A1A]';

  return (
    <button type="button" onClick={onClick} className={`${baseClass} ${stateClass}`}>
      <span className="text-2xl">{emoji}</span>
      <span className="font-medium text-base">{label}</span>
    </button>
  );
}
