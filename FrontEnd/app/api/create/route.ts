import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const {
      nombreNegocio,
      categoria,
      logo_url,
      email,
      telefono,
      coordenadas,
      fotos,
    } = body;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("negocio")
      .insert({
        nombre: nombreNegocio,
        categoria,
        telefono_contacto: telefono,
        direccion: coordenadas,
        dueno_id: user.id,
        logo_url: logo_url,
        fotos: fotos,
      })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
