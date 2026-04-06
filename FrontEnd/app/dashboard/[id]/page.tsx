import Header from "@/app/Components/Header";
import BusinessDashboardLayout from "./BusinessDashboardLayout";
import { createClient } from "@/lib/supabase/server";
import { IconLockFilled } from "@tabler/icons-react";
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
    return <div>No autorizado</div>;
  }

  const { data, error } = await supabase
    .from("negocio")
    .select("*")
    .eq("id", id);

  if (error || !data) {
    return <NoAuth />;
  }

  if (!user) {
    return <NoAuth />;
  }

  if (data[0].dueno_id !== user.id) {
    return (
      <>
        <Header variant="app" />
        <NoAuth />;
      </>
    );
  }

  return <BusinessDashboardLayout data={data} id={id} />;
}
