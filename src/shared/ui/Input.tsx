'use client';

type InputProps = {
  label: string;
  placeholder?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function Input({ label, placeholder, hint, value, onChange, error }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-900">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`border rounded-lg px-3.5 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
