"use client";

import useRegistrationBusiness from "../Hooks/useRegistrationBusiness";
import { Dia, HorarioDia } from "../types/registroNegocio";

export default function Paso3Horarios() {
  const { formData, handleHorarioChange, tipoHorario, setTipoHorario } =
    useRegistrationBusiness();
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Horarios de atención</h2>
        <p className="text-gray-600">¿Cuándo atiendes al público?</p>
      </div>

      {/* Selector de tipo de horario */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de horario
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="tipoHorario"
              value="continuo"
              checked={tipoHorario === "continuo"}
              onChange={(e) =>
                setTipoHorario(e.target.value as "continuo" | "partido")
              }
              className="w-4 h-4 text-black border-gray-300 focus:ring-black"
            />
            <span className="ml-2 text-sm text-gray-700">Horario continuo</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="tipoHorario"
              value="partido"
              checked={tipoHorario === "partido"}
              onChange={(e) =>
                setTipoHorario(e.target.value as "continuo" | "partido")
              }
              className="w-4 h-4 text-black border-gray-300 focus:ring-black"
            />
            <span className="ml-2 text-sm text-gray-700">
              Horario partido (mañana/tarde)
            </span>
          </label>
        </div>
      </div>

      {(Object.keys(formData.horarios) as Dia[]).map((dia) => {
        const config = formData.horarios[dia];

        return (
          <div key={dia} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.abierto}
                  onChange={(e) =>
                    handleHorarioChange(dia, "abierto", e.target.checked)
                  }
                  className="rounded border-gray-300 text-black focus:ring-black mr-2"
                />
                <span className="font-medium capitalize">{dia}</span>
              </label>
            </div>

            {config.abierto && (
              <div className="ml-6 space-y-4">
                {tipoHorario === "continuo" ? (
                  // Horario continuo
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Apertura
                      </label>
                      <input
                        type="time"
                        value={config.apertura}
                        onChange={(e) =>
                          handleHorarioChange(dia, "apertura", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Cierre
                      </label>
                      <input
                        type="time"
                        value={config.cierre}
                        onChange={(e) =>
                          handleHorarioChange(dia, "cierre", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                ) : (
                  // Horario partido (mañana y tarde)
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-gray-500">
                      Horario matutino
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Apertura mañana
                        </label>
                        <input
                          type="time"
                          value={config.aperturaManana || "08:00"}
                          onChange={(e) =>
                            handleHorarioChange(
                              dia,
                              "aperturaManana",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Cierre mañana
                        </label>
                        <input
                          type="time"
                          value={config.cierreManana || "12:00"}
                          onChange={(e) =>
                            handleHorarioChange(
                              dia,
                              "cierreManana",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>

                    <div className="text-xs font-medium text-gray-500 mt-2">
                      Horario vespertino
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Apertura tarde
                        </label>
                        <input
                          type="time"
                          value={config.aperturaTarde || "14:00"}
                          onChange={(e) =>
                            handleHorarioChange(
                              dia,
                              "aperturaTarde",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Cierre tarde
                        </label>
                        <input
                          type="time"
                          value={config.cierreTarde || "19:00"}
                          onChange={(e) =>
                            handleHorarioChange(
                              dia,
                              "cierreTarde",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Ejemplo visual de horarios */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <h4 className="font-medium text-blue-800 mb-2">
          📅 Ejemplos de horarios:
        </h4>
        <div className="text-sm text-blue-700 space-y-2">
          <p>
            <span className="font-medium">Continuo:</span> 09:00 - 20:00 (abre
            todo el día)
          </p>
          <p>
            <span className="font-medium">Partido:</span> Mañana: 08:00 - 12:00
            | Tarde: 14:00 - 19:00 (cierra al mediodía)
          </p>
        </div>
      </div>
    </div>
  );
}
