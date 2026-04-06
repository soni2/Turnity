"use client";
import { IconMail, IconPhone, IconMapPin, IconUser } from "@tabler/icons-react";

interface ContactInfoProps {
  email: string;
  phone: string;
  direction: string;
  isEditing: boolean;
  formData: { telefono: string; direction: string };
  onChange: (field: "telefono" | "direction", value: string) => void;
}

export default function ContactInfo({ email, phone, direction, isEditing, formData, onChange }: ContactInfoProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="font-bold text-lg mb-5 text-gray-900 flex items-center gap-2">
        <IconUser size={20} className="text-[var(--primary)]" /> Información de contacto
      </h2>

      <div className="space-y-4">
        {/* Email (read-only) */}
        <div className="flex items-start gap-3">
          <IconMail className="text-gray-400 mt-0.5" size={20} />
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Correo</p>
            <p className="text-sm text-gray-900 font-medium">{email}</p>
          </div>
        </div>

        {/* Teléfono */}
        <div className="flex items-start gap-3">
          <IconPhone className="text-gray-400 mt-0.5" size={20} />
          <div className="w-full">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Teléfono</p>
            {isEditing ? (
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => onChange("telefono", e.target.value)}
                className="w-full mt-1 bg-gray-50 border border-gray-300 rounded px-2 py-1 outline-none focus:border-[var(--primary)] text-sm"
                placeholder="Tu teléfono..."
              />
            ) : (
              <p className="text-sm text-gray-900 font-medium">{phone || "No especificado"}</p>
            )}
          </div>
        </div>

        {/* Ubicación */}
        <div className="flex items-start gap-3">
          <IconMapPin className="text-gray-400 mt-0.5" size={20} />
          <div className="w-full">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Ubicación principal</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.direction}
                onChange={(e) => onChange("direction", e.target.value)}
                className="w-full mt-1 bg-gray-50 border border-gray-300 rounded px-2 py-1 outline-none focus:border-[var(--primary)] text-sm"
                placeholder="Ciudad, País..."
              />
            ) : (
              <p className="text-sm text-gray-900 font-medium">{direction || "Ubicación general"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
