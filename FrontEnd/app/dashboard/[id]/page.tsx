import BusinessDashboardLayout from "./BusinessDashboardLayout";
import { createClient } from "@/lib/supabase/server";

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
    return <div>No autorizado</div>;
  }

  const { data, error } = await supabase
    .from("negocio")
    .select("*")
    .eq("id", id);

  if (error || !data) {
    return <div>No autorizado</div>;
  }

  return <BusinessDashboardLayout data={data} id={id} />;
}
