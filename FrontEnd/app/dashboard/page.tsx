import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "./DashboardLayout";

export default async function GeneralDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  // if (!user) {
  //   router.push("/login");
  //   return
  // }

  if (!user) {
    return <div>No autorizado</div>;
  } else {
  }

  const { data: business, error } = await supabase
    .from("negocio")
    .select("*")
    .eq("dueno_id", user.id);

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return <DashboardLayout negocio={business} />;
}
