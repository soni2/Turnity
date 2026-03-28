"use client";

type Props = {
  categorias: string[];
  rangoPrecio: number[];
  setRangoPrecio: React.Dispatch<React.SetStateAction<number[]>>;
  categoriaActiva: string;
  setCategoriaActiva: React.Dispatch<React.SetStateAction<string>>;
};

export default function SideBar({
  categorias,
  rangoPrecio,
  setRangoPrecio,
  categoriaActiva,
  setCategoriaActiva,
}: Props) {
  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
        <h3 className="font-semibold text-lg mb-4">Filtros</h3>

        {/* Categorías */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-600 mb-2">Categorías</h4>
          <div className="space-y-2">
            {categorias.map((cat) => (
              <label key={cat} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={categoriaActiva === cat}
                  onChange={() => setCategoriaActiva(cat)}
                  className="rounded border-gray-300 text-black focus:ring-black mr-2 cursor-pointer"
                />
                <span className="text-sm text-gray-700">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rango de precio */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-600 mb-2">
            Rango de precio
          </h4>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="10000"
              step="50"
              value={rangoPrecio[1]}
              onChange={(e) => setRangoPrecio([0, parseInt(e.target.value)])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>RD$0</span>
              <span>RD${rangoPrecio[1]}+</span>
            </div>
          </div>
        </div>

        {/* Calificación */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-600 mb-2">
            Calificación mínima
          </h4>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
            <option>Cualquiera</option>
            <option>3 estrellas +</option>
            <option>4 estrellas +</option>
            <option>5 estrellas</option>
          </select>
        </div>

        {/* Disponibilidad */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-600 mb-2">
            Disponibilidad
          </h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-black focus:ring-black mr-2"
            />
            <span className="text-sm text-gray-700">Abierto ahora</span>
          </label>
          <label className="flex items-center mt-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-black focus:ring-black mr-2"
            />
            <span className="text-sm text-gray-700">Disponible hoy</span>
          </label>
        </div>

        {/* Botón de aplicar (Opcional, los filtros aplican en tiempo real) */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
        >
          Aplicar filtros
        </button>
      </div>
    </aside>
  );
}
