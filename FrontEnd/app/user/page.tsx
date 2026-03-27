import { request } from "http";
import UserData from "./UserData";
import { createClient } from "@/lib/supabase/server";

export default async function InformacionUsuarioPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("usuario")
    .select("*")
    .eq("id", user?.id)
    .single();

  const { data: turnos } = await supabase
    .from("turno")
    .select(`
      id,
      fecha,
      hora_inicio,
      estado,
      servicio:servicio_id (
        nombre,
        negocio:negocio_id (
          nombre
        )
      )
    `)
    .eq("cliente_id", user?.id)
    .order("fecha", { ascending: false });

  return (
    <UserData
      name={profile?.nombre}
      email={profile?.email}
      phone={profile?.telefono}
      details={profile?.details}
      registerDate={profile?.creado_en}
      profilePicture={profile?.avatar_url}
      biography={profile?.biography}
      direction={profile?.direccion}
      citas={turnos || []}
    />
  );
}
