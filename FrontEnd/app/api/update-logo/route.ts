import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { negocioId, logoUrl } = await request.json();

    // 1. Validaciones básicas
    if (!negocioId || !logoUrl) {
      return NextResponse.json(
        { error: "Faltan parámetros: negocioId o logoUrl" },
        { status: 400 },
      );
    }

    // 2. Actualizar la tabla de 'negocios'
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("negocio")
      .update({ logo_url: logoUrl }) // Asegúrate que el nombre de la columna sea correcto
      .eq("id", negocioId)
      .select();

    console.log("urlData:", logoUrl);

    if (error) {
      console.error("Error en DB:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
