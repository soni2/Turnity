import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 });
    }

    // Verificar sesión
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Buscar y validar el token
    const { data: invitacion, error: invError } = await supabase
      .from("invitacion_empleado")
      .select("id, negocio_id, usado, expires_at")
      .eq("token", token)
      .single();

    if (invError || !invitacion) {
      return NextResponse.json({ error: "Invitación no válida" }, { status: 404 });
    }

    if (invitacion.usado) {
      return NextResponse.json({ error: "Esta invitación ya fue utilizada" }, { status: 400 });
    }

    if (new Date(invitacion.expires_at) < new Date()) {
      return NextResponse.json({ error: "Esta invitación ha expirado" }, { status: 400 });
    }

    // Verificar que no sea ya empleado
    const { data: yaExiste } = await supabase
      .from("empleado")
      .select("id")
      .eq("negocio_id", invitacion.negocio_id)
      .eq("usuario_id", user.id)
      .single();

    if (yaExiste) {
      return NextResponse.json(
        { error: "Ya eres parte de este negocio" },
        { status: 400 },
      );
    }

    // Insertar empleado
    const { error: empError } = await supabase.from("empleado").insert({
      negocio_id: invitacion.negocio_id,
      usuario_id: user.id,
      activo: true,
    });

    if (empError) {
      console.error("Error al insertar empleado:", empError);
      return NextResponse.json({ error: empError.message }, { status: 500 });
    }

    // Marcar la invitación como usada
    await supabase
      .from("invitacion_empleado")
      .update({ usado: true })
      .eq("id", invitacion.id);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Error en /api/join:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
