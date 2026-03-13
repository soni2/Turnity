type InputProps = {
  label: string;
  type: string;
  placeholder: string;
  className?: string;
};

export default function Input({
  label,
  type,
  placeholder,
  className,
  ...props
}: InputProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        {...props}
      />
    </div>
  );
}
