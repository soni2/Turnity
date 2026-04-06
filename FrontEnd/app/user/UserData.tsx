"use client";
import React, { useState } from "react";
import { Buttons } from "../Components/Buttons";
import Header from "../Components/Header";
import MobileNav from "../Components/MobileNav";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  IconEdit,
  IconCheck,
  IconX,
  IconMapPin,
  IconPhone,
  IconMail,
  IconCalendar,
  IconUser,
  IconInfoCircle,
  IconSettings,
  IconUpload,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";

interface Negocio {
  id: string;
  nombre: string;
  logo_url: string;
}

interface UserDataProps {
  userId: string;
  name: string;
  email: string;
  phone: string;
  detalles: string;
  registerDate: string;
  profilePicture: string;
  direction: string;
  citas?: any[];
  negocio?: Negocio[];
}

export default function UserData({
  userId,
  name,
  email,
  phone,
  detalles,
  registerDate,
  profilePicture,
  direction,
  negocio,
  citas = [],
}: UserDataProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mostrarModalNegocio, setMostrarModalNegocio] = useState(false);
  const router = useRouter();

  // Archivo de foto
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // States para la edición
  const [formData, setFormData] = useState({
    nombre: name || "",
    telefono: phone || "",
    direction: direction || "",
    detalles: detalles || "",
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const supabase = createClient();
    let updatedAvatarUrl = profilePicture;

    if (foto) {
      const fileExt = foto.name.split(".").pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatares")
        .upload(fileName, foto);

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from("avatares")
          .getPublicUrl(uploadData.path);
        updatedAvatarUrl = publicUrlData.publicUrl;
      }
    }

    const { error } = await supabase
      .from("usuario")
      .update({
        nombre: formData.nombre,
        telefono: formData.telefono,
        direction: formData.direction,
        detalles: formData.detalles,
        ...(updatedAvatarUrl !== profilePicture && {
          avatar_url: updatedAvatarUrl,
        }),
      })
      .eq("id", userId);

    if (!error) {
      setIsEditing(false);
      setFoto(null); // Reseteamos la foto para evitar subidas dobles si vuelve a editar
      router.refresh(); // El layout server-side tomará el nuevo avatar_url
    } else {
      console.error(error);
      alert("Hubo un error al actualizar el perfil.");
    }
    setIsSaving(false);
  };
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
      ...cancelModal,
      isOpen: false,
      isSubmitting: false,
      error: null,
    });
    // Limpiamos ID y hacemos refresh
    setTimeout(() => {
      setCancelModal({
        isOpen: false,
        citaId: null,
        isSubmitting: false,
        error: null,
      });
      router.refresh();
    }, 300);
  };

  // State para el Modal de Reseñas
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    citaId: string | null;
    negocioId: string | null;
    rating: number;
    comentario: string;
    isSubmitting: boolean;
    error: string | null;
    success: boolean;
  }>({
    isOpen: false,
    citaId: null,
    negocioId: null,
    rating: 0,
    comentario: "",
    isSubmitting: false,
    error: null,
    success: false,
  });

  const handleSubmitReview = async () => {
    if (!reviewModal.citaId) return;
    if (reviewModal.rating === 0) {
      setReviewModal({
        ...reviewModal,
        error: "Por favor, selecciona una calificación.",
      });
      return;
    }

    setReviewModal({ ...reviewModal, isSubmitting: true, error: null });
    const supabase = createClient();

    const { error } = await supabase.from("resena").insert({
      turno_id: reviewModal.citaId,
      negocio_id: reviewModal.negocioId,
      cliente_id: userId,
      rating: reviewModal.rating,
      comentario: reviewModal.comentario,
    });

    if (error) {
      console.error("Error al enviar reseña:", error);
      setReviewModal({
        ...reviewModal,
        isSubmitting: false,
        error:
          "Hubo un error al enviar tu reseña. El negocio o la tabla podría no estar completamente vinculada.",
      });
    } else {
      setReviewModal({ ...reviewModal, isSubmitting: false, success: true });
      setTimeout(() => {
        setReviewModal({
          isOpen: false,
          citaId: null,
          negocioId: null,
          rating: 0,
          comentario: "",
          isSubmitting: false,
          error: null,
          success: false,
        });
        router.refresh();
      }, 2000);
    }
  };

  const formatedDate = registerDate
    ? new Date(registerDate).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
      })
    : "Recientemente";

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header variant="app" />

      {/* BANNER OVERLAP Y CONTENIDO PRINCIPAL */}
      <div className="w-full h-40 md:h-56 opacity-90"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-28 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* COLUMNA IZQUIERDA (Perfil e Información, toma 8 columnas) */}
          <div className="lg:col-span-8 space-y-6">
            {/* TARJETA DE PERFIL (Encabezado) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex items-end space-x-5">
                  <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white shadow-md bg-gray-200 flex-shrink-0 group">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <img
                        src={previewUrl || profilePicture || "/no-picture.webp"}
                        alt={name || formData.nombre}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {isEditing && (
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                        <IconUpload className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-md" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                  <div className="mb-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData({ ...formData, nombre: e.target.value })
                        }
                        className="text-2xl font-bold bg-gray-50 border border-gray-300 rounded px-2 py-1 outline-none w-full max-w-sm focus:border-[var(--primary)]"
                        placeholder="Tu Nombre"
                      />
                    ) : (
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {name || "Usuario"}
                      </h1>
                    )}
                    <p className="text-[var(--primary)] font-medium text-sm flex items-center gap-1 mt-1">
                      <IconCalendar size={16} />
                      Miembro desde {formatedDate}
                    </p>
                  </div>
                </div>

                {/* Botón de edición desktop */}
                <div className="flex sm:justify-end">
                  {isEditing ? (
                    <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setPreviewUrl(null);
                          setFoto(null);
                          setFormData({
                            nombre: name || "",
                            telefono: phone || "",
                            detalles: detalles || "",
                            direction: direction || "",
                          });
                        }}
                        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-1 text-sm font-medium w-full justify-center"
                      >
                        <IconX size={16} /> Cancelar
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 flex items-center gap-1 text-sm font-medium disabled:opacity-50 w-full justify-center"
                      >
                        <IconCheck size={16} />{" "}
                        {isSaving ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 mt-4 sm:mt-0 bg-white border border-gray-200 shadow-sm text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 text-sm font-medium w-full justify-center transition-colors"
                    >
                      <IconEdit size={16} /> Editar Perfil
                    </button>
                  )}
                </div>
              </div>

              {/* BIO / DETALLES DEBAJO DEL AVATAR */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <IconInfoCircle size={18} className="text-gray-400" />{" "}
                  Detalles / Biografía
                </h3>
                {isEditing ? (
                  <textarea
                    value={formData.detalles}
                    onChange={(e) =>
                      setFormData({ ...formData, detalles: e.target.value })
                    }
                    placeholder="Cuéntanos un poco sobre ti..."
                    rows={3}
                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-[var(--primary)] resize-none"
                  />
                ) : (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {detalles ||
                      "Aún no has agregado una biografía. Presiona editar para contarle a la comunidad un poco sobre ti."}
                  </p>
                )}
              </div>
            </div>

            {/* GRID 2 COLUMNAS PARA INFORMACIÓN Y AJUSTES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CONTACTO E INFO */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="font-bold text-lg mb-5 text-gray-900 flex items-center gap-2">
                  <IconUser size={20} className="text-[var(--primary)]" />{" "}
                  Información de contacto
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <IconMail className="text-gray-400 mt-0.5" size={20} />
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                        Correo
                      </p>
                      <p className="text-sm text-gray-900 font-medium">
                        {email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <IconPhone className="text-gray-400 mt-0.5" size={20} />
                    <div className="w-full">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                        Teléfono
                      </p>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.telefono}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              telefono: e.target.value,
                            })
                          }
                          className="w-full mt-1 bg-gray-50 border border-gray-300 rounded px-2 py-1 outline-none focus:border-[var(--primary)] text-sm"
                          placeholder="Tu teléfono..."
                        />
                      ) : (
                        <p className="text-sm text-gray-900 font-medium">
                          {phone || "No especificado"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <IconMapPin className="text-gray-400 mt-0.5" size={20} />
                    <div className="w-full">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                        Ubicación principal
                      </p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.direction}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              direction: e.target.value,
                            })
                          }
                          className="w-full mt-1 bg-gray-50 border border-gray-300 rounded px-2 py-1 outline-none focus:border-[var(--primary)] text-sm"
                          placeholder="Ciudad, País..."
                        />
                      ) : (
                        <p className="text-sm text-gray-900 font-medium">
                          {direction || "Ubicación general"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* PREFERENCIAS/AJUSTES RÁPIDOS */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="font-bold text-lg mb-5 text-gray-900 flex items-center gap-2">
                  <IconSettings size={20} className="text-gray-600" />{" "}
                  Preferencias
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">
                      Notificaciones E-mail
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">
                      Recordatorios de citas
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* HISTORIAL RECIENTE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <IconCalendar size={20} className="text-[var(--primary)]" />{" "}
                  Historial de Citas
                </h2>
                {citas.length > 5 && (
                  <button className="text-sm text-[var(--primary)] hover:underline font-medium">
                    Ver todas
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {citas.length > 0 ? (
                  citas.slice(0, 5).map((cita) => (
                    <div
                      key={cita.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors rounded-xl gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[var(--primary)] flex-shrink-0">
                          <IconCalendar size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm md:text-base">
                            {cita.servicio?.nombre || "Servicio Reservado"}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                            <span className="font-medium text-gray-700">
                              {cita.servicio?.negocio?.nombre ||
                                "Establecimiento"}
                            </span>{" "}
                            •{" "}
                            {new Date(cita.fecha).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}{" "}
                            a las{" "}
                            <span className="font-medium">
                              {cita.hora_inicio}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-200">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${cita.estado === "pendiente" ? "bg-amber-100 text-amber-800" : cita.estado === "completada" || cita.estado === "completado" ? "bg-emerald-100 text-emerald-800" : cita.estado === "cancelado" || cita.estado === "cancelada" ? "bg-rose-100 text-rose-800" : "bg-gray-200 text-gray-800"}`}
                        >
                          {cita.estado}
                        </span>
                        {(cita.estado === "pendiente" ||
                          cita.estado === "confirmado" ||
                          cita.estado === "confirmada") && (
                          <button
                            onClick={() =>
                              setCancelModal({
                                isOpen: true,
                                citaId: cita.id,
                                isSubmitting: false,
                                error: null,
                              })
                            }
                            className="text-[11px] font-bold px-2.5 py-1 bg-white border border-gray-200 rounded text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                          >
                            Cancelar
                          </button>
                        )}

                        {(cita.estado === "completada" ||
                          cita.estado === "completado" ||
                          cita.estado === "finalizado" ||
                          cita.estado === "finalizada") && (
                          <button
                            onClick={() =>
                              setReviewModal({
                                isOpen: true,
                                citaId: cita.id,
                                negocioId: cita.servicio?.negocio?.id || null,
                                rating: 0,
                                comentario: "",
                                isSubmitting: false,
                                error: null,
                                success: false,
                              })
                            }
                            className="text-[11px] font-bold px-2.5 py-1 bg-white border border-amber-200 rounded text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-1"
                          >
                            <IconStarFilled
                              size={12}
                              className="text-amber-500"
                            />
                            Evaluar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <IconCalendar className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      Aún no tienes citas agregadas al historial.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA (SIDEBAR: Toma 4 columnas) */}
          <div className="lg:col-span-4 space-y-6 lg:mt-0">
            {/* NEGOCIO */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-lg text-gray-900">
                    Mis Negocios
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Administra tus establecimientos
                  </p>
                </div>
                {negocio && negocio.length > 0 && (
                  <span className="text-[10.5px] font-bold bg-[var(--primary)] text-white px-2.5 py-1 rounded-full shadow-sm">
                    {negocio.length}
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-6 flex flex-col">
                {!negocio || negocio.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-6 text-center border border-dashed border-gray-200 flex flex-col items-center">
                    <div className="w-10 h-10 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-[var(--primary)] mb-2">
                      <IconEdit size={18} />
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      Construye tu presencia
                    </p>
                    <p className="text-xs text-gray-400">
                      Ideal para barberos, dueños de salón, spas...
                    </p>
                  </div>
                ) : (
                  <>
                    {negocio.slice(0, 3).map((e) => (
                      <Link
                        href={`/dashboard/${e.id}`}
                        key={e.id}
                        className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-[var(--primary)] hover:shadow-md transition-all duration-200"
                      >
                        <div className="h-10 w-10 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {e.logo_url ? (
                            <img
                              src={e.logo_url}
                              alt="Logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-gray-400 text-xs">
                              NG
                            </span>
                          )}
                        </div>
                        <div className="flex-1 truncate">
                          <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[var(--primary)] transition-colors">
                            {e.nombre}
                          </p>
                          <p className="text-[10px] text-green-600 font-bold uppercase tracking-wide mt-0.5">
                            Activo
                          </p>
                        </div>
                      </Link>
                    ))}

                    {/* Botón "Gestionar" si hay más de 3 */}
                    {negocio.length > 3 && (
                      <Link
                        href="/dashboard"
                        className="block text-center pt-2"
                      >
                        <span className="text-sm text-[var(--primary)] hover:underline font-medium">
                          Gestionar los {negocio.length} negocios →
                        </span>
                      </Link>
                    )}
                  </>
                )}
              </div>

              <Buttons
                onClick={() => router.push("/business/registration")}
                className="w-full bg-gray-900 hover:bg-black border-none justify-center rounded-xl py-3"
              >
                Crear establecimiento
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

      {/* Modal de Dejar Reseña (Review) */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setReviewModal({ ...reviewModal, isOpen: false })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <IconX size={20} />
            </button>

            {reviewModal.success ? (
              <div className="text-center py-6 animate-fade-in">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
                  <IconCheck size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Gracias por tu reseña!
                </h3>
                <p className="text-sm text-gray-500">
                  Tus comentarios ayudan al establecimiento y a otros usuarios.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <IconStarFilled size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Dejar Reseña
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Evalúa tu experiencia en el establecimiento
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    ¿Cómo calificarías tu cita?
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setReviewModal({
                            ...reviewModal,
                            rating: star,
                            error: null,
                          })
                        }
                        className={`transition-all duration-200 transform hover:scale-110 focus:outline-none`}
                      >
                        {reviewModal.rating >= star ? (
                          <IconStarFilled
                            size={36}
                            className="text-amber-400 drop-shadow-sm"
                          />
                        ) : (
                          <IconStar
                            size={36}
                            className="text-gray-300 hover:text-amber-200"
                            stroke={1.5}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Comentario{" "}
                    <span className="text-gray-400 font-normal">
                      (Opcional)
                    </span>
                  </label>
                  <textarea
                    value={reviewModal.comentario}
                    onChange={(e) =>
                      setReviewModal({
                        ...reviewModal,
                        comentario: e.target.value,
                      })
                    }
                    placeholder="Escribe lo que te gustó o lo que podría mejorar..."
                    rows={4}
                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:bg-white resize-none transition-colors"
                  />
                </div>

                {reviewModal.error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-5 text-center font-medium">
                    {reviewModal.error}
                  </p>
                )}

                <button
                  onClick={handleSubmitReview}
                  disabled={
                    reviewModal.isSubmitting || reviewModal.rating === 0
                  }
                  className="w-full py-3.5 rounded-xl font-bold transition-all bg-gray-900 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {reviewModal.isSubmitting ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Enviar Reseña"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
