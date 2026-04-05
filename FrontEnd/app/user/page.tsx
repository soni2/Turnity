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

  // Obtenemos todos los campos reales del usuario
  const { data: profile, error } = await supabase
    .from("usuario")
    .select(
      "id, nombre, email, telefono, avatar_url, detalles, direction, creado_en",
    )
    .eq("id", user?.id)
    .single();

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error cargando su perfil: {error.message}
      </div>
    );
  }

  // Obtenemos los turnos del usuario con los nombres de negocio y servicio para la interfaz
  const { data: turnos } = await supabase
    .from("turno")
    .select("*, servicio(nombre, negocio(id, nombre))")
    .eq("cliente_id", user?.id)
    .order("fecha", { ascending: false });

  // Obtenemos negocios donde este usuario sea dueño (siempre y cuando el esquema negocio tenga dueno_id)
  const { data: negocios } = await supabase
    .from("negocio")
    .select("id, nombre, logo_url")
    .eq("dueno_id", user?.id);

  return (
    <UserData
      userId={user.id}
      name={profile?.nombre}
      email={profile?.email}
      phone={profile?.telefono}
      detalles={profile?.detalles}
      registerDate={profile?.creado_en}
      profilePicture={profile?.avatar_url}
      direction={profile?.direction}
      citas={turnos || []}
      negocio={negocios || []}
    />
  );
}
