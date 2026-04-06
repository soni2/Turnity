"use client";
import {
  IconCalendar,
  IconStarFilled,
  IconX,
  IconStar,
  IconCheck,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cita } from "../userTypes";

// ── Helpers ────────────────────────────────────────────────────────────────────
const ESTADO_CLASSES: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  confirmado: "bg-blue-100 text-blue-800",
  confirmada: "bg-blue-100 text-blue-800",
  completado: "bg-emerald-100 text-emerald-800",
  completada: "bg-emerald-100 text-emerald-800",
  cancelado: "bg-rose-100 text-rose-800",
  cancelada: "bg-rose-100 text-rose-800",
};

const isCompleted = (estado: string) =>
  ["completado", "completada", "finalizado", "finalizada"].includes(estado);
const isPending = (estado: string) =>
  ["pendiente", "confirmado", "confirmada"].includes(estado);

// ── Sub-component: CitaCard ────────────────────────────────────────────────────
function CitaCard({
  cita,
  onCancelar,
  onEvaluar,
}: {
  cita: Cita;
  onCancelar: (id: string) => void;
  onEvaluar: (cita: Cita) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors rounded-xl gap-4">
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
              {cita.servicio?.negocio?.nombre || "Establecimiento"}
            </span>{" "}
            •{" "}
            {new Date(cita.fecha).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            a las <span className="font-medium">{cita.hora_inicio}</span>
          </p>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-200">
        <span
          className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${ESTADO_CLASSES[cita.estado] || "bg-gray-200 text-gray-800"}`}
        >
          {cita.estado}
        </span>

        {isPending(cita.estado) && (
          <button
            onClick={() => onCancelar(cita.id)}
            className="text-[11px] font-bold px-2.5 py-1 bg-white border border-gray-200 rounded text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            Cancelar
          </button>
        )}

        {isCompleted(cita.estado) && (
          <button
            onClick={() => onEvaluar(cita)}
            className="text-[11px] font-bold px-2.5 py-1 bg-white border border-amber-200 rounded text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-1"
          >
            <IconStarFilled size={12} className="text-amber-500" />
            Evaluar
          </button>
        )}
      </div>
    </div>
  );
}

// ── Modal: Cancelar Cita ───────────────────────────────────────────────────────
function CancelModal({
  citaId,
  onClose,
  onConfirm,
  isSubmitting,
  error,
}: {
  citaId: string;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  return (
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
        <h3 className="text-xl font-bold text-gray-900 mb-2">Cancelar Cita</h3>
        <div className="text-sm text-gray-500 mb-6">
          <p>
            ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se
            puede deshacer.
          </p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-semibold transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            No, mantener
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-semibold transition-colors bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? "Cancelando..." : "Sí, cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: Reseña ──────────────────────────────────────────────────────────────
function ReviewModal({
  citaId,
  negocioId,
  userId,
  onClose,
}: {
  citaId: string;
  negocioId: string | null;
  userId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Por favor, selecciona una calificación.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: dbError } = await supabase.from("resena").insert({
      turno_id: citaId,
      negocio_id: negocioId,
      cliente_id: userId,
      rating,
      comentario,
    });
    if (dbError) {
      setError("Hubo un error al enviar tu reseña.");
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <IconX size={20} />
        </button>

        {success ? (
          <div className="text-center py-6">
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
                    onClick={() => {
                      setRating(star);
                      setError(null);
                    }}
                    className="transition-all duration-200 transform hover:scale-110 focus:outline-none"
                  >
                    {rating >= star ? (
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
                <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe lo que te gustó o lo que podría mejorar..."
                rows={4}
                className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:bg-white resize-none transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-5 text-center font-medium">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="w-full py-3.5 rounded-xl font-bold transition-all bg-gray-900 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                "Enviar Reseña"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main: AppointmentHistory ───────────────────────────────────────────────────
export default function AppointmentHistory({
  citas,
  userId,
}: {
  citas: Cita[];
  userId: string;
}) {
  const router = useRouter();

  const [cancelState, setCancelState] = useState<{
    open: boolean;
    citaId: string | null;
    isSubmitting: boolean;
    error: string | null;
  }>({
    open: false,
    citaId: null,
    isSubmitting: false,
    error: null,
  });

  const [reviewTarget, setReviewTarget] = useState<{
    citaId: string;
    negocioId: string | null;
  } | null>(null);

  const handleCancelConfirm = async () => {
    if (!cancelState.citaId) return;
    setCancelState((s) => ({ ...s, isSubmitting: true, error: null }));
    const supabase = createClient();
    const { error } = await supabase
      .from("turno")
      .update({ estado: "cancelado" })
      .eq("id", cancelState.citaId);
    if (error) {
      setCancelState((s) => ({
        ...s,
        isSubmitting: false,
        error: "Hubo un error al intentar cancelar.",
      }));
    } else {
      setCancelState({
        open: false,
        citaId: null,
        isSubmitting: false,
        error: null,
      });
      setTimeout(() => router.refresh(), 300);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
          <IconCalendar size={20} className="text-[var(--primary)]" /> Historial
          de Citas
        </h2>
        {citas.length > 5 && (
          <button className="text-sm text-[var(--primary)] hover:underline font-medium">
            Ver todas
          </button>
        )}
      </div>

      <div className="space-y-4">
        {citas.length > 0 ? (
          citas
            .slice(0, 5)
            .map((cita) => (
              <CitaCard
                key={cita.id}
                cita={cita}
                onCancelar={(id) =>
                  setCancelState({
                    open: true,
                    citaId: id,
                    isSubmitting: false,
                    error: null,
                  })
                }
                onEvaluar={(c) =>
                  setReviewTarget({
                    citaId: c.id,
                    negocioId: c.servicio?.negocio?.id ?? null,
                  })
                }
              />
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

      {cancelState.open && cancelState.citaId && (
        <CancelModal
          citaId={cancelState.citaId}
          onClose={() => setCancelState((s) => ({ ...s, open: false }))}
          onConfirm={handleCancelConfirm}
          isSubmitting={cancelState.isSubmitting}
          error={cancelState.error}
        />
      )}

      {reviewTarget && (
        <ReviewModal
          citaId={reviewTarget.citaId}
          negocioId={reviewTarget.negocioId}
          userId={userId}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
}
