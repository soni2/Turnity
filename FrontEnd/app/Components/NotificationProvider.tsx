"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  IconClock,
  IconAlertTriangle,
  IconX,
  IconCalendarEvent,
} from "@tabler/icons-react";

interface Notificacion {
  id: string;
  tipo: "30min" | "10min";
  mensaje: string;
}

// ── Toast individual ───────────────────────────────────────────
function NotificationToast({
  notif,
  onClose,
}: {
  notif: Notificacion;
  onClose: (id: string) => void;
}) {
  const is10min = notif.tipo === "10min";

  // Auto-dismiss a los 10 segundos
  useEffect(() => {
    const t = setTimeout(() => onClose(notif.id), 10_000);
    return () => clearTimeout(t);
  }, [notif.id, onClose]);

  return (
    <div
      className={`
        flex items-start gap-3 w-full max-w-sm rounded-2xl shadow-lg p-4
        border animate-slide-in pointer-events-auto
        ${
          is10min
            ? "bg-red-50 border-red-200 text-red-900"
            : "bg-slate-50 border-slate-200 text-slate-800"
        }
      `}
      role="alert"
    >
      {/* Ícono */}
      <div
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
          is10min ? "bg-red-100" : "bg-slate-200"
        }`}
      >
        {is10min ? (
          <IconAlertTriangle size={18} className="text-red-600" stroke={2} />
        ) : (
          <IconClock size={18} className="text-slate-600" stroke={2} />
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs font-bold uppercase tracking-wide mb-0.5 ${
            is10min ? "text-red-500" : "text-slate-500"
          }`}
        >
          {is10min ? "⚠ Cita en 10 minutos" : "Recordatorio de cita"}
        </p>
        <p className="text-sm leading-snug">{notif.mensaje}</p>
      </div>

      {/* Cerrar */}
      <button
        onClick={() => onClose(notif.id)}
        className={`shrink-0 p-1 rounded-lg transition-colors ${
          is10min
            ? "hover:bg-red-100 text-red-400"
            : "hover:bg-slate-200 text-slate-400"
        }`}
        aria-label="Cerrar notificación"
      >
        <IconX size={15} />
      </button>

      {/* Barra de progreso */}
      <div
        className={`absolute bottom-0 left-0 h-1 rounded-b-2xl animate-[shrink_10s_linear_forwards] ${
          is10min ? "bg-red-400" : "bg-slate-400"
        }`}
        style={{ width: "100%" }}
      />
    </div>
  );
}

// ── Provider principal ─────────────────────────────────────────
export default function NotificationProvider() {
  const [toasts, setToasts] = useState<Notificacion[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addToast = useCallback((notif: Notificacion) => {
    setToasts((prev) => {
      // No duplicar
      if (prev.find((n) => n.id === notif.id)) return prev;
      return [notif, ...prev].slice(0, 4); // máximo 4 toasts
    });
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setup = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Suscripción Realtime a la tabla notificacion
      channel = supabase
        .channel("notificaciones-usuario")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notificacion",
            filter: `usuario_id=eq.${user.id}`,
          },
          (payload) => {
            const row = payload.new as {
              id: string;
              tipo: "30min" | "10min";
              mensaje: string;
            };
            addToast({
              id: row.id,
              tipo: row.tipo,
              mensaje: row.mensaje,
            });
          },
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
    >
      {toasts.map((notif) => (
        <div key={notif.id} className="relative pointer-events-auto w-full max-w-sm">
          <NotificationToast notif={notif} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
}
