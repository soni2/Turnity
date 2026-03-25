import { JSX } from "react";
import { Buttons } from "./Buttons";
import { useFunctions } from "../hooks/useFunctions";
import Link from "next/link";
import { SearchIcon } from "./Icons";

type Servicios = {
  id: string;
  title: string;
  description: string;
  rating: number;
  precio: number;
  categoria: string;
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
  busqueda,
  setBusqueda,
}: Props) {
  const { handleRouter } = useFunctions();

  return (
    <main className="flex-1">

      {/* Buscador */}
      <div className="relative mb-6">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar servicios, estilistas..."
          className="w-full pl-10 pr-20 sm:pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white placeholder:text-gray-500 text-black"
        />
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white px-3 sm:px-5 py-1.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
          Buscar
        </button>
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      {/* Ordenar por */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-600">Mostrando {servicios.length} resultados</p>
        <select
          value={ordenarPor}
          onChange={(e) => setOrdenarPor(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="recomendados">Recomendados</option>
          <option value="precio-menor">Precio: menor a mayor</option>
          <option value="precio-mayor">Precio: mayor a menor</option>
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
            <Link href={`/business/${servicio.id}`}>
              <h3 className="font-semibold text-lg mb-1">{servicio.title}</h3>
            </Link>
            <p className="text-gray-600 text-sm mb-3">{servicio.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {renderStars(servicio.rating)}
                <span className="text-sm text-gray-500">
                  ({servicio.rating}.0)
                </span>
              </div>
              {/* <span className="font-medium text-black">${servicio.precio}</span> */}
            </div>

            <button
              onClick={() => handleRouter(`/business/${servicio.id}`)}
              className="w-full mt-auto bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Reservar
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
