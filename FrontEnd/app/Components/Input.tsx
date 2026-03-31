import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function Input({ label, className, ...props }: InputProps) {
  return (
    <div className={`flex flex-col ${className ?? ""}`}>
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-shadow"
        {...props}
      />
    </div>
  );
}

