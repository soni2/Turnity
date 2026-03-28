import { request } from "http";
import UserData from "./UserData";
import { createClient } from "@/lib/supabase/server";

// type UserDataProps = {
//   nombre: string;
//   email: string;
//   telefono: string;
//   detalles: string;
//   registerDate: string;
//   profilePicture: string;
//   direction: string;
//   turno?: any[];
//   negocio?: string;
// };

export default async function InformacionUsuarioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>No autorizado</div>;
  }

  const { data: profile, error } = await supabase
    .from("usuario")
    .select(
      "nombre, email, telefono, avatar_url, detalles, direction, creado_en, direction, negocio(id,nombre,logo_url), turno(*)",
    )
    .eq("id", user?.id)
    .single();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const { data: turno, error: turnoError } = await supabase
    .from("turno")
    .select("*")
    .eq("cliente_id", user?.id)
    .order("fecha", { ascending: false });

  return (
    <UserData
      name={profile?.nombre}
      email={profile?.email}
      phone={profile?.telefono}
      details={profile?.detalles}
      registerDate={profile?.creado_en}
      profilePicture={profile?.avatar_url}
      direction={profile?.direction}
      citas={turno || []}
      negocio={profile?.negocio}
    />
  );
}
