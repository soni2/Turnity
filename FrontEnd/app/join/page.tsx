import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import JoinClient from "./JoinClient";

interface JoinPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/explore");
  }

  const supabase = await createClient();

  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/join?token=${token}`);
  }

  // Validar el token de invitación
  const { data: invitacion, error } = await supabase
    .from("invitacion_empleado")
    .select("id, negocio_id, usado, expires_at, negocio:negocio_id(nombre)")
    .eq("token", token)
    .single();

  if (error || !invitacion) {
    return <JoinClient status="invalid" />;
  }

  if (invitacion.usado) {
    return <JoinClient status="used" />;
  }

  if (new Date(invitacion.expires_at) < new Date()) {
    return <JoinClient status="expired" />;
  }

  // Verificar que no sea ya empleado del negocio
  const { data: yaEmpleado } = await supabase
    .from("empleado")
    .select("id")
    .eq("negocio_id", invitacion.negocio_id)
    .eq("usuario_id", user.id)
    .single();

  if (yaEmpleado) {
    return <JoinClient status="already_member" negocioId={invitacion.negocio_id} />;
  }

  const negocioNombre =
    (invitacion.negocio as any)?.nombre ?? "el negocio";

  return (
    <JoinClient
      status="valid"
      token={token}
      negocioNombre={negocioNombre}
      negocioId={invitacion.negocio_id}
    />
  );
}
