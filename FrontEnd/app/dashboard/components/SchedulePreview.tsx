export default function HorariosPreview() {
  const horarios = {
    lunes: "9:00 - 20:00",
    martes: "9:00 - 20:00",
    domingo: "Cerrado",
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <h3 className="font-semibold mb-4">Horarios</h3>

      <div className="space-y-2">
        {Object.entries(horarios).map(([dia, horario]) => (
          <div key={dia} className="flex justify-between text-sm">
            <span className="capitalize">{dia}</span>
            <span>{horario}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
