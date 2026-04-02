type SpinnerProps = {
  text?: string;
};

export function Spinner({ text }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#FF6B35] animate-spin" />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}
