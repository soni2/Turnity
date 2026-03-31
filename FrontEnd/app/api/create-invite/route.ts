import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { negocioId } = await req.json();

    if (!negocioId) {
      return NextResponse.json({ error: "negocioId requerido" }, { status: 400 });
    }

    // Verificar que el usuario autenticado es dueño del negocio
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: negocio } = await supabase
      .from("negocio")
      .select("id, dueno_id")
      .eq("id", negocioId)
      .single();

    if (!negocio || negocio.dueno_id !== user.id) {
      return NextResponse.json({ error: "No tienes permiso sobre este negocio" }, { status: 403 });
    }

    // Generar token UUID y guardar la invitación
    // expires_at = 7 días desde ahora
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: invitacion, error } = await supabase
      .from("invitacion_empleado")
      .insert({
        negocio_id: negocioId,
        expires_at: expiresAt.toISOString(),
        usado: false,
      })
      .select("token")
      .single();

    if (error) {
      console.error("Error al crear invitación:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const link = `${baseUrl}/join?token=${invitacion.token}`;

    return NextResponse.json({ link, token: invitacion.token }, { status: 200 });
  } catch (err) {
    console.error("Error en create-invite:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
