"use client";
import React, { useState } from "react";
import { Buttons } from "../Components/Buttons";
import Header from "../Components/Header";
import MobileNav from "../Components/MobileNav";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Negocio {
  id: string;
  nombre: string;
  logo_url: string;
}

interface UserDataProps {
  name: string;
  email: string;
  phone: string;
  details: string;
  registerDate: string;
  profilePicture: string;
  direction: string;
  citas?: any[];
  negocio?: Negocio[];
}

export default function UserData({
  name,
  email,
  phone,
  details,
  registerDate,
  profilePicture,
  direction,
  negocio,
  citas = [],
}: UserDataProps) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarModalNegocio, setMostrarModalNegocio] = useState(false);
  const router = useRouter();
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    citaId: string | null;
    isSubmitting: boolean;
    error: string | null;
  }>({
    isOpen: false,
    citaId: null,
    isSubmitting: false,
    error: null,
  });

  const handleCancelCita = async () => {
    if (!cancelModal.citaId) return;
    setCancelModal({ ...cancelModal, isSubmitting: true, error: null });

    const supabase = createClient();
    const { error } = await supabase
      .from("turno")
      .update({ estado: "cancelado" })
      .eq("id", cancelModal.citaId);

    if (error) {
      console.error("Error al cancelar la cita:", error);
      setCancelModal({
        ...cancelModal,
        isSubmitting: false,
        error: "Hubo un error al intentar cancelar. Inténtalo de nuevo.",
      });
      return;
    }

    setCancelModal({
      isOpen: false,
      citaId: null,
      isSubmitting: false,
      error: null,
    });
    router.refresh();
  };

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

      {/* CONTENIDO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
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
                {citas.length > 0 ? (
                  citas.map((cita) => (
                    <div
                      key={cita.id}
                      className="flex justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {cita.servicio?.nombre || "Servicio"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cita.servicio?.negocio?.nombre || "Negocio"} •{" "}
                          {new Date(cita.fecha).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}{" "}
                          a las {cita.hora_inicio}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-start gap-2 pt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${cita.estado === "pendiente" ? "bg-yellow-100 text-yellow-800" : cita.estado === "completada" || cita.estado === "completado" ? "bg-green-100 text-green-800" : cita.estado === "cancelado" || cita.estado === "cancelada" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}
                        >
                          {cita.estado.charAt(0).toUpperCase() +
                            cita.estado.slice(1)}
                        </span>
                        {cita.estado === "pendiente" && (
                          <button
                            onClick={() =>
                              setCancelModal({
                                isOpen: true,
                                citaId: cita.id,
                                isSubmitting: false,
                                error: null,
                              })
                            }
                            className="text-xs font-medium text-red-500 hover:text-red-700 underline"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No tienes citas programadas.
                  </p>
                )}
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Mis negocios</h2>
                {negocio && negocio.length > 0 && (
                  <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {negocio.length}
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4 flex flex-col gap-2">
                {!negocio || negocio.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">
                      No tienes negocios aún
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Mostrar máximo 3 */}
                    {negocio.slice(0, 3).map((e) => (
                      <Link
                        href={`/dashboard/${e.id}`}
                        key={e.id}
                        className="cursor-pointer"
                      >
                        <div className="rounded-xl p-4 text-center bg-(--primary)/08 border border-(--primary) hover:bg-(--primary)/10 transition-all duration-200">
                          <p className="text-sm text-(--primary) font-medium">
                            {e.nombre}
                          </p>
                        </div>
                      </Link>
                    ))}

                    {/* Botón "Gestionar" si hay más de 3 */}
                    {negocio.length > 3 && (
                      <Link href="/dashboard">
                        <div className="rounded-xl px-4 py-3 text-center border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                          <p className="text-sm text-gray-500 font-medium">
                            +{negocio.length - 3} más — Gestionar mis negocios →
                          </p>
                        </div>
                      </Link>
                    )}
                  </>
                )}
              </div>

              <Buttons onClick={() => router.push("/business/registration")}>
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

              <Buttons className="w-full py-2 bg-black text-white rounded-lg">
                Crear
              </Buttons>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cancelación de Cita */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Cancelar Cita
            </h3>
            <div className="text-sm text-gray-500 mb-6">
              <p>
                ¿Estás seguro de que deseas cancelar esta cita? Esta acción no
                se puede deshacer.
              </p>
              {cancelModal.error && (
                <p className="text-red-500 mt-2">{cancelModal.error}</p>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() =>
                  setCancelModal({ ...cancelModal, isOpen: false })
                }
                disabled={cancelModal.isSubmitting}
                className="w-full py-3 rounded-xl font-semibold transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                No, mantener
              </button>
              <button
                onClick={handleCancelCita}
                disabled={cancelModal.isSubmitting}
                className="w-full py-3 rounded-xl font-semibold transition-colors bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelModal.isSubmitting ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
      <MobileNav />
    </div>
  );
}
