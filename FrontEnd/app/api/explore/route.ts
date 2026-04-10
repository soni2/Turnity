import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // El usuario pidió usar `search` en vez de `q`
    const search = searchParams.get('search');
    const categoria = searchParams.get('categoria');

    let req = supabase.from("negocio").select(`
      id,
      nombre,
      descripcion,
      ciudad,
      categoria,
      logo_url,
      fotos,
      horarios,
      resenas:resena (rating)
    `);

    // Busca usando ilike si pasan parametro search
    if (search) {
      req = req.ilike('nombre', `%${search}%`);
    }

    if (categoria && categoria !== 'Todas') {
      req = req.eq('categoria', categoria);
    }

    const { data, error } = await req;

    if (error) {
      console.error("API /explore error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedData = data.map((n: any) => {
      const resenasArray = n.resenas || [];
      const totalRating = resenasArray.reduce((acc: number, r: any) => acc + r.rating, 0);
      const avgRating = resenasArray.length > 0 ? (totalRating / resenasArray.length).toFixed(1) : "Nuevo";

      return {
        id: n.id,
        title: n.nombre,
        description: n.descripcion || "Sin descripción disponible",
        rating: avgRating,
        resenaCount: resenasArray.length,
        categoria: n.categoria || "Barbería",
        logo_url: n.logo_url || "/no-picture.webp",
        fotos: n.fotos || ["/no-picture.webp"],
        horarios: n.horarios || {},
      };
    });

    return NextResponse.json({ data: formattedData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
