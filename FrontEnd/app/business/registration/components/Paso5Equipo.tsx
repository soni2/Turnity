import useRegistrationBusiness from "../Hooks/useRegistrationBusiness";
import { FormData } from "../types/registroNegocio";

export default function Paso5Equipo({
  formData,
  handleProfesionalChange,
  agregarProfesional,
  eliminarProfesional,
}: {
  formData: FormData;
  handleProfesionalChange: (id: number, campo: string, valor: string) => void;
  agregarProfesional: () => void;
  eliminarProfesional: (id: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Tu equipo</h2>
        <p className="text-gray-600">¿Quiénes trabajan en tu negocio?</p>
      </div>

      {formData.profesionales.map((prof, index) => (
        <div key={prof.id} className="border rounded-lg p-4 relative">
          {formData.profesionales.length > 1 && (
            <button
              type="button"
              onClick={() => eliminarProfesional(prof.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              ×
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={prof.nombre}
                onChange={(e) =>
                  handleProfesionalChange(prof.id, "nombre", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ej: Carlos Méndez"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Especialidad *
              </label>
              <input
                type="text"
                value={prof.especialidad}
                onChange={(e) =>
                  handleProfesionalChange(
                    prof.id,
                    "especialidad",
                    e.target.value,
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ej: Cortes modernos"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">
                Años de experiencia
              </label>
              <input
                type="text"
                value={prof.experiencia}
                onChange={(e) =>
                  handleProfesionalChange(
                    prof.id,
                    "experiencia",
                    e.target.value,
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ej: 5 años"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={agregarProfesional}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-black hover:text-black transition-colors"
      >
        + Agregar otro profesional
      </button>
    </div>
  );
}
