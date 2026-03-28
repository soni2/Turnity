"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IconArrowLeft, IconSettings, IconEdit } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/app/Components/Header";
import StatsCard from "../components/StatsCard";
import ServiciosList from "../components/ServicesList";
import HorariosPreview from "../components/SchedulePreview";

type NegocioDetalle = {
  id: string;
  nombre: string;
  logo_url: string | null;
  categoria: string;
  email_contacto: string;
  telefono_contacto: string;
  direccion: string | null;
  servicios: any[];
  horarios: Record<string, any>;
};

export default function BusinessDashboardLayout({
  data,
}: React.PropsWithChildren<{ data: [NegocioDetalle]; id: string }>) {
  const [activeTab, setActiveTab] = useState("resumen");

  // El dato ya viene resuelto desde page.tsx
  const negocio = data[0];

  // --- DATOS MOCK DE EJEMPLO MIENTRAS SE CONECTA EL BACKEND ---
  const mockServicios = negocio.servicios?.length ? negocio.servicios : [
    { id: "s1", nombre: "Corte Clásico", precio: 500, duracion: 30 },
    { id: "s2", nombre: "Arreglo de Barba", precio: 300, duracion: 20 },
    { id: "s3", nombre: "Masaje Facial", precio: 800, duracion: 45 },
    { id: "s4", nombre: "Tinte Profesional", precio: 1500, duracion: 90 },
  ];

  const mockCitas = [
    { id: "c1", cliente: "Carlos Rodríguez", servicio: "Corte Clásico", hora: "10:30 AM", estado: "Confirmada", color: "bg-green-100 text-green-700" },
    { id: "c2", cliente: "Luis Medina", servicio: "Arreglo de Barba", hora: "11:15 AM", estado: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
    { id: "c3", cliente: "Ana Paulino", servicio: "Tinte Profesional", hora: "02:00 PM", estado: "En curso", color: "bg-blue-100 text-blue-700" },
    { id: "c4", cliente: "Manuel Pérez", servicio: "Corte Clásico", hora: "04:30 PM", estado: "Confirmada", color: "bg-green-100 text-green-700" },
  ];

  const mockEquipo = [
    { id: "e1", nombre: "Alexander de la Cruz", rol: "Barbero Principal", especialidad: "Cortes Urbanos" },
    { id: "e2", nombre: "María Santos", rol: "Estilista", especialidad: "Colorimetría y Peinados" },
  ];

  if (!negocio) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header variant="app" />

      {/* Sub-header de navegación y perfil del negocio (Sticky) */}
      <div className="bg-white border-b sticky top-[64px] z-10 shadow-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fila superior: Volver y Acciones */}
          <div className="flex items-center justify-between py-4">
            <Link
              href="/dashboard"
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <IconArrowLeft size={16} className="mr-1" /> Volver a mis negocios
            </Link>

            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <IconSettings size={20} />
              </button>
            </div>
          </div>

          {/* Fila media: Info del negocio */}
          <div className="flex items-center gap-4 pb-6">
            <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 relative">
              {negocio.logo_url ? (
                <Image
                  src={negocio.logo_url}
                  alt={negocio.nombre}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 text-xl">
                  {/* {negocio.nombre.charAt(0)} */}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {negocio.nombre}
              </h1>
              <p className="text-sm text-gray-500">
                {negocio.categoria} • {negocio.direccion || "Sin dirección"}
              </p>
            </div>
          </div>

          {/* Fila inferior: Tabs de navegación */}
          <div className="flex space-x-8 overflow-x-auto no-scrollbar">
            {["Resumen", "Servicios", "Citas", "Equipo"].map((tab) => {
              const tabId = tab.toLowerCase();
              return (
                <button
                  key={tabId}
                  onClick={() => setActiveTab(tabId)}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tabId
                      ? "border-[var(--primary)] text-[var(--primary)]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido principal limitado por max-w-7xl */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "resumen" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Citas hoy" value="12" />
                <StatsCard title="Ingresos hoy" value="RD$ 8,500" />
                <StatsCard title="Nuevos clientes (Mes)" value="15" />
                <StatsCard title="Calificación media" value="4.8 ★" />
              </div>

              {/* Contenido inferior */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <ServiciosList servicios={mockServicios} />
                </div>
                <div className="lg:col-span-1 space-y-6">
                  <HorariosPreview horarios={negocio.horarios || {}} />

                  {/* Tarjeta de Contacto / Info */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        Información
                      </h3>
                      <button className="text-[var(--primary)] text-sm font-medium flex items-center gap-1 hover:underline">
                        <IconEdit size={14} /> Editar
                      </button>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>
                        <strong>Email:</strong>
                        <br />
                        {negocio.email_contacto || "No configurado"}
                      </p>
                      <p>
                        <strong>Teléfono:</strong>
                        <br />
                        {negocio.telefono_contacto || "No configurado"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "servicios" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <ServiciosList servicios={mockServicios} />
            </div>
          )}

          {activeTab === "citas" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Gestión de Citas Hoy</h3>
                <button className="text-sm bg-[var(--primary)] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all">Nueva Cita</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-sm text-gray-400">
                      <th className="pb-3 font-medium">Hora</th>
                      <th className="pb-3 font-medium">Cliente</th>
                      <th className="pb-3 font-medium">Servicio</th>
                      <th className="pb-3 font-medium">Estado</th>
                      <th className="pb-3 font-medium text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCitas.map((cita) => (
                      <tr key={cita.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-4 text-sm font-semibold text-gray-900">{cita.hora}</td>
                        <td className="py-4 text-sm font-medium text-gray-700">{cita.cliente}</td>
                        <td className="py-4 text-sm text-gray-500">{cita.servicio}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cita.color}`}>
                            {cita.estado}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-gray-400 hover:text-[var(--primary)] transition-colors"><IconEdit size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "equipo" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Mi Equipo</h3>
                <button className="text-sm bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all">Agregar Miembro</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockEquipo.map((miembro) => (
                  <div key={miembro.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-all flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mb-3 flex items-center justify-center text-gray-400 font-bold text-xl uppercase">
                      {miembro.nombre.charAt(0)}
                    </div>
                    <h4 className="font-bold text-gray-900 line-clamp-1">{miembro.nombre}</h4>
                    <p className="text-sm text-[var(--primary)] font-medium mb-1">{miembro.rol}</p>
                    <p className="text-xs text-gray-500">{miembro.especialidad}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
