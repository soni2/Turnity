"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/app/Components/Header";
import { IconMapPin, IconClock, IconPhone } from "@tabler/icons-react";
import HorariosPreview from "@/app/dashboard/components/SchedulePreview";
import PaymentModal from "@/app/Components/PaymentModal";

export default function CentroPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = params.id as string;

  const [centro, setCentro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favorito, setFavorito] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    isError: false,
    title: "",
    message: "",
  });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

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
        .select(
          `
          id,
          biografia,
          foto_url,
          usuario:usuario_id (nombre)
        `,
        )
        .eq("negocio_id", id)
        .eq("activo", true);

      // Derivar texto de horario y horarios disponibles desde negocio.horarios (JSON guardado en BD)
      const horariosRaw: Record<
        string,
        { abierto: boolean; apertura: string; cierre: string }
      > = negocio.horarios || {};

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
          slots.push(
            `${String(h).padStart(2, "0")}:${String(mIni).padStart(2, "0")}`,
          );
        }
        return slots;
      }

      const horariosDisponibles: Record<string, string[]> = {
        lun: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        mar: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        mie: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        jue: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        vie: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        sab: ["9:00", "10:00", "11:00", "12:00", "13:00"],
      };
      const diasAbiertos: string[] = [];

      Object.entries(horariosRaw).forEach(([dia, config]) => {
        const clave = DIAS_MAP[dia] ?? dia;
        if (config.abierto) {
          horariosDisponibles[clave] = generarSlots(
            config.apertura,
            config.cierre,
          );
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
        telefono:
          negocio.telefono_contacto || negocio.telefono || "Sin teléfono",
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
        horariosDisponibles: {
          lun: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          mar: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          mie: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          jue: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          vie: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          sab: ["9:00", "10:00", "11:00", "12:00", "13:00"],
        },
        horariosRaw,
      };

      setCentro(formattedCentro);
      setLoading(false);
    }

    if (id) fetchCentroData();
  }, [id]);

  const upcomingDates = useMemo(() => {
    if (!centro) return [];
    const dates = [];
    const today = new Date();
    const mapDayToKey: Record<number, string> = {
      0: "dom",
      1: "lun",
      2: "mar",
      3: "mie",
      4: "jue",
      5: "vie",
      6: "sab",
    };
    const mapDayToDisplay = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const mapMonthToDisplay = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const key = mapDayToKey[d.getDay()];

      const availableTimes =
        centro.horariosDisponibles[
          key as keyof typeof centro.horariosDisponibles
        ];
      if (availableTimes && availableTimes.length > 0) {
        dates.push({
          dateString: d.toISOString().split("T")[0],
          key,
          displayDay: mapDayToDisplay[d.getDay()],
          displayNum: d.getDate(),
          displayMonth: mapMonthToDisplay[d.getMonth()],
        });
      }
    }
    return dates;
  }, [centro]);

  const selectedDateObj = upcomingDates.find(
    (d) => d.dateString === selectedDate,
  );
  const availableTimesForSelectedDate = selectedDateObj
    ? centro.horariosDisponibles[
        selectedDateObj.key as keyof typeof centro.horariosDisponibles
      ]
    : [];

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

  // Step 1: validate then open payment modal
  const handleReserva = async () => {
    if (!selectedService || !selectedTime || !centro || !selectedDate) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const profesional = centro.profesionales[0];
    if (!profesional) {
      setModalConfig({
        isOpen: true,
        isError: true,
        title: "Sin profesionales",
        message: "No hay profesionales disponibles para este negocio.",
      });
      return;
    }

    // Open payment modal instead of inserting directly
    setPaymentModalOpen(true);
  };

  // Step 2: called by PaymentModal after successful payment simulation
  const handleConfirmedPayment = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !selectedService || !selectedTime || !selectedDate) return;

    const profesional = centro.profesionales[0];

    const { error } = await supabase.from("turno").insert({
      cliente_id: user.id,
      empleado_id: profesional.id,
      servicio_id: selectedService,
      fecha: selectedDate,
      hora_inicio: selectedTime,
      estado: "pendiente",
    });

    if (error) {
      console.error("Error al reservar:", error);
      setModalConfig({
        isOpen: true,
        isError: true,
        title: "Error en la reserva",
        message: "Pago procesado, pero hubo un error al guardar la cita. Contacta soporte.",
      });
    } else {
      setModalConfig({
        isOpen: true,
        isError: false,
        title: "¡Reserva confirmada!",
        message: "Tu pago fue procesado y tu cita ha sido agendada con éxito.",
      });
      setSelectedService(null);
      setSelectedTime("");
      setSelectedDate(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[64px]">
      <Header variant="app" />

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Información del centro */}
          <div className="lg:col-span-2">
            {/* Fotos del negocio */}
            {centro.imagenes && centro.imagenes.length > 0 ? (
              <div
                className={`grid gap-4 mb-6 ${centro.imagenes.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
              >
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

              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <IconMapPin className="h-5 w-5 mr-3 flex-shrink-0 text-[var(--primary)]" />
                  <span>{centro.direccion || "Dirección no especificada"}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <IconClock className="h-5 w-5 mr-3 flex-shrink-0 text-[var(--primary)]" />
                  <span>{centro.horario}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <IconPhone className="h-5 w-5 mr-3 flex-shrink-0 text-[var(--primary)]" />
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
                        ? "border-[var(--primary)] ring-2 ring-[var(--primary)] ring-opacity-20"
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
                          RD${servicio.precio}
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

            {/* Horarios Detallados */}
            <div className="mb-6">
              <HorariosPreview horarios={centro.horariosRaw} />
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
                      <p className="text-xs text-gray-500">
                        {pro.especialidad}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha - Reserva sticky */}

          <div className="lg:col-span-1">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h3 className="font-semibold text-lg mb-4">Reservar cita</h3>

                {/* Selector de servicio */}
                {selectedService && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                      Servicio seleccionado
                    </p>
                    <p className="font-medium">
                      {
                        centro.servicios.find(
                          (s: any) => s.id === selectedService,
                        )?.nombre
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
                    {upcomingDates.map((dia) => (
                      <button
                        key={dia.dateString}
                        onClick={() => {
                          setSelectedDate(dia.dateString);
                          setSelectedTime(""); // Resetear hora al cambiar día
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex flex-col items-center justify-center min-w-[70px] whitespace-nowrap transition-colors ${
                          selectedDate === dia.dateString
                            ? "bg-[var(--primary)] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span className="text-xs uppercase mb-1">
                          {dia.displayDay}
                        </span>
                        <span className="text-lg font-bold">
                          {dia.displayNum}
                        </span>
                        <span className="text-xs">{dia.displayMonth}</span>
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
                      {availableTimesForSelectedDate?.map((hora: any) => (
                        <option key={hora} value={hora}>
                          {hora}
                        </option>
                      ))}
                    </select>
                  ) : (
                    // Botones de selección única para desktop
                    <div>
                      <div className="grid grid-cols-3 gap-2">
                        {availableTimesForSelectedDate?.map((hora: any) => (
                          <button
                            key={hora}
                            onClick={() => setSelectedTime(hora)}
                            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                              selectedTime === hora
                                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                                : "hover:border-[var(--primary)] text-gray-700"
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
                      ? "bg-[var(--primary)] text-white hover:opacity-90 cursor-pointer"
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
                <div className="mt-4 text-xs text-gray-500 text-center space-y-0.5">
                  <p> 100% reembolso si cancelas 24h antes</p>
                  <p> 50% reembolso si cancelas 2h antes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {(() => {
        const servicioSeleccionado = centro?.servicios?.find(
          (s: any) => s.id === selectedService
        );
        return (
          <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            onPaymentSuccess={handleConfirmedPayment}
            negocio={centro?.nombre ?? ""}
            servicio={servicioSeleccionado?.nombre ?? ""}
            precio={servicioSeleccionado?.precio ?? 0}
            fecha={selectedDate ?? ""}
            hora={selectedTime}
          />
        );
      })()}

      {/* Modal de confirmación */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl">
            {modalConfig.isError ? (
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            ) : (
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {modalConfig.title}
            </h3>
            <div className="text-sm text-gray-500 mb-8">
              <p>{modalConfig.message}</p>
            </div>
            <button
              onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
              className={`w-full py-3 rounded-xl font-semibold transition-colors text-white ${
                modalConfig.isError
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[var(--primary)] hover:opacity-90"
              }`}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
