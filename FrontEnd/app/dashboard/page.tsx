"use client";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Toolbar";
import StatsCard from "./components/StatsCard";
import ServiciosList from "./components/ServicesList";
import HorariosPreview from "./components/SchedulePreview";
import Header from "../Components/Header";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />
        <Topbar />

        <main className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard title="Citas hoy" value="12" />
            <StatsCard title="Ingresos" value="RD$ 8,500" />
            <StatsCard title="Clientes nuevos" value="5" />
          </div>

          {/* Contenido principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ServiciosList />
            <HorariosPreview />
          </div>
        </main>
      </div>
    </div>
  );
}
