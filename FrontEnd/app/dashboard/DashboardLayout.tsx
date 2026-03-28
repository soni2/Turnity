"use client";
import React from "react";
import {
  IconPlus,
  IconBriefcase,
  IconMapPin,
  IconArrowRight,
  IconUsers,
  IconCheck,
  IconX,
  IconTrendingUp,
  IconDownload,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Negocio } from "./hooks/useDashboard";
import Header from "../Components/Header";

// Datos harcodeados para el ejemplo
const STATS_GENERALES = [
  {
    id: 1,
    label: "Total Clientes",
    value: "5,000",
    change: "+2.5%",
    icon: <IconUsers className="text-blue-600" />,
  },
  {
    id: 2,
    label: "Completados",
    value: "5,000",
    change: "+2.5%",
    icon: <IconCheck className="text-green-600" />,
  },
  {
    id: 3,
    label: "Cancelados",
    value: "5,00",
    change: "+2.5%",
    icon: <IconX className="text-red-600" />,
  },
];

export default function MisNegocioDashboard({
  negocio = [],
  loading = false,
}: React.PropsWithChildren<{ negocio?: Negocio[] | null; loading?: boolean }>) {
  // Transformación de datos para el gráfico radial (Ingresos del día por negocio)
  const chartData = (negocio || []).map((n, index) => ({
    name: n.nombre,
    value: 4 + 1000, // Hardcoded: Ingreso del día
    fill: index === 0 ? "var(--primary)" : index === 1 ? "#8b5cf6" : "#ec4899",
  }));

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
      <Header variant="app" />
      <main className="flex-1 py-24 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header con Acción */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Control
              </h1>
              <p className="text-gray-500 mt-1">
                Resumen general de todos tus establecimientos
              </p>
            </div>
            <button
              className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
              onClick={() => alert("Función de exportar reporte en desarrollo")}
            >
              <IconDownload size={20} />
              <span>Exportar reporte</span>
            </button>
          </div>

          {/* 1. Stats Cards (Como en la imagen) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {STATS_GENERALES.map((stat) => (
              <div
                key={stat.id}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
                      {stat.change}
                    </span>
                    <p className="text-sm text-gray-500 font-medium">
                      {stat.label}
                    </p>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h2>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">{stat.icon}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 2. Lista de Negocio (Columna Izquierda/Centro) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <IconBriefcase size={20} /> Mis Establecimientos
                </h3>
                <Link
                  href="/business/registration"
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:shadow-md transition-all"
                >
                  <IconPlus size={18} />
                  <span>Nuevo negocio</span>
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-32 bg-gray-100 animate-pulse rounded-2xl"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {(negocio || []).map((n) => (
                    <Link
                      key={n.id}
                      href={`/dashboard/${n.id}`}
                      className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-[var(--primary)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {n.logo_url ? (
                            <Image
                              src={n.logo_url}
                              alt={n.nombre}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          ) : (
                            <IconBriefcase className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 group-hover:text-[var(--primary)] transition-colors">
                            {n.nombre}
                          </h4>
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <IconMapPin size={14} /> {n.ciudad || "RD"}
                          </div>
                          <div className="mt-2 flex gap-3">
                            {/* Mini métricas por negocio */}
                            <div className="text-[11px]">
                              <span className="text-gray-400">Hoy:</span>{" "}
                              <span className="font-bold text-green-600">
                                +$2,400
                              </span>
                            </div>
                            <div className="text-[11px]">
                              <span className="text-gray-400">Citas:</span>{" "}
                              <span className="font-bold text-gray-700">
                                12
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                            Status
                          </p>
                          <span className="text-xs font-semibold text-green-500">
                            Activo
                          </span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                          <IconArrowRight size={20} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Gráfico Radial de Ingresos (Columna Derecha) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">
                  Distribución de Ingresos
                </h3>
                <IconTrendingUp size={20} className="text-[var(--primary)]" />
              </div>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 mt-4">
                {chartData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-gray-600 truncate max-w-[120px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      ${item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
