import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const {
      nombreNegocio,
      categoria,
      descripcion,
      email,
      telefono,
      sitioWeb,
      direccion,   // coordenadas "lat, lng"
      ciudad,      // "Santo Domingo, República Dominicana"
      horarios,
      servicios,
      metodosPago,
      unirseComoEmpleado,
    } = body;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // ── 1. Insertar el negocio ────────────────────────────────
    const { data, error } = await supabase
      .from("negocio")
      .insert({
        nombre: nombreNegocio,
        categoria,
        descripcion: descripcion || null,
        email_contacto: email,
        telefono_contacto: telefono,
        sitio_web: sitioWeb || null,
        direccion,          // coordenadas "lat, lng"
        ciudad,             // "Ciudad, País"
        horarios: horarios ?? null,
        metodos_pago: metodosPago ?? null,
        dueno_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── 2. Insertar servicios ───────────────────────────────
    if (servicios && Array.isArray(servicios) && servicios.length > 0) {
      const serviciosRows = servicios
        .filter((s: any) => s.nombre?.trim())
        .map((s: any) => ({
          negocio_id: data.id,
          nombre: s.nombre.trim(),
          precio: parseFloat(s.precio) || null,
          duracion: parseInt(s.duracion) || null,
          descripcion: s.descripcion?.trim() || null,
          // activo usa el DEFAULT de la columna (TRUE)
        }));

      if (serviciosRows.length > 0) {
        const { error: servError } = await supabase
          .from("servicio")
          .insert(serviciosRows);

        if (servError) {
          // Retorna el error para que el cliente lo vea
          return NextResponse.json(
            { error: `Error al guardar servicios: ${servError.message}` },
            { status: 500 },
          );
        }
      }
    }

    // ── 3. Si el dueño quiere ser empleado ───────────────────
    if (unirseComoEmpleado) {
      const { error: empError } = await supabase.from("empleado").insert({
        negocio_id: data.id,
        usuario_id: user.id,
        activo: true,
      });
      if (empError) {
        console.error("Error al agregar dueño como empleado:", empError);
      }
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error("Error en /api/create:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
