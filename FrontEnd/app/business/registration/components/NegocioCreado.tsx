"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  IconCheck,
  IconCopy,
  IconLink,
  IconBuildingStore,
  IconUsers,
  IconArrowRight,
  IconUserCheck,
  IconUserX,
} from "@tabler/icons-react";

interface NegocioCreateadoProps {
  negocioId: string;
  negocioNombre: string;
}

export default function NegocioCreado({
  negocioId,
  negocioNombre,
}: NegocioCreateadoProps) {
  // ── Estado de "¿ser empleado?" ─────────────────────────────
  const [empleadoDecidido, setEmpleadoDecidido] = useState(false);
  const [uniendose, setUniendose] = useState(false);
  const [esEmpleado, setEsEmpleado] = useState(false);

  // ── Estado del link de invitación ─────────────────────────
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // ── Unirse como empleado ──────────────────────────────────
  const unirseComoEmpleado = async (quiereUnirse: boolean) => {
    setUniendose(true);
    if (quiereUnirse) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("empleado").insert({
          negocio_id: negocioId,
          usuario_id: user.id,
          activo: true,
        });
        setEsEmpleado(true);
      }
    }
    setEmpleadoDecidido(true);
    setUniendose(false);
  };

  // ── Generar link de invitación ────────────────────────────
  const generarLink = async () => {
    setLoadingInvite(true);
    setInviteError(null);
    try {
      const res = await fetch("/api/create-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocioId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar el link");
      setInviteLink(data.link);
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setLoadingInvite(false);
    }
  };

  const copiarLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 text-center">

        {/* Ícono de éxito */}
        <div className="relative mx-auto mb-6 w-24 h-24">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <IconCheck size={44} className="text-green-600" stroke={2.5} />
          </div>
          <span className="absolute inset-0 rounded-full border-4 border-green-400 opacity-30 animate-ping" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Negocio registrado!
        </h2>
        <p className="text-gray-500 mb-1">
          <span className="font-semibold text-gray-700">{negocioNombre}</span>{" "}
          ya está en la plataforma.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Puedes gestionarlo desde tu panel de control.
        </p>

        {/* ── Pregunta: ¿ser empleado? ──────────────────────── */}
        {!empleadoDecidido ? (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <IconUsers size={18} className="text-blue-600" />
              <h3 className="font-semibold text-blue-900 text-sm">
                ¿Tú también ofreces servicios en este negocio?
              </h3>
            </div>
            <p className="text-xs text-blue-700 mb-4">
              Si trabajas en <strong>{negocioNombre}</strong>, puedes agregarte
              como empleado ahora. Esto te permitirá aparecer en la agenda y
              recibir citas asignadas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => unirseComoEmpleado(true)}
                disabled={uniendose}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {uniendose ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <IconUserCheck size={16} />
                )}
                Sí, agregarme
              </button>
              <button
                onClick={() => unirseComoEmpleado(false)}
                disabled={uniendose}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                <IconUserX size={16} />
                No por ahora
              </button>
            </div>
          </div>
        ) : esEmpleado ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-6 flex items-center gap-2">
            <IconUserCheck size={18} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              ¡Listo! Ya apareces como empleado en {negocioNombre}.
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl px-4 py-3 mb-6 flex items-center gap-2">
            <IconUserX size={18} className="text-gray-400 shrink-0" />
            <p className="text-sm text-gray-500">
              No te has agregado como empleado. Puedes hacerlo luego desde el
              panel.
            </p>
          </div>
        )}

        {/* ── Link de invitación ────────────────────────────── */}
        {empleadoDecidido && (
          <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left">
            <div className="flex items-center gap-2 mb-1">
              <IconUsers size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800 text-sm">
                Invitar otros empleados
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Genera un link único para que otros empleados se unan. Expira en 7
              días.
            </p>

            {inviteLink ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
                  <IconLink size={14} className="text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-600 truncate flex-1 font-mono">
                    {inviteLink}
                  </span>
                  <button
                    onClick={copiarLink}
                    className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      copied
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {copied ? (
                      <><IconCheck size={13} /> Copiado</>
                    ) : (
                      <><IconCopy size={13} /> Copiar</>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  ⏱ Válido por 7 días · un solo uso por usuario
                </p>
              </div>
            ) : (
              <button
                onClick={generarLink}
                disabled={loadingInvite}
                className="w-full py-2.5 px-4 bg-gray-800 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loadingInvite ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generando...
                  </>
                ) : (
                  <><IconLink size={16} /> Generar link de invitación</>
                )}
              </button>
            )}

            {inviteError && (
              <p className="text-xs text-red-500 mt-2 text-center">
                {inviteError}
              </p>
            )}
          </div>
        )}

        {/* ── Acciones finales ──────────────────────────────── */}
        {empleadoDecidido && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/dashboard/${negocioId}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-[var(--primary)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              <IconBuildingStore size={18} />
              Ir al panel
              <IconArrowRight size={16} />
            </Link>
            <Link
              href="/explore"
              className="flex-1 py-3 px-5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm text-center"
            >
              Explorar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
