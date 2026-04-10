import { JSX } from "react";
import { useFunctions } from "../hooks/useFunctions";
import Link from "next/link";
import Image from "next/image";

type Servicio = {
  id: string;
  title: string;
  description: string;
  rating: number | string;
  resenaCount: number;
  categoria: string;
  logo_url: string;
  fotos: string[];
  horarios?: Record<string, { abierto: boolean; apertura: string; cierre: string }>;
};

type ActiveFilters = {
  ratingMin: number;
  abiertoAhora: boolean;
  disponibleHoy: boolean;
};

type Props = {
  ordenarPor: string;
  servicios: Servicio[];
  setOrdenarPor: React.Dispatch<React.SetStateAction<string>>;
  renderStars: (rating: number) => JSX.Element;
  busqueda: string;
  setBusqueda: React.Dispatch<React.SetStateAction<string>>;
  activeFilters?: ActiveFilters;
};

// Helpers de disponibilidad (duplicados aquí para no crear dependencia circular)
const DIAS_KEYS: Record<number, string> = {
  0: "domingo", 1: "lunes", 2: "martes", 3: "miercoles",
  4: "jueves", 5: "viernes", 6: "sabado",
};

function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function negocioAbiertoAhora(horarios?: Record<string, any>): boolean {
  if (!horarios) return false;
  const now = new Date();
  const cfg = horarios[DIAS_KEYS[now.getDay()]];
  if (!cfg?.abierto) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= timeToMin(cfg.apertura) && cur < timeToMin(cfg.cierre);
}

export default function Main({
  ordenarPor,
  servicios,
  setOrdenarPor,
  renderStars,
  activeFilters,
}: Props) {
  const { handleRouter } = useFunctions();

  return (
    <main className="flex-1">
      {/* Ordenar por */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-semibold text-gray-900">{servicios.length}</span> resultados
          {activeFilters && (activeFilters.abiertoAhora || activeFilters.disponibleHoy || activeFilters.ratingMin > 0) && (
            <span className="ml-2 text-xs text-[var(--primary)] font-medium">
              (filtros activos)
            </span>
          )}
        </p>
        <select
          value={ordenarPor}
          onChange={(e) => setOrdenarPor(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="recomendados">Recomendados</option>
          <option value="mejor-valorados">Mejor valorados</option>
        </select>
      </div>

      {/* Estado vacío */}
      {servicios.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-1">Sin resultados</p>
          <p className="text-sm text-gray-400 max-w-xs">
            {activeFilters?.abiertoAhora
              ? "Ningún negocio está abierto en este momento con los filtros aplicados."
              : activeFilters?.disponibleHoy
              ? "Ningún negocio tiene horario disponible hoy con los filtros aplicados."
              : "Prueba ajustando los filtros o la búsqueda."}
          </p>
        </div>
      ) : (
        /* Grid de servicios */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {servicios.map((servicio) => {
            const abierto = negocioAbiertoAhora(servicio.horarios);
            const fotoSrc = servicio.fotos?.[0] || "/no-picture.webp";
            const logoSrc = servicio.logo_url || "/no-picture.webp";

            return (
              <div
                key={servicio.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full"
              >
                {/* Imagen de portada */}
                <div className="relative w-full h-52 shrink-0 mb-4">
                  <Image
                    src={fotoSrc}
                    alt={servicio.title}
                    fill
                    className="object-cover rounded-xl"
                  />
                  {/* Badge "Abierto ahora" */}
                  {abierto && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Abierto ahora
                    </span>
                  )}
                </div>

                <div className="flex flex-col flex-1">
                  <Link
                    href={`/business/${servicio.id}`}
                    className="flex flex-row items-center gap-2 mb-2"
                  >
                    <Image
                      src={logoSrc}
                      alt={servicio.title}
                      width={40}
                      height={40}
                      className="rounded-xl object-cover shrink-0"
                    />
                    <h3 className="font-semibold text-lg mb-1 leading-tight line-clamp-2">
                      {servicio.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {servicio.description}
                  </p>

                  <div className="mt-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {servicio.rating === "Nuevo" ? (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wide">
                            Nuevo
                          </span>
                        ) : (
                          <>
                            {renderStars(Number(servicio.rating))}
                            <span className="text-sm font-bold text-amber-700">
                              {servicio.rating}
                            </span>
                            <span className="text-xs font-semibold text-amber-600/60">
                              ({servicio.resenaCount})
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRouter(`/business/${servicio.id}`)}
                      className="w-full bg-[var(--primary)] text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
