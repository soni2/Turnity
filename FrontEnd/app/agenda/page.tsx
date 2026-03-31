import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AgendaLayout from "./AgendaLayout";

export interface TurnoData {
  id: string;
  fecha: string;
  hora_inicio: string;
  estado: string;
  servicio: {
    nombre: string;
    precio: number;
  } | null;
  empleado: {
    id: string;
    usuario: {
      nombre: string;
    } | null;
  } | null;
}

export default async function AgendaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Una sola query con JOINs — usamos el nombre real de la tabla como hint
  // para evitar ambigüedad de FK en PostgREST (error: servicio_1.xxx)
  const { data, error } = await supabase
    .from("turno")
    .select(
      `
      id,
      fecha,
      hora_inicio,
      estado,
      servicio:servicio_id (
        nombre,
        precio
      ),
      empleado:empleado_id (
        id,
        usuario:usuario_id (
          nombre
        )
      )
    `,
    )
    .eq("cliente_id", user.id)
    .neq("estado", "cancelado")
    .order("fecha", { ascending: true });

  if (error) {
    console.error("Error al cargar turnos:", error.message);
  }

  const turnos: TurnoData[] = (data ?? []).map((t: any) => ({
    id: t.id,
    fecha: t.fecha,
    hora_inicio: t.hora_inicio,
    estado: t.estado,
    servicio: Array.isArray(t.servicio) ? t.servicio[0] ?? null : t.servicio ?? null,
    empleado: Array.isArray(t.empleado)
      ? t.empleado[0]
        ? {
            id: t.empleado[0].id,
            usuario: Array.isArray(t.empleado[0].usuario)
              ? t.empleado[0].usuario[0] ?? null
              : t.empleado[0].usuario ?? null,
          }
        : null
      : t.empleado
        ? {
            id: t.empleado.id,
            usuario: Array.isArray(t.empleado.usuario)
              ? t.empleado.usuario[0] ?? null
              : t.empleado.usuario ?? null,
          }
        : null,
  }));

  return <AgendaLayout turnos={turnos} />;
}
