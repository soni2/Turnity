"use client";
import { IconEdit, IconCheck, IconX, IconCalendar, IconInfoCircle, IconUpload } from "@tabler/icons-react";

interface ProfileHeaderProps {
  name: string;
  profilePicture: string;
  detalles: string;
  registerDate: string;
  isEditing: boolean;
  isSaving: boolean;
  previewUrl: string | null;
  formData: { nombre: string; detalles: string };
  onChange: (field: "nombre" | "detalles", value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileHeader({
  name, profilePicture, detalles, registerDate, isEditing, isSaving, previewUrl,
  formData, onChange, onEdit, onSave, onCancel, onFileChange,
}: ProfileHeaderProps) {
  const formattedDate = registerDate
    ? new Date(registerDate).toLocaleDateString("es-ES", { year: "numeric", month: "long" })
    : "Recientemente";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        {/* Avatar + Nombre */}
        <div className="flex items-end space-x-5">
          <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white shadow-md bg-gray-200 flex-shrink-0 group">
            <div className="w-full h-full rounded-full overflow-hidden">
              <img
                src={previewUrl || profilePicture || "/no-picture.webp"}
                alt={formData.nombre || name}
                className="h-full w-full object-cover"
              />
            </div>
            {isEditing && (
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                <IconUpload className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-md" />
                <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
              </label>
            )}
          </div>
          <div className="mb-2">
            {isEditing ? (
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => onChange("nombre", e.target.value)}
                className="text-2xl font-bold bg-gray-50 border border-gray-300 rounded px-2 py-1 outline-none w-full max-w-sm focus:border-[var(--primary)]"
                placeholder="Tu Nombre"
              />
            ) : (
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{name || "Usuario"}</h1>
            )}
            <p className="text-[var(--primary)] font-medium text-sm flex items-center gap-1 mt-1">
              <IconCalendar size={16} /> Miembro desde {formattedDate}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex sm:justify-end">
          {isEditing ? (
            <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
              <button onClick={onCancel} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-1 text-sm font-medium w-full justify-center">
                <IconX size={16} /> Cancelar
              </button>
              <button onClick={onSave} disabled={isSaving} className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 flex items-center gap-1 text-sm font-medium disabled:opacity-50 w-full justify-center">
                <IconCheck size={16} /> {isSaving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          ) : (
            <button onClick={onEdit} className="px-4 py-2 mt-4 sm:mt-0 bg-white border border-gray-200 shadow-sm text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 text-sm font-medium w-full justify-center transition-colors">
              <IconEdit size={16} /> Editar Perfil
            </button>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
          <IconInfoCircle size={18} className="text-gray-400" /> Detalles / Biografía
        </h3>
        {isEditing ? (
          <textarea
            value={formData.detalles}
            onChange={(e) => onChange("detalles", e.target.value)}
            placeholder="Cuéntanos un poco sobre ti..."
            rows={3}
            className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-[var(--primary)] resize-none"
          />
        ) : (
          <p className="text-gray-600 text-sm leading-relaxed">
            {detalles || "Aún no has agregado una biografía. Presiona editar para contarle a la comunidad un poco sobre ti."}
          </p>
        )}
      </div>
    </div>
  );
}
