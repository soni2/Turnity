type Servicio = {
  id: string;
  nombre: string;
  precio: number;
  duracion?: number; // en mins
};

export default function ServicesList({ servicios = [] }: { servicios?: Servicio[] }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Servicios</h3>
      </div>

      <div className="space-y-3">
        {servicios.length > 0 ? (
          servicios.map((s, idx) => (
            <div
              key={s.id || idx}
              className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium text-gray-900">{s.nombre}</p>
                {s.duracion && <p className="text-xs text-gray-500">{s.duracion} min</p>}
              </div>
              <span className="text-sm font-semibold text-gray-900">RD$ {s.precio}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No hay servicios registrados.</p>
        )}
      </div>
    </div>
  );
}
