import {
  IconMapPin,
  IconClock,
  IconPhone,
  IconStarFilled,
} from "@tabler/icons-react";
import { CentroData } from "../types";

type Props = {
  centro: CentroData;
};

export default function BusinessInfo({ centro }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-purple-50 text-[var(--primary)] text-xs font-semibold tracking-wide uppercase rounded-full mb-3">
            {centro.categoria}
          </span>
          <h2 className="text-3xl font-bold text-gray-900">{centro.nombre}</h2>
        </div>
        {centro.promedioRating !== "Nuevo" && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl shrink-0">
            <IconStarFilled className="text-amber-500" size={24} />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-amber-900 leading-none">
                {centro.promedioRating}
              </span>
              <span className="text-[10px] text-amber-700 font-medium uppercase tracking-wider">
                {centro.resenas?.length} reseñas
              </span>
            </div>
          </div>
        )}
      </div>

      <p className="text-gray-600 mb-8 leading-relaxed text-lg">
        {centro.descripcion}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <div className="flex items-start text-gray-700">
          <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm mr-4 shrink-0">
            <IconMapPin className="h-5 w-5 text-gray-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">Ubicación</span>
            <span>{centro.ciudad || "Dirección no especificada"}</span>
          </div>
        </div>

        <div className="flex items-start text-gray-700">
          <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm mr-4 shrink-0">
            <IconClock className="h-5 w-5 text-gray-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">Horario de hoy</span>
            <span>{centro.horario}</span>
          </div>
        </div>

        <div className="flex items-start text-gray-700 md:col-span-2 mt-2 pt-4 border-t border-gray-200/60">
          <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm mr-4 shrink-0">
            <IconPhone className="h-5 w-5 text-gray-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">Contacto</span>
            <span>{centro.telefono}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
