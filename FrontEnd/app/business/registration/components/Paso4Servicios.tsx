"use client";

import useRegistrationBusiness from "../Hooks/useRegistrationBusiness";

export default function Paso4Servicios() {
  const { formData, handleServicioChange, agregarServicio, eliminarServicio } =
    useRegistrationBusiness();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Servicios</h2>
        <p className="text-gray-600">¿Qué servicios ofreces?</p>
      </div>

      {formData.servicios.map((servicio, index) => (
        <div key={servicio.id} className="border rounded-lg p-4 relative">
          {formData.servicios.length > 1 && (
            <button
              type="button"
              onClick={() => eliminarServicio(servicio.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              ×
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Nombre del servicio *
              </label>
              <input
                type="text"
                value={servicio.nombre}
                onChange={(e) =>
                  handleServicioChange(servicio.id, "nombre", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ej: Corte de cabello"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Precio (RD$) *
              </label>
              <input
                type="number"
                value={servicio.precio}
                onChange={(e) =>
                  handleServicioChange(servicio.id, "precio", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Duración (min) *
              </label>
              <input
                type="number"
                value={servicio.duracion}
                onChange={(e) =>
                  handleServicioChange(servicio.id, "duracion", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="45"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={servicio.descripcion}
                onChange={(e) =>
                  handleServicioChange(
                    servicio.id,
                    "descripcion",
                    e.target.value,
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Breve descripción del servicio"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={agregarServicio}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-black hover:text-black transition-colors"
      >
        + Agregar otro servicio
      </button>
    </div>
  );
}
