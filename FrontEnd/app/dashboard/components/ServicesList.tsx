export default function ServicesList() {
  const servicios = [
    { id: 1, nombre: "Corte", precio: 500 },
    { id: 2, nombre: "Barba", precio: 300 },
  ];

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <h3 className="font-semibold mb-4">Servicios</h3>

      <div className="space-y-3">
        {servicios.map((s) => (
          <div
            key={s.id}
            className="flex justify-between items-center border-b pb-2"
          >
            <span>{s.nombre}</span>
            <span className="text-sm text-gray-500">RD$ {s.precio}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
