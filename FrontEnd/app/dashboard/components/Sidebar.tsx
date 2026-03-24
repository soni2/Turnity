export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r p-6 hidden md:block">
      <h2 className="text-xl font-bold mb-6">Mi Negocio</h2>

      <nav className="space-y-4">
        <p className="font-medium text-gray-700">Dashboard</p>
        <p className="text-gray-500">Servicios</p>
        <p className="text-gray-500">Citas</p>
        <p className="text-gray-500">Equipo</p>
        <p className="text-gray-500">Configuración</p>
      </nav>
    </aside>
  );
}
