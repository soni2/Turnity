import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { negocioId, fotosUrls } = await request.json();

    // 1. Validaciones básicas
    if (!negocioId || !fotosUrls || !Array.isArray(fotosUrls)) {
      return NextResponse.json(
        { error: "Faltan parámetros: negocioId o fotosUrls" },
        { status: 400 },
      );
    }

    // 2. Actualizar la columna 'fotos' con el array de URLs en formato JSON
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("negocio")
      .update({ fotos: fotosUrls }) // Se almacena como JSON (array de strings)
      .eq("id", negocioId)
      .select();

    console.log("fotosUrls guardadas:", fotosUrls);

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
