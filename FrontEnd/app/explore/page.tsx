"use client";
import React, { useEffect, useState, Suspense, use } from "react";
import { useSearchParams } from "next/navigation";

import SideBar from "../Components/SideBar";
import Main from "../Components/Main";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import MobileNav from "../Components/MobileNav";
import { useRouter } from "next/navigation";

function ExploreContent() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [ordenarPor, setOrdenarPor] = useState("recomendados");
  const [showFilters, setShowFilters] = useState(false);
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

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


  useEffect(() => {
    async function fetchNegocios() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchParam) params.append("search", searchParam);
        if (categoriaActiva !== "Todas")
          params.append("categoria", categoriaActiva);

        const res = await fetch(`/api/explore?${params.toString()}`);
        if (!res.ok) throw new Error("Error obteniendo resultados");
        const json = await res.json();
        const formattedData = json.data || [];

        // Sorting
        if (ordenarPor === "mejor-valorados") {
          formattedData.sort((a: any, b: any) => {
            const valA = a.rating === "Nuevo" ? 0 : Number(a.rating);
            const valB = b.rating === "Nuevo" ? 0 : Number(b.rating);
            return valB - valA;
          });
        }

        setServicios(formattedData);
      } catch (err) {
        console.error("Error fetching api:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNegocios();
  }, [searchParam, categoriaActiva, ordenarPor]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= Math.round(rating) ? "text-amber-400" : "text-gray-300"
            }
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
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header variant="app" />

      {/* Contenido principal con sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Botón Filtros (Móvil) */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white border border-gray-300 shadow-sm text-black py-2.5 rounded-lg text-sm font-medium flex justify-center items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clipRule="evenodd"
              />
            </svg>
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <SideBar
              categorias={categorias}
              categoriaActiva={categoriaActiva}
              setCategoriaActiva={setCategoriaActiva}
            />
          </div>

          {loading ? (
            <main className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-full animate-pulse border border-gray-100"
                  >
                    <div className="w-full h-52 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0"></div>
                      <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                    <div className="mt-auto flex flex-col gap-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-10 bg-[var(--primary)]/20 rounded-lg w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          ) : (
            <Main
              ordenarPor={ordenarPor}
              servicios={servicios} // Filtrado ocurre en bdd
              setOrdenarPor={setOrdenarPor}
              renderStars={renderStars}
              busqueda={searchParam}
              setBusqueda={() => {}}
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
