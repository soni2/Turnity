"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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

export default function MisNegocioDashboard({
  negocio = [],
  loading = false,
}: React.PropsWithChildren<{ negocio?: Negocio[] | null; loading?: boolean }>) {
  const supabase = createClient();
  const [statsGenerales, setStatsGenerales] = useState({
    totalClientes: 0,
    completados: 0,
    cancelados: 0,
  });
  const [businessStats, setBusinessStats] = useState<
    Record<string, { ingresosHoy: number; citasHoy: number; ingresosTotal: number }>
  >({});
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!negocio || negocio.length === 0) {
      setLoadingStats(false);
      return;
    }

    const fetchStats = async () => {
      setLoadingStats(true);
      const negocioIds = negocio.map((n) => n.id);

      // 1. Obtener empleados de estos negocios
      const { data: empleados } = await supabase
        .from("empleado")
        .select("id, negocio_id")
        .in("negocio_id", negocioIds);

      if (!empleados || empleados.length === 0) {
        setLoadingStats(false);
        return;
      }

      const empleadoIds = empleados.map((e) => e.id);
      const empleadoToNegocio = empleados.reduce((acc, emp) => {
        acc[emp.id] = emp.negocio_id;
        return acc;
      }, {} as Record<string, string>);

      // 2. Obtener turnos
      const today = new Date().toISOString().split("T")[0];
      const { data: turnos } = await supabase
        .from("turno")
        .select(`
          id,
          estado,
          fecha,
          cliente_id,
          empleado_id,
          servicio:servicio_id(precio)
        `)
        .in("empleado_id", empleadoIds);

      if (turnos) {
        const uniqueClients = new Set(turnos.map((t) => t.cliente_id).filter(Boolean));
        const completados = turnos.filter((t) => t.estado === "completado").length;
        const cancelados = turnos.filter((t) => t.estado === "cancelado").length;

        setStatsGenerales({
          totalClientes: uniqueClients.size,
          completados,
          cancelados,
        });

        // Calcular stats por negocio
        const bStats: Record<string, { ingresosHoy: number; citasHoy: number; ingresosTotal: number }> = {};
        negocio.forEach((n) => {
          bStats[n.id] = { ingresosHoy: 0, citasHoy: 0, ingresosTotal: 0 };
        });

        turnos.forEach((t) => {
          const negId = empleadoToNegocio[t.empleado_id];
          if (!negId || !bStats[negId]) return;

          const isHoy = t.fecha === today;
          const isCompletado = t.estado === "completado";
          const isCancelado = t.estado === "cancelado";
          const precio = (t.servicio as any)?.precio || 0;

          if (isHoy && !isCancelado) {
            bStats[negId].citasHoy += 1;
          }
          if (isCompletado) {
            bStats[negId].ingresosTotal += precio;
            if (isHoy) bStats[negId].ingresosHoy += precio;
          }
        });

        setBusinessStats(bStats);
      }
      setLoadingStats(false);
    };

    fetchStats();
  }, [negocio, supabase]);

  // Transformación de datos para el gráfico radial (Ingresos Totales por negocio)
  const chartData = (negocio || []).map((n, index) => ({
    name: n.nombre,
    value: businessStats[n.id]?.ingresosTotal || 0,
    fill: index === 0 ? "var(--primary)" : index === 1 ? "#8b5cf6" : "#ec4899",
  })).filter(item => item.value > 0);

  // Stats array dinámico
  const dinamicoStats = [
    {
      id: 1,
      label: "Total Clientes",
      value: loadingStats ? "..." : String(statsGenerales.totalClientes),
      icon: <IconUsers className="text-blue-600" />,
    },
    {
      id: 2,
      label: "Completados",
      value: loadingStats ? "..." : String(statsGenerales.completados),
      icon: <IconCheck className="text-green-600" />,
    },
    {
      id: 3,
      label: "Cancelados",
      value: loadingStats ? "..." : String(statsGenerales.cancelados),
      icon: <IconX className="text-red-600" />,
    },
  ];

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
            {dinamicoStats.map((stat) => (
              <div
                key={stat.id}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
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
                              <span className="text-gray-400">Ingresos Hoy:</span>{" "}
                              <span className="font-bold text-green-600">
                                {loadingStats ? "..." : `+$${businessStats[n.id]?.ingresosHoy || 0}`}
                              </span>
                            </div>
                            <div className="text-[11px]">
                              <span className="text-gray-400">Citas Hoy:</span>{" "}
                              <span className="font-bold text-gray-700">
                                {loadingStats ? "..." : businessStats[n.id]?.citasHoy || 0}
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
                {chartData.length > 0 ? (
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
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                    {loadingStats ? "Cargando..." : "No hay ingresos registrados aún"}
                  </div>
                )}
              </div>

              <div className="space-y-3 mt-4">
                {chartData.map((item, index) => (
                  <div
                    key={index}
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
                      ${item.value.toLocaleString("es-DO")}
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
