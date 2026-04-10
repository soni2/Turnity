"use client";
import React, { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import SideBar from "../Components/SideBar";
import Main from "../Components/Main";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { createClient } from "@/lib/supabase/client";
import MobileNav from "../Components/MobileNav";
import { useRouter } from "next/navigation";

// ─── Helpers de disponibilidad ────────────────────────────────────────────────

const DIAS_KEYS: Record<number, string> = {
  0: "domingo",
  1: "lunes",
  2: "martes",
  3: "miercoles",
  4: "jueves",
  5: "viernes",
  6: "sabado",
};

type HorarioDia = { abierto: boolean; apertura: string; cierre: string };
type Horarios = Record<string, HorarioDia>;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** Devuelve true si el negocio está abierto en este momento exacto. */
function isAbiertoAhora(horarios: Horarios): boolean {
  const now = new Date();
  const diaKey = DIAS_KEYS[now.getDay()];
  const config = horarios?.[diaKey];
  if (!config?.abierto) return false;
  const currentMin = now.getHours() * 60 + now.getMinutes();
  return currentMin >= timeToMinutes(config.apertura) && currentMin < timeToMinutes(config.cierre);
}

/** Devuelve true si el negocio tiene horario configurado para el día de hoy,
 *  sin importar si ya es tarde — solo verifica que el negocio opera este día. */
function isDisponibleHoy(horarios: Horarios): boolean {
  const now = new Date();
  const diaKey = DIAS_KEYS[now.getDay()];
  const config = horarios?.[diaKey];
  return config?.abierto === true;
}

// ─── Componente principal ─────────────────────────────────────────────────────

function ExploreContent() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";

  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [ordenarPor, setOrdenarPor] = useState("recomendados");
  const [showFilters, setShowFilters] = useState(false);
  const [ratingMin, setRatingMin] = useState(0);
  const [abiertoAhora, setAbiertoAhora] = useState(false);
  const [disponibleHoy, setDisponibleHoy] = useState(false);

  const [rawServicios, setRawServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const categorias = [
    "Todas",
    "Barbería",
    "Salón de belleza",
    "Centro de uñas",
    "Spa",
    "Centro de estética",
    "Peluquería infantil",
    "Centro de depilación",
    "Otro",
  ];

  // Fetch (sin filtros de disponibilidad ni rating — esos se aplican en cliente)
  useEffect(() => {
    async function fetchNegocios() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchParam) params.append("search", searchParam);
        if (categoriaActiva !== "Todas") params.append("categoria", categoriaActiva);

        const res = await fetch(`/api/explore?${params.toString()}`);
        if (!res.ok) throw new Error("Error obteniendo resultados");
        const json = await res.json();
        setRawServicios(json.data || []);
      } catch (err) {
        console.error("Error fetching api:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNegocios();
  }, [searchParam, categoriaActiva]);

  // Filtrado + ordenado en cliente (rating, disponibilidad)
  const servicios = useMemo(() => {
    let result = [...rawServicios];

    // Filtro de calificación mínima
    if (ratingMin > 0) {
      result = result.filter((n) => {
        if (n.rating === "Nuevo") return ratingMin <= 0;
        return Number(n.rating) >= ratingMin;
      });
    }

    // Filtro "Abierto ahora"
    if (abiertoAhora) {
      result = result.filter((n) => isAbiertoAhora(n.horarios || {}));
    }

    // Filtro "Disponible hoy"
    if (disponibleHoy) {
      result = result.filter((n) => isDisponibleHoy(n.horarios || {}));
    }

    // Ordenar
    if (ordenarPor === "mejor-valorados") {
      result.sort((a, b) => {
        const valA = a.rating === "Nuevo" ? 0 : Number(a.rating);
        const valB = b.rating === "Nuevo" ? 0 : Number(b.rating);
        return valB - valA;
      });
    }

    return result;
  }, [rawServicios, ratingMin, abiertoAhora, disponibleHoy, ordenarPor]);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(rating) ? "text-amber-400" : "text-gray-300"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={star <= Math.round(rating) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="app" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Botón Filtros (Móvil) */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white border border-gray-300 shadow-sm text-black py-2.5 rounded-lg text-sm font-medium flex justify-center items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clipRule="evenodd"
              />
            </svg>
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            {/* Badge de filtros activos */}
            {(ratingMin > 0 || abiertoAhora || disponibleHoy) && (
              <span className="ml-1 bg-[var(--primary)] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {[ratingMin > 0, abiertoAhora, disponibleHoy].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <SideBar
              categorias={categorias}
              categoriaActiva={categoriaActiva}
              setCategoriaActiva={setCategoriaActiva}
              ratingMin={ratingMin}
              setRatingMin={setRatingMin}
              abiertoAhora={abiertoAhora}
              setAbiertoAhora={setAbiertoAhora}
              disponibleHoy={disponibleHoy}
              setDisponibleHoy={setDisponibleHoy}
            />
          </div>

          {loading ? (
            <main className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-full animate-pulse border border-gray-100">
                    <div className="w-full h-52 bg-gray-200 rounded-xl mb-4" />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0" />
                      <div className="h-5 bg-gray-200 rounded w-2/3" />
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                    </div>
                    <div className="mt-auto flex flex-col gap-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-10 bg-[var(--primary)]/20 rounded-lg w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </main>
          ) : (
            <Main
              ordenarPor={ordenarPor}
              servicios={servicios}
              setOrdenarPor={setOrdenarPor}
              renderStars={renderStars}
              busqueda={searchParam}
              setBusqueda={() => {}}
              activeFilters={{ ratingMin, abiertoAhora, disponibleHoy }}
            />
          )}
        </div>
      </div>

      <MobileNav />
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl font-semibold">Cargando...</p>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
