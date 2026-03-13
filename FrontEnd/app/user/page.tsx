"use client";
import { useState } from "react";

export default function InformacionUsuarioPage() {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarModalNegocio, setMostrarModalNegocio] = useState(false);

  const usuario = {
    nombre: "Carlos Méndez",
    email: "carlos.mendez@email.com",
    telefono: "+52 55 1234 5678",
    ubicacion: "Ciudad de México",
    miembroDesde: "Enero 2024",
    fotoPerfil: "https://via.placeholder.com/150",
    biografia:
      "Amante de los cortes clásicos y el cuidado personal. Siempre buscando los mejores estilistas.",
    preferencias: {
      notificaciones: true,
      recordatorios: true,
      newsletter: false,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón para volver atrás */}
        <button className="flex items-center text-gray-600 hover:text-black mb-6 transition-colors">
          Volver
        </button>

        {/* Tarjeta de información principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Cabecera con foto de perfil */}
          <div className="bg-gradient-to-r from-purple-600 to-black h-32"></div>

          <div className="px-6 pb-8 relative">
            {/* Foto de perfil */}
            <div className="flex justify-between items-start -mt-12">
              <div className="flex items-end space-x-4">
                <div className="h-24 w-24 rounded-full border-4 border-white overflow-hidden bg-white">
                  <img
                    src={usuario.fotoPerfil}
                    alt={usuario.nombre}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {usuario.nombre}
                  </h1>
                  <p className="text-gray-500">
                    Miembro desde {usuario.miembroDesde}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-4 sm:mt-0">
                <button
                  onClick={() => setModoEdicion(!modoEdicion)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Editar perfil
                </button>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                  Información de contacto
                </h2>

                <div className="flex items-center text-gray-600">
                  <span>{usuario.email}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <span>{usuario.telefono}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <span>{usuario.ubicacion}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <span>{usuario.miembroDesde}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Biografía</h2>
                <p className="text-gray-600">{usuario.biografia}</p>
              </div>
            </div>

            {/* Preferencias */}
            <div className="mt-8 pt-6 border-t">
              <h2 className="text-lg font-semibold mb-4">Preferencias</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={usuario.preferencias.notificaciones}
                    className="rounded border-gray-300 text-black focus:ring-black"
                    readOnly
                  />
                  <span className="ml-2 text-gray-700">
                    Recibir notificaciones
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={usuario.preferencias.recordatorios}
                    className="rounded border-gray-300 text-black focus:ring-black"
                    readOnly
                  />
                  <span className="ml-2 text-gray-700">
                    Recordatorios de citas
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={usuario.preferencias.newsletter}
                    className="rounded border-gray-300 text-black focus:ring-black"
                    readOnly
                  />
                  <span className="ml-2 text-gray-700">Newsletter</span>
                </label>
              </div>
            </div>

            {/* Sección de negocio */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h2 className="text-lg font-semibold">Mi negocio</h2>
                </div>

                {/* Botón para crear negocio - DESTACADO */}
                <button
                  onClick={() => setMostrarModalNegocio(true)}
                  className="flex items-center bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                  Crear negocio
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <p className="text-gray-600">
                  Aún no tienes un negocio registrado
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ¡Crea tu negocio y comienza a recibir clientes!
                </p>
              </div>
            </div>

            {/* Historial de citas */}
            <div className="mt-8 pt-6 border-t">
              <h2 className="text-lg font-semibold mb-4">Últimas citas</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Corte de cabello</p>
                    <p className="text-sm text-gray-600">
                      Barbería El Corte • 15 Mar 2024
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Completada
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Afeitado tradicional</p>
                    <p className="text-sm text-gray-600">
                      Barbería El Corte • 8 Mar 2024
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Completada
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Corte + Barba</p>
                    <p className="text-sm text-gray-600">
                      Barbería El Corte • 1 Mar 2024
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Pendiente
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear negocio */}
      {mostrarModalNegocio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Crear nuevo negocio</h3>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del negocio
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Ej: Barbería El Corte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de negocio
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                  <option>Barbería</option>
                  <option>Salón de belleza</option>
                  <option>Centro de estética</option>
                  <option>Uñas</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Calle, número, colonia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono de contacto
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="+52 55 1234 5678"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Crear negocio
                </button>
                <button
                  onClick={() => setMostrarModalNegocio(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
