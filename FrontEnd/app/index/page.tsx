"use client";
import { useState } from "react";
import { SearchIcon } from "../Components/Icons";
import SideBar from "../Components/SideBar";
import Main from "../Components/Main";
import { HeaderTwo } from "../Components/Header";

export default function Home() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [rangoPrecio, setRangoPrecio] = useState([0, 100]);
  const [ordenarPor, setOrdenarPor] = useState("recomendados");

  const categorias = ["Todas", "Barbería", "Salón", "Uñas"];

  const servicios = [
    {
      id: 1,
      title: "La Esquina del Flow Barber Shop",
      description: "Corte de cabello",
      rating: 5,
      precio: 25,
      categoria: "Barbería",
    },
    {
      id: 2,
      title: "D'Clase Traditional Spa",
      description: "Afeitado tradicional",
      rating: 5,
      precio: 20,
      categoria: "Barbería",
    },
    {
      id: 3,
      title: "Peluquería Niurka & Mas",
      description: "Tinte completo",
      rating: 3,
      precio: 45,
      categoria: "Salón",
    },
    {
      id: 4,
      title: "Glamour Dominicano Beauty Center",
      description: "Peinado de fiesta",
      rating: 3,
      precio: 35,
      categoria: "Salón",
    },
    {
      id: 5,
      title: "Uñas de Diosa Nail Bar",
      description: "Manicura básica",
      rating: 2,
      precio: 15,
      categoria: "Uñas",
    },
    {
      id: 6,
      title: "Pies de Seda Spa",
      description: "Pedicura spa",
      rating: 4,
      precio: 30,
      categoria: "Uñas",
    },
    {
      id: 7,
      title: "El Galán Grooming Studio",
      description: "Barba y bigote",
      rating: 5,
      precio: 15,
      categoria: "Barbería",
    },
    {
      id: 8,
      title: "Piki-Paki Kids Cut",
      description: "Corte infantil",
      rating: 4,
      precio: 18,
      categoria: "Barbería",
    },
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con búsqueda */}
      <HeaderTwo />
      {/* <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar servicios, estilistas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>
      </div> */}

      {/* Contenido principal con sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <SideBar
            categorias={categorias}
            rangoPrecio={rangoPrecio}
            setRangoPrecio={setRangoPrecio}
          />
          <Main
            categorias={categorias}
            categoriaActiva={categoriaActiva}
            ordenarPor={ordenarPor}
            servicios={servicios}
            setCategoriaActiva={setCategoriaActiva}
            setOrdenarPor={setOrdenarPor}
            renderStars={renderStars}
          />
        </div>
      </div>

      {/* Barra de navegación inferior (móvil) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center p-2 text-black">
            <span className="text-xs">Inicio</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-500">
            <span className="text-xs">Agenda</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-500">
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </div>

      {/* Barra de navegación superior (escritorio) */}
      {/* <div className="hidden lg:block fixed bottom-0 left-0 right-0 bg-white border-t py-3">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-center space-x-12">
            <button className="flex items-center space-x-2 text-black font-medium">
              <span>Inicio</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-black transition-colors">
              <span>Agenda</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-black transition-colors">
              <span>Perfil</span>
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
}
