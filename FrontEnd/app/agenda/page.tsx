"use client";
import { useState, useEffect } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { IconCalendarEvent } from "@tabler/icons-react";
import MobileNav from "../Components/MobileNav";

interface Turno {
  id: string;
  fecha: string;
  hora_inicio: string;
  estado: string;
  servicio: {
    nombre: string;
    precio: number;
    duracion: string;
  } | null;
  empleado: {
    usuario: {
      nombre: string;
    } | null;
  } | null;
  negocio?: {
    nombre: string;
  } | null;
}

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-600",
  completado: "bg-blue-100 text-blue-800",
};

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function AgendaPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState<{isOpen: boolean, turnoId: string | null, isSubmitting: boolean, error: string | null}>({
    isOpen: false,
    turnoId: null,
    isSubmitting: false,
    error: null
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchTurnos = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Fetch turnos
    const { data: turnosData, error } = await supabase
      .from("turno")
      .select("id, fecha, hora_inicio, estado, servicio_id, empleado_id")
      .eq("cliente_id", user.id)
      .neq("estado", "cancelado")
      .order("fecha", { ascending: true });

    if (error) {
      console.error("Error al cargar turnos:", error);
      setLoading(false);
      return;
    }

    if (!turnosData || turnosData.length === 0) {
      setTurnos([]);
      setLoading(false);
      return;
    }

    // 2. IDs únicos
    const servicioIds = [...new Set(turnosData.map((t: any) => t.servicio_id).filter(Boolean))];
    const empleadoIds = [...new Set(turnosData.map((t: any) => t.empleado_id).filter(Boolean))];

    // 3. Fetch servicios
    const { data: serviciosData } = servicioIds.length
      ? await supabase.from("servicio").select("id, nombre, precio, duracion").in("id", servicioIds)
      : { data: [] };

    // 4. Fetch empleados → usuarios
    const { data: empleadosData } = empleadoIds.length
      ? await supabase.from("empleado").select("id, usuario_id").in("id", empleadoIds)
      : { data: [] };

    const usuarioIds = [...new Set((empleadosData || []).map((e: any) => e.usuario_id).filter(Boolean))];

    const { data: usuariosData } = usuarioIds.length
      ? await supabase.from("usuario").select("id, nombre").in("id", usuarioIds)
      : { data: [] };

    // 5. Armar mapa de lookup
    const servicioMap: Record<string, any> = {};
    (serviciosData || []).forEach((s: any) => { servicioMap[s.id] = s; });

    const empleadoMap: Record<string, any> = {};
    (empleadosData || []).forEach((e: any) => {
      const usuario = (usuariosData || []).find((u: any) => u.id === e.usuario_id);
      empleadoMap[e.id] = { usuario };
    });

    // 6. Combinar
    const combined: Turno[] = turnosData.map((t: any) => ({
      id: t.id,
      fecha: t.fecha,
      hora_inicio: t.hora_inicio,
      estado: t.estado,
      servicio: servicioMap[t.servicio_id] ?? null,
      empleado: empleadoMap[t.empleado_id] ?? null,
    }));

    setTurnos(combined);
    setLoading(false);
  };

  useEffect(() => {
    fetchTurnos();
  }, []);

  const confirmarCancelacion = async () => {
    if (!cancelModal.turnoId) return;
    setCancelModal({ ...cancelModal, isSubmitting: true, error: null });

    const supabase = createClient();
    const { error } = await supabase
      .from("turno")
      .update({ estado: "cancelado" })
      .eq("id", cancelModal.turnoId);

    if (error) {
      console.error("Error al cancelar:", error);
      setCancelModal({ ...cancelModal, isSubmitting: false, error: "No se pudo cancelar la cita. Intenta de nuevo." });
    } else {
      setCancelModal({ isOpen: false, turnoId: null, isSubmitting: false, error: null });
      await fetchTurnos();
    }
  };

  // ── Calendar helpers ──────────────────────────────────────────
  const turnoFechas = new Set(turnos.map((t) => t.fecha));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth, year, month };
  };

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(currentMonth);

  const prevMonth = () =>
    setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () =>
    setCurrentMonth(new Date(year, month + 1, 1));

  const toDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  const turnosFiltrados = selectedDate
    ? turnos.filter((t) => t.fecha === selectedDate)
    : turnos;

  const formatFecha = (fecha: string) => {
    const [y, m, d] = fecha.split("-").map(Number);
    const name = new Date(y, m - 1, d).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Cargando tu agenda…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header variant="app" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-24 lg:pb-12">
        <h1 className="text-2xl font-bold mb-6">Mi Agenda</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Calendario ──────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-5 lg:col-span-1 h-fit">
            {/* Encabezado del mes */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                aria-label="Mes anterior"
              >
                ‹
              </button>
              <span className="font-semibold text-base">
                {MESES[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                aria-label="Mes siguiente"
              >
                ›
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 mb-2">
              {DIAS_SEMANA.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-medium text-gray-400 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Celdas del mes */}
            <div className="grid grid-cols-7 gap-y-1">
              {/* Espacios vacíos antes del día 1 */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = toDateStr(year, month, day);
                const hasTurno = turnoFechas.has(dateStr);
                const isSelected = selectedDate === dateStr;
                const isToday =
                  dateStr === toDateStr(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    new Date().getDate()
                  );

                return (
                  <button
                    key={day}
                    onClick={() =>
                      setSelectedDate(isSelected ? null : dateStr)
                    }
                    className={`relative flex items-center justify-center h-9 w-full rounded-full text-sm font-medium transition-all
                      ${isSelected
                        ? "bg-[var(--primary)] text-white"
                        : isToday
                          ? "border-2 border-[var(--primary)] text-[var(--primary)]"
                          : hasTurno
                            ? "text-gray-800 hover:bg-gray-100"
                            : "text-gray-400 hover:bg-gray-50"
                      }`}
                  >
                    {day}
                    {hasTurno && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Leyenda */}
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] inline-block" />
              Tiene cita reservada
            </div>

            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Ver todas las citas
              </button>
            )}
          </div>

          {/* ── Lista de citas ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {selectedDate && (
              <p className="text-sm text-gray-500 font-medium">
                Mostrando citas del{" "}
                <span className="text-[var(--primary)]">
                  {formatFecha(selectedDate)}
                </span>
              </p>
            )}

            {turnosFiltrados.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                <IconCalendarEvent size={64} className="mx-auto text-[var(--primary)] mb-3 opacity-50" stroke={1.5} />
                <h3 className="font-semibold text-gray-700 mb-1">
                  {selectedDate
                    ? "Sin citas en este día"
                    : "No tienes citas reservadas"}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {selectedDate
                    ? "Selecciona otro día o explora negocios."
                    : "Explora negocios y reserva tu próxima cita."}
                </p>
                <Link
                  href="/explore"
                  className="inline-block px-5 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Explorar negocios
                </Link>
              </div>
            ) : (
              turnosFiltrados.map((turno) => (
                <div
                  key={turno.id}
                  className="bg-white rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  {/* Fecha y hora */}
                  <div className="flex-shrink-0 text-center bg-gray-50 rounded-xl px-4 py-3 min-w-[80px]">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      {new Date(turno.fecha + "T00:00:00").toLocaleDateString(
                        "es-ES",
                        { weekday: "short" }
                      )}
                    </p>
                    <p className="text-2xl font-bold text-gray-800 leading-none">
                      {turno.fecha.split("-")[2]}
                    </p>
                    <p className="text-xs text-gray-400">
                      {MESES[parseInt(turno.fecha.split("-")[1]) - 1].slice(0, 3)}
                    </p>
                    <p className="text-sm font-semibold text-[var(--primary)] mt-1">
                      {turno.hora_inicio}
                    </p>
                  </div>

                  {/* Detalles */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                       <h3 className="font-semibold text-gray-800 text-base truncate">
                         {turno.servicio?.nombre ?? "Servicio"}
                       </h3>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        con{" "}
                        <span className="font-medium text-gray-700">
                          {(turno.empleado as any)?.usuario?.nombre ??
                            "Profesional"}
                        </span>
                      </p>
                      {turno.servicio?.duracion && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          ⏱ {turno.servicio.duracion}
                        </p>
                      )}
                    </div>

                    {turno.servicio?.precio != null && (
                      <p className="text-sm font-semibold text-gray-700 mt-2">
                        RD${turno.servicio.precio}
                      </p>
                    )}
                  </div>

                  {/* Acción y Estado */}
                  <div className="flex-shrink-0 flex flex-col items-center sm:items-center gap-3 min-w-[120px]">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                        ESTADO_COLORS[turno.estado] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {turno.estado.charAt(0).toUpperCase() +
                        turno.estado.slice(1)}
                    </span>
                    {(turno.estado === "pendiente" || turno.estado === "confirmado") && (
                      <button
                        onClick={() => setCancelModal({ isOpen: true, turnoId: turno.id, isSubmitting: false, error: null })}
                        className="px-4 py-2 border border-red-300 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors w-full"
                      >
                        Cancelar cita
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <MobileNav />

      {/* Modal de Cancelación */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Cancelar Cita
            </h3>
            <div className="text-sm text-gray-500 mb-6">
              <p>¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.</p>
              {cancelModal.error && (
                <p className="text-red-500 mt-2">{cancelModal.error}</p>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCancelModal({ ...cancelModal, isOpen: false })}
                disabled={cancelModal.isSubmitting}
                className="w-full py-3 rounded-xl font-semibold transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                No, mantener
              </button>
              <button
                onClick={confirmarCancelacion}
                disabled={cancelModal.isSubmitting}
                className="w-full py-3 rounded-xl font-semibold transition-colors bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelModal.isSubmitting ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
