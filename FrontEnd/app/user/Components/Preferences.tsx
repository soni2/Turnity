import { IconSettings } from "@tabler/icons-react";

export default function Preferences() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="font-bold text-lg mb-5 text-gray-900 flex items-center gap-2">
        <IconSettings size={20} className="text-gray-600" /> Preferencias
      </h2>
      <div className="space-y-4">
        <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
          <span className="text-sm font-medium text-gray-700">Notificaciones E-mail</span>
          <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]" />
        </label>
        <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
          <span className="text-sm font-medium text-gray-700">Recordatorios de citas</span>
          <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]" />
        </label>
      </div>
    </div>
  );
}
