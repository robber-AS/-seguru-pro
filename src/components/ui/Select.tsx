import React from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  className?: string;
  placeholder?: string;
}

export const Select = ({ label, value, onChange, options, error, helperText, className, placeholder = "Selecione..." }: SelectProps) => (
  <div className="w-full">
    {label && <label className="label-field">{label}</label>}
    <select
      value={String(value ?? "")}
      onChange={onChange}
      className={cn(
        "input-field w-full",
        error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500/50 focus:border-blue-500",
        className,
      )}
    >
      {/* sem isso o navegador mostra a 1ª opção como escolhida, mas o valor fica "" */}
      {!options.some((o) => String(o.value) === "") && (
        <option value="" disabled>
          {options.length ? placeholder : "Nenhuma opção cadastrada"}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
  </div>
);

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export const Checkbox = ({ label, checked, onChange, error }: CheckboxProps) => (
  <div className={cn("flex items-center gap-2", error && "text-red-600")}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
    <label className="text-sm cursor-pointer select-none">{label}</label>
    {error && <span className="text-xs ml-1">{error}</span>}
  </div>
);
