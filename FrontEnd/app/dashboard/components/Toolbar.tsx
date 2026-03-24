export default function Topbar() {
  return (
    <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <div className="flex items-center gap-4">
        <button className="text-sm bg-black text-white px-4 py-2 rounded-lg">
          + Nuevo servicio
        </button>
      </div>
    </div>
  );
}
