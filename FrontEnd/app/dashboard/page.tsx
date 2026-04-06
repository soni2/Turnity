import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "./DashboardLayout";

export default async function GeneralDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>No autorizado</div>;
  }

  // Negocios donde es DUEÑO
  const { data: negociosDueno, error } = await supabase
    .from("negocio")
    .select("*")
    .eq("dueno_id", user.id);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Negocios donde es EMPLEADO activo
  const { data: empleadoRows } = await supabase
    .from("empleado")
    .select("negocio:negocio_id(*)")
    .eq("usuario_id", user.id)
    .eq("activo", true);

  const negociosEmpleado = (empleadoRows ?? [])
    .map((r: any) => r.negocio)
    .filter(Boolean);

  // Merge evitando duplicados
  const duenIdSet = new Set((negociosDueno ?? []).map((n: any) => n.id));
  const negociosUnidos = [
    ...(negociosDueno ?? []),
    ...negociosEmpleado.filter((n: any) => !duenIdSet.has(n.id)),
  ];

  return <DashboardLayout negocio={negociosUnidos} />;
}
