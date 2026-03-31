"use client";
import { useState } from "react";
import Link from "next/link";
import {
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconBuildingStore,
  IconUsers,
  IconClock,
} from "@tabler/icons-react";

type JoinStatus = "valid" | "invalid" | "used" | "expired" | "already_member";

interface JoinClientProps {
  status: JoinStatus;
  token?: string;
  negocioNombre?: string;
  negocioId?: string;
}

export default function JoinClient({
  status,
  token,
  negocioNombre,
  negocioId,
}: JoinClientProps) {
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aceptarInvitacion = async () => {
    if (!token) return;
    setJoining(true);
    setError(null);
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al unirse");
      setJoined(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  // ── Pantalla de éxito tras aceptar ────────────────────────────
  if (joined) {
    return (
      <Screen
        icon={<IconCheck size={40} className="text-green-600" stroke={2.5} />}
        iconBg="bg-green-100"
        title="¡Te has unido al equipo!"
        description={`Ahora eres parte de ${negocioNombre}. El dueño del negocio verá tu perfil en su panel.`}
      >
        <Link
          href="/explore"
          className="inline-block px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Ir a explorar
        </Link>
      </Screen>
    );
  }

  // ── Ya es miembro ─────────────────────────────────────────────
  if (status === "already_member") {
    return (
      <Screen
        icon={<IconUsers size={40} className="text-blue-600" stroke={2} />}
        iconBg="bg-blue-100"
        title="Ya eres parte de este negocio"
        description="Tu cuenta ya está vinculada a este equipo."
      >
        <Link
          href="/explore"
          className="inline-block px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Volver al inicio
        </Link>
      </Screen>
    );
  }

  // ── Token inválido ────────────────────────────────────────────
  if (status === "invalid") {
    return (
      <Screen
        icon={<IconX size={40} className="text-red-600" stroke={2.5} />}
        iconBg="bg-red-100"
        title="Link inválido"
        description="Este link de invitación no existe o fue eliminado."
      >
        <Link
          href="/"
          className="inline-block px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Volver al inicio
        </Link>
      </Screen>
    );
  }

  // ── Token ya usado ─────────────────────────────────────────────
  if (status === "used") {
    return (
      <Screen
        icon={<IconAlertTriangle size={40} className="text-amber-600" stroke={2} />}
        iconBg="bg-amber-100"
        title="Link ya utilizado"
        description="Este link de invitación ya fue usado. Pídele al dueño del negocio que genere uno nuevo."
      >
        <Link
          href="/"
          className="inline-block px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Volver al inicio
        </Link>
      </Screen>
    );
  }

  // ── Token expirado ─────────────────────────────────────────────
  if (status === "expired") {
    return (
      <Screen
        icon={<IconClock size={40} className="text-gray-500" stroke={2} />}
        iconBg="bg-gray-100"
        title="Link expirado"
        description="Este link de invitación venció. Pídele al dueño que genere uno nuevo desde su panel."
      >
        <Link
          href="/"
          className="inline-block px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Volver al inicio
        </Link>
      </Screen>
    );
  }

  // ── Invitación válida — pantalla de aceptar ────────────────────
  return (
    <Screen
      icon={<IconBuildingStore size={40} className="text-[var(--primary)]" stroke={2} />}
      iconBg="bg-purple-100"
      title={`Únete a ${negocioNombre}`}
      description="Has recibido una invitación para unirte como empleado a este negocio. Al aceptar, el dueño podrá asignarte citas y horarios."
    >
      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg mb-4">
          {error}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={aceptarInvitacion}
          disabled={joining}
          className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {joining ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uniéndome...
            </>
          ) : (
            <>
              <IconCheck size={18} />
              Aceptar invitación
            </>
          )}
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center"
        >
          Rechazar
        </Link>
      </div>
    </Screen>
  );
}

// ── Layout genérico de pantalla centrada ──────────────────────
function Screen({
  icon,
  iconBg,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg max-w-md w-full p-8 text-center">
        <div className={`w-20 h-20 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-5`}>
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-7">{description}</p>
        {children}
      </div>
    </div>
  );
}
