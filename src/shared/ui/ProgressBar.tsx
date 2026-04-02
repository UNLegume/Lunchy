type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full h-1 bg-gray-200">
      <div
        className="h-1 bg-[#FF6B35] transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
