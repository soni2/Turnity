"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function CentroPage() {
  const [favorito, setFavorito] = useState(false);
  const [selectedDay, setSelectedDay] = useState("lun");
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Datos del centro (basado en la imagen)
  const centro = {
    id: 1,
    nombre: "La Esquina del Flow Barber Shop",
    categoria: "Barbería",
    rating: 5.0,
    reviews: 128,
    direccion: "Calle Principal #123, Santo Domingo",
    telefono: "+1 809-555-0123",
    horario: "Lun - Sáb: 9:00 AM - 8:00 PM",
    descripcion:
      "Barbería profesional especializada en cortes modernos y tradicionales. Ambiente único y estilistas expertos.",
    imagenes: [
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&auto=format&fit=crop",
    ],
    servicios: [
      {
        id: 1,
        nombre: "Corte de cabello",
        descripcion: "Corte clásico o moderno",
        precio: 25,
        duracion: "45 min",
        rating: 5.0,
        disponible: true,
      },
      {
        id: 2,
        nombre: "Afeitado tradicional",
        descripcion: "Con toalla caliente y navaja",
        precio: 20,
        duracion: "30 min",
        rating: 5.0,
        disponible: true,
      },
      {
        id: 3,
        nombre: "Barba y bigote",
        descripcion: "Diseño y perfilado",
        precio: 15,
        duracion: "30 min",
        rating: 5.0,
        disponible: true,
      },
      {
        id: 4,
        nombre: "Corte + Barba",
        descripcion: "Combo completo",
        precio: 35,
        duracion: "75 min",
        rating: 5.0,
        disponible: false,
      },
    ],
    profesionales: [
      {
        id: 1,
        nombre: "Carlos Méndez",
        especialidad: "Cortes modernos",
        rating: 5.0,
      },
      {
        id: 2,
        nombre: "Juan Pérez",
        especialidad: "Afeitado tradicional",
        rating: 5.0,
      },
    ],
    horariosDisponibles: {
      lun: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      mar: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      mie: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      jue: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      vie: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      sab: ["9:00", "10:00", "11:00", "12:00", "13:00"],
    },
  };

  const diasSemana = [
    { id: "lun", nombre: "Lun" },
    { id: "mar", nombre: "Mar" },
    { id: "mie", nombre: "Mié" },
    { id: "jue", nombre: "Jue" },
    { id: "vie", nombre: "Vie" },
    { id: "sab", nombre: "Sáb" },
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <p
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          >
            ♥
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/busqueda"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {/* <ChevronLeftIcon className="h-5 w-5" /> */}
              </Link>
              <h1 className="text-xl font-semibold">{centro.nombre}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                {/* <ShareIcon className="h-5 w-5" /> */}
              </button>
              <button
                onClick={() => setFavorito(!favorito)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {/* {favorito ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )} */}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Información del centro */}
          <div className="lg:col-span-2">
            {/* Imágenes */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* {centro.imagenes.map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-64 rounded-lg overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={`${centro.nombre} - Imagen ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))} */}
            </div>

            {/* Información básica */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-500">
                    {centro.categoria}
                  </span>
                  <h2 className="text-2xl font-bold mt-1">{centro.nombre}</h2>
                </div>
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                  {/* <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" /> */}
                  <span className="font-semibold ml-1">{centro.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({centro.reviews})
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{centro.descripcion}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  {/* <MapPinIcon className="h-5 w-5 mr-2 flex-shrink-0" /> */}
                  <span>{centro.direccion}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  {/* <ClockIcon className="h-5 w-5 mr-2 flex-shrink-0" /> */}
                  <span>{centro.horario}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  {/* <PhoneIcon className="h-5 w-5 mr-2 flex-shrink-0" /> */}
                  <span>{centro.telefono}</span>
                </div>
              </div>
            </div>

            {/* Servicios */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Servicios</h3>
              <div className="space-y-4">
                {centro.servicios.map((servicio) => (
                  <div
                    key={servicio.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedService === servicio.id
                        ? "border-black ring-2 ring-black ring-opacity-20"
                        : "border-gray-200 hover:border-gray-300"
                    } ${!servicio.disponible ? "opacity-50" : ""}`}
                    onClick={() =>
                      servicio.disponible && setSelectedService(servicio.id)
                    }
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{servicio.nombre}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {servicio.descripcion}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-sm text-gray-500">
                            {servicio.duracion}
                          </span>
                          <div className="flex items-center">
                            {renderStars(servicio.rating)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-lg">
                          ${servicio.precio}
                        </span>
                        {!servicio.disponible && (
                          <p className="text-xs text-red-500 mt-1">
                            No disponible
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profesionales */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">
                Nuestros Estilistas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {centro.profesionales.map((pro) => (
                  <div
                    key={pro.id}
                    className="flex items-center p-3 border rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                      <h4 className="font-medium">{pro.nombre}</h4>
                      <p className="text-xs text-gray-500">
                        {pro.especialidad}
                      </p>
                      <div className="flex items-center mt-1">
                        {/* <StarIcon className="h-3 w-3 text-yellow-400 fill-yellow-400" /> */}
                        <span className="text-xs ml-1">{pro.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha - Reserva sticky */}

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Reservar cita</h3>

              {/* Selector de servicio */}
              {selectedService && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Servicio seleccionado</p>
                  <p className="font-medium">
                    {
                      centro.servicios.find((s) => s.id === selectedService)
                        ?.nombre
                    }
                  </p>
                </div>
              )}

              {/* Selector de día */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona un día
                </label>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {diasSemana.map((dia) => (
                    <button
                      key={dia.id}
                      onClick={() => {
                        setSelectedDay(dia.id);
                        setSelectedTime(""); // Resetear hora al cambiar día
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                        selectedDay === dia.id
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {dia.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Horarios disponibles */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona un horario
                </label>

                {isMobile ? (
                  // Selector tipo rueda para móvil
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: "right 0.75rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="">Selecciona una hora</option>
                    {centro.horariosDisponibles[
                      selectedDay as keyof typeof centro.horariosDisponibles
                    ]?.map((hora) => (
                      <option key={hora} value={hora}>
                        {hora}
                      </option>
                    ))}
                  </select>
                ) : (
                  // Botones de selección única para desktop
                  <div>
                    <div className="grid grid-cols-3 gap-2">
                      {centro.horariosDisponibles[
                        selectedDay as keyof typeof centro.horariosDisponibles
                      ]?.map((hora) => (
                        <button
                          key={hora}
                          onClick={() => setSelectedTime(hora)}
                          className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                            selectedTime === hora
                              ? "bg-black text-white border-black"
                              : "hover:border-black"
                          }`}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                    {selectedTime && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ Horario seleccionado: {selectedTime}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Botón de reserva */}
              <button
                disabled={!selectedService || !selectedTime}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  selectedService && selectedTime
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {!selectedService
                  ? "Selecciona un servicio"
                  : !selectedTime
                    ? "Selecciona un horario"
                    : "Confirmar reserva"}
              </button>

              {/* Información adicional */}
              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Cancelación gratis hasta 2 horas antes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
