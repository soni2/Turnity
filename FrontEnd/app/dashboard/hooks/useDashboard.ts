"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export interface Negocio {
  id: string;
  nombre: string;
  logo_url: string | null;
  categoria: string;
  direccion: string | null;
  ciudad?: string;
}

export default function useDashboard() {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMisNegocios = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Obtener los negocios donde el usuario es el dueño actual
      const { data, error } = await supabase
        .from("negocio")
        .select("id, nombre, logo_url, categoria, direccion")
        .eq("dueño_id", user.id);

      if (!error && data) {
        setNegocios(data);
      }
      setLoading(false);
    };

    fetchMisNegocios();
  }, [router]);

  return {
    negocios,
    loading,
  };
}
