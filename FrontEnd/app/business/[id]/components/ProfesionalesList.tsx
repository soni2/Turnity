import Image from "next/image";
import { IconStarFilled } from "@tabler/icons-react";
import { profesional } from "../types";

type ProfesionalExtended = profesional & {
  foto_url: string | null;
  ratingStr: string;
  ratingCount: number;
};

type Props = {
  profesionales: ProfesionalExtended[];
};

export default function ProfesionalesList({ profesionales }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <h3 className="font-bold text-2xl mb-6">Nuestros Estilistas</h3>
      {profesionales && profesionales.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profesionales.map((pro) => (
            <div
              key={pro.id}
              className="flex items-center p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-full mr-4 overflow-hidden border-2 border-white shadow-sm shrink-0">
                {pro.foto_url ? (
                  <Image
                    src={pro.foto_url}
                    alt={pro.nombre}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xl font-bold">
                    {pro.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{pro.nombre}</h4>
                <p className="text-xs text-gray-500 font-medium">
                  {pro.especialidad}
                </p>
                {pro.ratingStr !== "Nuevo" && (
                  <div className="flex items-center gap-1 mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 self-start">
                    <IconStarFilled size={10} className="text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-700">
                      {pro.ratingStr}
                    </span>
                    <span className="text-[9px] text-amber-600/70">
                      ({pro.ratingCount})
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 border border-gray-100 rounded-2xl text-gray-500">
          <span className="font-medium text-lg">Aún sin equipo</span>
          <p className="text-sm mt-1">
            Este negocio todavía no cuenta con profesionales disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
