import { JSX } from "react";

type Servicios = {
  id: number;
  title: string;
  description: string;
  rating: number;
  precio: number;
  categoria: string;
};

type Props = {
  categorias: string[];
  categoriaActiva: string;
  setCategoriaActiva: React.Dispatch<React.SetStateAction<string>>;
  ordenarPor: string;
  servicios: Servicios[];
  setOrdenarPor: React.Dispatch<React.SetStateAction<string>>;
  renderStars: (rating: number) => JSX.Element;
};

export default function Main({
  categorias,
  categoriaActiva,
  ordenarPor,
  servicios,
  setCategoriaActiva,
  setOrdenarPor,
  renderStars,
}: Props) {
  return (
    <main className="flex-1">
      {/* Categorías rápidas */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaActiva(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              categoriaActiva === cat
                ? "bg-black text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Ordenar por */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-600">Mostrando 8 resultados</p>
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
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <h3 className="font-semibold text-lg mb-1">{servicio.title}</h3>
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

            <button className="w-full mt-4 bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              Reservar
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
