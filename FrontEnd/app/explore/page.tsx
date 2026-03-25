"use client";
import { useEffect, useState } from "react";
import SideBar from "../Components/SideBar";
import Main from "../Components/Main";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function Home() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [rangoPrecio, setRangoPrecio] = useState([0, 100]);
  const [ordenarPor, setOrdenarPor] = useState("recomendados");
  const [showFilters, setShowFilters] = useState(false);
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categorias = ["Todas", "Barbería", "Salón", "Uñas"];

  useEffect(() => {
    async function fetchNegocios() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("negocio")
        .select(`
          id,
          nombre,
          descripcion,
          ciudad,
          categoria
        `);

      if (error) {
        console.error("Error fetching negocios:", error);
      } else {
        // Mapear los datos al formato que espera el componente
        const formattedData = data.map((n) => ({
          id: n.id,
          title: n.nombre,
          description: n.descripcion || "Sin descripción disponible",
          rating: 5, // Placeholder ya que no hay rating en la tabla todavía
          precio: 0, // Placeholder
          categoria: n.categoria || "Barbería", // Usar la categoría real o un default
        }));
        setServicios(formattedData);
      }
      setLoading(false);
    }

    fetchNegocios();
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? "text-yellow-400" : "text-gray-300"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">Cargando negocios...</p>
      </div>
    );
  }

  const serviciosFiltrados = servicios.filter(servicio => {
    // Filtro de categoría
    if (categoriaActiva !== "Todas" && servicio.categoria !== categoriaActiva) {
      return false;
    }
    // Filtro de precio (asumiendo que los servicios tienen precio)
    if (servicio.precio > rangoPrecio[1]) {
      return false;
    }
    // Filtro de búsqueda
    if (busqueda && !servicio.title.toLowerCase().includes(busqueda.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header variant="app" />

      {/* Contenido principal con sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 lg:pb-8">
        
        {/* Botón Filtros (Móvil) */}
        <div className="lg:hidden mb-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white border border-gray-300 shadow-sm text-black py-2.5 rounded-lg text-sm font-medium flex justify-center items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <SideBar
              categorias={categorias}
              rangoPrecio={rangoPrecio}
              setRangoPrecio={setRangoPrecio}
              categoriaActiva={categoriaActiva}
              setCategoriaActiva={setCategoriaActiva}
            />
          </div>
          <Main
            ordenarPor={ordenarPor}
            servicios={serviciosFiltrados}
            setOrdenarPor={setOrdenarPor}
            renderStars={renderStars}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
          />
        </div>
      </div>

      {/* Barra de navegación inferior (móvil) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--primary)] py-2 z-50">
        <div className="flex justify-around items-center h-12">
          <Link href="/explore" className="flex flex-col items-center justify-center p-2">
            <span className="text-sm font-bold text-white hover:opacity-80 transition-opacity">Inicio</span>
          </Link>
          <Link href="/agenda" className="flex flex-col items-center justify-center p-2">
            <span className="text-sm font-medium text-gray-200 hover:text-white transition-opacity">Agenda</span>
          </Link>
          <Link href="/user" className="flex flex-col items-center justify-center p-2">
            <span className="text-sm font-medium text-gray-200 hover:text-white transition-opacity">Perfil</span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
