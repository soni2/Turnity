import { Titles } from "@/app/Components/Titles";
import BusinessForm from "./components/BusinessForm";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import NoAuth from "@/app/dashboard/[id]/NoAuth";
import { createClient } from "@/lib/supabase/server";
import Header from "@/app/Components/Header";

export default async function RegistroNegocioPage() {
    const supabase = await createClient()
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


  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <Link
            href="/user"
            className="absolute left-0 top-1/2 -translate-y-1/2 p-3 hover:bg-gray-200 rounded-full flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
          >
            <IconArrowLeft size={18} stroke={1.5} />
          </Link>
          <Titles className="text-3xl font-bold">Registra tu negocio</Titles>
          <p className="text-gray-600 mt-2">
            Únete a la comunidad y comienza a recibir reservas online
          </p>
        </div>

        {/* Formulario */}
        <BusinessForm />
      </div>
    </div>
  );
}
