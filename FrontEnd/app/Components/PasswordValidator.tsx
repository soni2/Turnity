import { IconCheck, IconX } from "@tabler/icons-react";

interface PasswordValidatorProps {
  password: string;
  confirmPassword?: string;
  showMatch?: boolean;
}

export default function PasswordValidator({ password, confirmPassword, showMatch = false }: PasswordValidatorProps) {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasMinLength = password.length >= 6;
  const passwordsMatch = showMatch && password === confirmPassword && password.length > 0;

  const Requirement = ({ label, met }: { label: string; met: boolean }) => (
    <div className={`flex items-center gap-1.5 text-xs transition-colors ${met ? 'text-green-600' : 'text-red-500'}`}>
      {met ? <IconCheck size={12} stroke={3} /> : <IconX size={12} stroke={3} />}
      <span>{label}</span>
    </div>
  );

  if (!password && !confirmPassword) return null;

  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Requisitos de seguridad</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <Requirement label="Mayúscula" met={hasUppercase} />
        <Requirement label="Minúscula" met={hasLowercase} />
        <Requirement label="Número" met={hasNumber} />
        <Requirement label="Min. 6 caracteres" met={hasMinLength} />
      </div>
      {showMatch && (
        <div className="pt-2 mt-2 border-t border-gray-100">
          <Requirement label="Contraseñas coinciden" met={passwordsMatch} />
        </div>
      )}
    </div>
  );
}
