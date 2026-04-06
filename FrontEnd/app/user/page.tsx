import UserData from "./UserData";
import { createClient } from "@/lib/supabase/server";

export default async function InformacionUsuarioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>No autorizado</div>;
  }

  // Perfil del usuario
  const { data: profile, error } = await supabase
    .from("usuario")
    .select("id, nombre, email, telefono, avatar_url, detalles, direction, creado_en")
    .eq("id", user.id)
    .single();

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error cargando su perfil: {error.message}
      </div>
    );
  }

  // Citas del usuario
  const { data: turnos } = await supabase
    .from("turno")
    .select("*, servicio(nombre, negocio(id, nombre))")
    .eq("cliente_id", user.id)
    .order("fecha", { ascending: false });

  // Negocios donde es DUEÑO
  const { data: negociosDueno } = await supabase
    .from("negocio")
    .select("id, nombre, logo_url")
    .eq("dueno_id", user.id);

  // Negocios donde es EMPLEADO activo
  const { data: empleadoRows } = await supabase
    .from("empleado")
    .select("negocio:negocio_id(id, nombre, logo_url)")
    .eq("usuario_id", user.id)
    .eq("activo", true);

  const negociosEmpleado = (empleadoRows ?? [])
    .map((r: any) => r.negocio)
    .filter(Boolean);

  // Unir ambos (evitando duplicados por si fuese dueño y empleado a la vez)
  const duenIdSet = new Set((negociosDueno ?? []).map((n: any) => n.id));
  const negociosUnidos = [
    ...(negociosDueno ?? []),
    ...negociosEmpleado.filter((n: any) => !duenIdSet.has(n.id)),
  ];

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
      negocio={negociosUnidos}
    />
  );
}
