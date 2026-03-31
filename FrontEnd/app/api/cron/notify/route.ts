import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Esta ruta solo debe ejecutarse desde Vercel Cron (con el secret)
export async function GET(req: Request) {
  // Proteger con un secret para que nadie llame esto manualmente
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Usar service_role para poder insertar sin restricciones RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

  // Formatear una fecha a "HH:MM"
  const toHHMM = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  // Ventana de 30 minutos → buscar turnos entre +28 y +32 min
  const min30 = toHHMM(new Date(now.getTime() + 28 * 60_000));
  const max30 = toHHMM(new Date(now.getTime() + 32 * 60_000));

  // Ventana de 10 minutos → buscar turnos entre +8 y +12 min
  const min10 = toHHMM(new Date(now.getTime() + 8 * 60_000));
  const max10 = toHHMM(new Date(now.getTime() + 12 * 60_000));

  let notificacionesCreadas = 0;
  let errores = 0;

  // ── Procesar cada ventana ────────────────────────────────────
  const ventanas = [
    { tipo: "30min" as const, min: min30, max: max30, label: "30 minutos" },
    { tipo: "10min" as const, min: min10, max: max10, label: "10 minutos" },
  ];

  for (const ventana of ventanas) {
    // Obtener turnos en esa ventana que no tengan notificación ya enviada
    const { data: turnos, error: fetchError } = await supabase
      .from("turno")
      .select(
        `
        id,
        cliente_id,
        hora_inicio,
        servicio:servicio_id (nombre)
      `,
      )
      .eq("fecha", todayStr)
      .in("estado", ["pendiente", "confirmado"])
      .gte("hora_inicio", ventana.min)
      .lte("hora_inicio", ventana.max);

    if (fetchError) {
      console.error(`Error fetching turnos (${ventana.tipo}):`, fetchError);
      errores++;
      continue;
    }

    if (!turnos || turnos.length === 0) continue;

    for (const turno of turnos) {
      const servicioNombre =
        (turno.servicio as any)?.nombre ?? "tu servicio";

      // Verificar si ya existe esa notificación (UNIQUE constraint lo garantiza, pero evitamos error)
      const { data: existe } = await supabase
        .from("notificacion")
        .select("id")
        .eq("turno_id", turno.id)
        .eq("tipo", ventana.tipo)
        .single();

      if (existe) continue;

      // Insertar notificación
      const { error: insertError } = await supabase
        .from("notificacion")
        .insert({
          usuario_id: turno.cliente_id,
          turno_id: turno.id,
          tipo: ventana.tipo,
          mensaje: `Tu cita de "${servicioNombre}" comienza en ${ventana.label} (${turno.hora_inicio})`,
        });

      if (insertError) {
        // Ignorar conflictos de duplicado (código 23505)
        if (insertError.code !== "23505") {
          console.error("Error insertando notificación:", insertError);
          errores++;
        }
      } else {
        notificacionesCreadas++;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    notificacionesCreadas,
    errores,
    timestamp: now.toISOString(),
  });
}
