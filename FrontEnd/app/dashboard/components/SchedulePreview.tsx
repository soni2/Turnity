type Horarios = Record<string, { abierto: boolean; apertura: string; cierre: string }>;

export default function HorariosPreview({ horarios }: { horarios?: Horarios }) {
  const mapDias = [
    { key: "lunes", label: "Lunes" },
    { key: "martes", label: "Martes" },
    { key: "miercoles", label: "Miércoles" },
    { key: "jueves", label: "Jueves" },
    { key: "viernes", label: "Viernes" },
    { key: "sabado", label: "Sábado" },
    { key: "domingo", label: "Domingo" },
  ];

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4">Horarios</h3>

      <div className="space-y-3 mt-4">
        {!horarios || Object.keys(horarios).length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-2">Sin horarios configurados.</p>
        ) : (
          mapDias.map((dia) => {
            const config = horarios[dia.key];
            const isOpen = config?.abierto;
            return (
              <div key={dia.key} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <span className="text-gray-600 font-medium">{dia.label}</span>
                <span className={`font-medium ${isOpen ? "text-gray-900" : "text-gray-400"}`}>
                  {isOpen ? `${config.apertura} - ${config.cierre}` : "Cerrado"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
