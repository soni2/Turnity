"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CentroPage() {
  const params = useParams();
  const id = params.id as string;

  const [centro, setCentro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favorito, setFavorito] = useState(false);
  const [selectedDay, setSelectedDay] = useState("lun");
  const [selectedService, setSelectedService] = useState<string | null>(null);
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

  // Fetch de los datos del centro
  useEffect(() => {
    async function fetchCentroData() {
      const supabase = createClient();

      // 1. Obtener datos del negocio
      const { data: negocio, error: negocioError } = await supabase
        .from("negocio")
        .select("*")
        .eq("id", id)
        .single();

      if (negocioError) {
        console.error("Error fetching negocio:", negocioError);
        setLoading(false);
        return;
      }

      // 2. Obtener servicios
      const { data: servicios, error: serviciosError } = await supabase
        .from("servicio")
        .select("*")
        .eq("negocio_id", id)
        .eq("activo", true);

      // 3. Obtener empleados
      const { data: empleados, error: empleadosError } = await supabase
        .from("empleado")
        .select(`
          id,
          biografia,
          foto_url,
          usuario:usuario_id (nombre)
        `)
        .eq("negocio_id", id)
        .eq("activo", true);

      // Derivar texto de horario y horarios disponibles desde negocio.horarios (JSON guardado en BD)
      const horariosRaw: Record<string, { abierto: boolean; apertura: string; cierre: string }> =
        negocio.horarios || {};

      const DIAS_MAP: Record<string, string> = {
        lunes: "lun",
        martes: "mar",
        miercoles: "mie",
        jueves: "jue",
        viernes: "vie",
        sabado: "sab",
        domingo: "dom",
      };

      // Generar slots de horas en intervalos de 1h dado apertura y cierre "HH:mm"
      function generarSlots(apertura: string, cierre: string): string[] {
        const slots: string[] = [];
        const [hIni, mIni] = apertura.split(":").map(Number);
        const [hFin] = cierre.split(":").map(Number);
        for (let h = hIni; h < hFin; h++) {
          slots.push(`${String(h).padStart(2, "0")}:${String(mIni).padStart(2, "0")}`);
        }
        return slots;
      }

      const horariosDisponibles: Record<string, string[]> = {};
      const diasAbiertos: string[] = [];

      Object.entries(horariosRaw).forEach(([dia, config]) => {
        const clave = DIAS_MAP[dia] ?? dia;
        if (config.abierto) {
          horariosDisponibles[clave] = generarSlots(config.apertura, config.cierre);
          diasAbiertos.push(dia.charAt(0).toUpperCase() + dia.slice(1, 3));
        }
      });

      const horarioTexto =
        diasAbiertos.length > 0
          ? `${diasAbiertos.join(" - ")}: ${horariosRaw[Object.keys(horariosRaw).find((d) => horariosRaw[d]?.abierto) ?? ""]?.apertura ?? ""} - ${horariosRaw[Object.keys(horariosRaw).find((d) => horariosRaw[d]?.abierto) ?? ""]?.cierre ?? ""}`
          : "Sin horario registrado";

      // Fotos del negocio: viene como string[] JSON desde la BD
      const fotosNegocio: string[] = Array.isArray(negocio.fotos)
        ? negocio.fotos
        : [];

      const formattedCentro = {
        ...negocio,
        categoria: negocio.categoria || "Sin categoría",
        telefono: negocio.telefono_contacto || negocio.telefono || "Sin teléfono",
        horario: horarioTexto,
        imagenes: fotosNegocio,
        servicios: (servicios || []).map((s: any) => ({
          ...s,
          disponible: s.activo !== false,
        })),
        profesionales: ((empleados as any[]) || []).map((e) => ({
          id: e.id,
          nombre: e.usuario?.nombre || "Profesional",
          especialidad: e.biografia || "Especialista",
          foto_url: e.foto_url || null,
          rating: 5.0,
        })),
        horariosDisponibles,
      };

      setCentro(formattedCentro);
      setLoading(false);
    }

    if (id) fetchCentroData();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">Cargando perfil del negocio...</p>
      </div>
    );
  }

  if (!centro) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-bold mb-4">Negocio no encontrado</h2>
          <Link href="/explore" className="text-blue-600 hover:underline">
            Volver a la exploración
          </Link>
        </div>
      </div>
    );
  }

  const handleReserva = async () => {
    if (!selectedService || !selectedTime || !centro) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Debes iniciar sesión para reservar.");
      return;
    }

    // Calcular fecha (el próximo día de la semana seleccionado)
    const hoy = new Date();
    const dias = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
    const targetDayIndex = dias.indexOf(selectedDay);
    const diff = (targetDayIndex + 7 - hoy.getDay()) % 7;
    const fechaReserva = new Date(hoy);
    fechaReserva.setDate(hoy.getDate() + (diff === 0 ? 7 : diff));

    // Obtener info del servicio para la duración
    const servicio = centro.servicios.find((s: any) => s.id === selectedService);
    const profesional = centro.profesionales[0]; // Tomar el primero por ahora

    if (!profesional) {
      alert("No hay profesionales disponibles para este negocio.");
      return;
    }

    const { error } = await supabase.from("turno").insert({
      cliente_id: user.id,
      empleado_id: profesional.id,
      servicio_id: selectedService,
      fecha: fechaReserva.toISOString().split("T")[0],
      hora_inicio: selectedTime,
      estado: "pendiente",
    });

    if (error) {
      console.error("Error al reservar:", error);
      alert("Hubo un error al procesar tu reserva. Inténtalo de nuevo.");
    } else {
      alert("¡Reserva confirmada con éxito!");
      setSelectedService(null);
      setSelectedTime("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/explore"
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
            {/* Fotos del negocio */}
            {centro.imagenes && centro.imagenes.length > 0 ? (
              <div className={`grid gap-4 mb-6 ${centro.imagenes.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {centro.imagenes.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="relative h-64 rounded-lg overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={img}
                      alt={`${centro.nombre} - Foto ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : centro.logo_url ? (
              <div className="relative h-48 rounded-lg overflow-hidden mb-6 bg-gray-100">
                <Image
                  src={centro.logo_url}
                  alt={centro.nombre}
                  fill
                  className="object-contain p-4"
                />
              </div>
            ) : null}

            {/* Información básica */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-500">
                    {centro.categoria}
                  </span>
                  <h2 className="text-2xl font-bold mt-1">{centro.nombre}</h2>
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
                {centro.servicios.map((servicio: any) => (
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
                {centro.profesionales.map((pro: any) => (
                  <div
                    key={pro.id}
                    className="flex items-center p-3 border rounded-lg"
                  >
                    <div className="w-12 h-12 rounded-full mr-3 overflow-hidden bg-gray-200 shrink-0">
                      {pro.foto_url ? (
                        <Image
                          src={pro.foto_url}
                          alt={pro.nombre}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold">
                          {pro.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{pro.nombre}</h4>
                      <p className="text-xs text-gray-500">{pro.especialidad}</p>
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
                      centro.servicios.find((s: any) => s.id === selectedService)
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
                    ]?.map((hora: any) => (
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
                      ]?.map((hora: any) => (
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
                onClick={handleReserva}
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
