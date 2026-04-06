import { IconEdit } from "@tabler/icons-react";
import { Buttons } from "@/app/Components/Buttons";
import Link from "next/link";

interface Negocio {
  id: string;
  nombre: string;
  logo_url: string;
}

interface BusinessSidebarProps {
  negocios: Negocio[];
  onCrear: () => void;
}

export default function BusinessSidebar({ negocios, onCrear }: BusinessSidebarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-lg text-gray-900">Mis Negocios</h2>
          <p className="text-xs text-gray-500 mt-1">Administra tus establecimientos</p>
        </div>
        {negocios.length > 0 && (
          <span className="text-[10.5px] font-bold bg-[var(--primary)] text-white px-2.5 py-1 rounded-full shadow-sm">
            {negocios.length}
          </span>
        )}
      </div>

      <div className="space-y-3 mb-6 flex flex-col">
        {negocios.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center border border-dashed border-gray-200 flex flex-col items-center">
            <div className="w-10 h-10 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-[var(--primary)] mb-2">
              <IconEdit size={18} />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Construye tu presencia</p>
            <p className="text-xs text-gray-400">Ideal para barberos, dueños de salón, spas...</p>
          </div>
        ) : (
          <>
            {negocios.slice(0, 3).map((negocio) => (
              <Link
                href={`/dashboard/${negocio.id}`}
                key={negocio.id}
                className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-[var(--primary)] hover:shadow-md transition-all duration-200"
              >
                <div className="h-10 w-10 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {negocio.logo_url ? (
                    <img src={negocio.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-gray-400 text-xs">NG</span>
                  )}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[var(--primary)] transition-colors">
                    {negocio.nombre}
                  </p>
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wide mt-0.5">Activo</p>
                </div>
              </Link>
            ))}
            {negocios.length > 3 && (
              <Link href="/dashboard" className="block text-center pt-2">
                <span className="text-sm text-[var(--primary)] hover:underline font-medium">
                  Gestionar los {negocios.length} negocios →
                </span>
              </Link>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] text-white text-sm font-semibold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity"
        >
          Panel de negocios →
        </Link>
        <Buttons
          onClick={onCrear}
          className="w-full bg-gray-900 hover:bg-black border-none justify-center rounded-xl py-3"
        >
          Crear establecimiento
        </Buttons>
      </div>
    </div>
  );
}
