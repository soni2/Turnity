import { IconClock } from "@tabler/icons-react";
import { servicio } from "../types";

type ServicioWithDisponible = servicio & { disponible: boolean };

type Props = {
  servicios: ServicioWithDisponible[];
  selectedService: string | null;
  onSelectService: (id: string) => void;
};

export default function ServicesList({
  servicios,
  selectedService,
  onSelectService,
}: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <h3 className="font-bold text-2xl mb-6">Nuestros Servicios</h3>
      {servicios && servicios.length > 0 ? (
        <div className="space-y-4">
          {servicios.map((servicio) => (
            <div
              key={servicio.id}
              className={`border rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-sm ${
                selectedService === servicio.id
                  ? "border-[var(--primary)] ring-4 ring-[var(--primary)]/10 bg-purple-50 hover:bg-purple-50 shadow-purple-900/5 transform scale-[1.01]"
                  : "border-gray-200 hover:border-[var(--primary)]/40 hover:bg-gray-50 hover:shadow-md"
              } ${!servicio.disponible ? "opacity-50 grayscale select-none" : ""}`}
              onClick={() => servicio.disponible && onSelectService(servicio.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg text-gray-900">
                    {servicio.nombre}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 max-w-sm">
                    {servicio.descripcion}
                  </p>
                  <div className="flex items-center mt-3 space-x-3">
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-md flex flex-row items-center gap-2">
                      <IconClock size={20} />
                      {servicio.duracion}
                    </span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="font-bold text-xl text-[var(--primary)]">
                    RD${servicio.precio}
                  </span>
                  {!servicio.disponible && (
                    <span className="text-[10px] font-bold text-red-600 mt-2 px-2 py-1 bg-red-50 border border-red-100 rounded-md uppercase tracking-wide">
                      No disponible
                    </span>
                  )}
                  {selectedService === servicio.id && (
                    <span className="mt-3 text-xs font-bold text-purple-700 flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-md">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />{" "}
                      Seleccionado
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 border border-gray-100 rounded-2xl text-gray-500">
          <span className="font-medium text-lg">Sin servicios</span>
          <p className="text-sm mt-1">
            Este negocio aún no ha añadido servicios a su catálogo.
          </p>
        </div>
      )}
    </div>
  );
}
