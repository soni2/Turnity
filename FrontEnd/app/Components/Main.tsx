import { JSX } from "react";
import { Buttons } from "./Buttons";
import { useFunctions } from "../hooks/useFunctions";
import Link from "next/link";
import { SearchIcon } from "./Icons";
import Image from "next/image";

type Servicios = {
  id: string;
  title: string;
  description: string;
  rating: number | string;
  resenaCount: number;
  categoria: string;
  logo_url: string;
  fotos: string[];
};

type Props = {
  ordenarPor: string;
  servicios: Servicios[];
  setOrdenarPor: React.Dispatch<React.SetStateAction<string>>;
  renderStars: (rating: number) => JSX.Element;
  busqueda: string;
  setBusqueda: React.Dispatch<React.SetStateAction<string>>;
};

export default function Main({
  ordenarPor,
  servicios,
  setOrdenarPor,
  renderStars,
}: Props) {
  const { handleRouter } = useFunctions();

  return (
    <main className="flex-1">
      {/* Buscador */}
      {/* <div className="relative mb-6">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar servicios, estilistas..."
          className="w-full pl-10 pr-20 sm:pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white placeholder:text-gray-500 text-black"
        />
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-white px-3 sm:px-5 py-1.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          Buscar
        </button>
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div> */}

      {/* Ordenar por */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-600">
          Mostrando {servicios.length} resultados
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

      {/* Grid de servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {servicios.map((servicio) => (
          <div
            key={servicio.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full"
          >
            <div className="relative w-full h-52 shrink-0 mb-4">
              <Image
                src={servicio.fotos[0]}
                alt={servicio.title}
                fill
                className="object-cover rounded-xl"
              />
            </div>
            <div className="flex flex-col flex-1">
              <Link
                href={`/business/${servicio.id}`}
                className="flex flex-row items-center gap-2 mb-2"
              >
                <Image
                  src={servicio.logo_url}
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
                       <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wide">Nuevo</span>
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
        ))}
      </div>
    </main>
  );
}
