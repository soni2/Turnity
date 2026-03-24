"use client";
import React, { useState } from "react";
import { Buttons } from "../Components/Buttons";
import Header from "../Components/Header";

interface UserDataProps {
  name: string;
  email: string;
  phone: string;
  details: string;
  registerDate: string;
  profilePicture: string;
  biography: string;
  direction: string;
}

export default function UserData({
  name,
  email,
  phone,
  details,
  registerDate,
  profilePicture,
  biography,
  direction,
}: UserDataProps) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarModalNegocio, setMostrarModalNegocio] = useState(false);

  const formatedDate = new Date(registerDate).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
  });

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
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <Header variant="app" />
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button className="text-gray-600 hover:text-black">← Volver</button>

          <button
            onClick={() => setModoEdicion(!modoEdicion)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Editar perfil
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* IZQUIERDA */}
          <div className="lg:col-span-2 space-y-6">
            {/* PERFIL */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={profilePicture || "/no-picture.webp"}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold">{name}</h1>
                  <p className="text-gray-500 text-sm">
                    Miembro desde {formatedDate}
                  </p>
                </div>
              </div>
            </div>

            {/* INFO */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">
                Información de contacto
              </h2>

              <div className="space-y-2 text-sm text-gray-600">
                <p>{email}</p>
                <p>{phone}</p>
                <p>{usuario.ubicacion}</p>
                <p>{usuario.miembroDesde}</p>
              </div>
            </div>

            {/* BIO */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Biografía</h2>
              <p className="text-gray-600 text-sm">{usuario.biografia}</p>
            </div>

            {/* HISTORIAL */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Últimas citas</h2>

              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Corte de cabello</p>
                    <p className="text-xs text-gray-500">
                      Barbería El Corte • 15 Mar 2024
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 px-2 py-1 rounded-full">
                    Completada
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DERECHA (SIDEBAR) */}
          <div className="space-y-6">
            {/* PREFERENCIAS */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Preferencias</h2>

              <div className="space-y-2 text-sm">
                <label className="flex items-center">
                  <input type="checkbox" checked readOnly />
                  <span className="ml-2">Notificaciones</span>
                </label>
              </div>
            </div>

            {/* NEGOCIO */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Mi negocio</h2>

              <div className="bg-gray-50 rounded-lg p-4 text-center mb-4">
                <p className="text-sm text-gray-600">
                  No tienes un negocio aún
                </p>
              </div>

              <Buttons
                onClick={() => setMostrarModalNegocio(true)}
                className="w-full"
              >
                Crear negocio
              </Buttons>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {mostrarModalNegocio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Crear negocio</h3>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <button className="w-full py-2 bg-black text-white rounded-lg">
                Crear
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
