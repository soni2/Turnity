import Header from "@/app/Components/Header";
import BusinessDashboardLayout from "./BusinessDashboardLayout";
import { createClient } from "@/lib/supabase/server";
import NoAuth from "./NoAuth";

export default async function NegocioDashboardPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <Header variant="app" />
        <NoAuth />
      </>
    );
  }

  const { data, error } = await supabase
    .from("negocio")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return <NoAuth />;

  const isDueno = data.dueno_id === user.id;

  // Verificar si es empleado activo de este negocio
  let isEmpleado = false;
  if (!isDueno) {
    const { data: empData } = await supabase
      .from("empleado")
      .select("id")
      .eq("negocio_id", id)
      .eq("usuario_id", user.id)
      .eq("activo", true)
      .maybeSingle();

    isEmpleado = !!empData;
  }

  // Si no es dueño ni empleado → sin acceso
  if (!isDueno && !isEmpleado) {
    return (
      <>
        <Header variant="app" />
        <NoAuth />
      </>
    );
  }

  return (
    <BusinessDashboardLayout data={[data]} id={id} isEmpleado={isEmpleado} />
  );
}
