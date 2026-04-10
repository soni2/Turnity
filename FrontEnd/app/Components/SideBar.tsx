"use client";

type Props = {
  categorias: string[];
  categoriaActiva: string;
  setCategoriaActiva: React.Dispatch<React.SetStateAction<string>>;
  ratingMin: number;
  setRatingMin: React.Dispatch<React.SetStateAction<number>>;
  abiertoAhora: boolean;
  setAbiertoAhora: React.Dispatch<React.SetStateAction<boolean>>;
  disponibleHoy: boolean;
  setDisponibleHoy: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SideBar({
  categorias,
  categoriaActiva,
  setCategoriaActiva,
  ratingMin,
  setRatingMin,
  abiertoAhora,
  setAbiertoAhora,
  disponibleHoy,
  setDisponibleHoy,
}: Props) {
  const hasActiveFilters =
    categoriaActiva !== "Todas" ||
    ratingMin > 0 ||
    abiertoAhora ||
    disponibleHoy;

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Filtros</h3>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setCategoriaActiva("Todas");
                setRatingMin(0);
                setAbiertoAhora(false);
                setDisponibleHoy(false);
              }}
              className="text-xs text-[var(--primary)] hover:underline font-medium"
            >
              Limpiar todo
            </button>
          )}
        </div>

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

        {/* Calificación */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-600 mb-2">
            Calificación mínima
          </h4>
          <select
            value={ratingMin}
            onChange={(e) => setRatingMin(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value={0}>Cualquiera</option>
            <option value={3}>3 estrellas +</option>
            <option value={4}>4 estrellas +</option>
            <option value={5}>5 estrellas</option>
          </select>
        </div>

        {/* Disponibilidad */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-600 mb-2">
            Disponibilidad
          </h4>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={abiertoAhora}
              onChange={(e) => {
                setAbiertoAhora(e.target.checked);
                if (e.target.checked) setDisponibleHoy(false); // mutuamente excluyentes
              }}
              className="rounded border-gray-300 text-black focus:ring-black mr-2 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Abierto ahora</span>
          </label>
          <label className="flex items-center mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={disponibleHoy}
              onChange={(e) => {
                setDisponibleHoy(e.target.checked);
                if (e.target.checked) setAbiertoAhora(false); // mutuamente excluyentes
              }}
              className="rounded border-gray-300 text-black focus:ring-black mr-2 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Disponible hoy</span>
          </label>
        </div>

        {/* Botón de aplicar */}
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
