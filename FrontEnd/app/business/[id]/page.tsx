"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/app/Components/Header";
import {
  IconMapPin,
  IconClock,
  IconPhone,
  IconStarFilled,
  IconStar,
  IconMessageCircle,
  IconUser,
  IconCut,
  IconCheck,
} from "@tabler/icons-react";
import HorariosPreview from "@/app/dashboard/components/SchedulePreview";
import PaymentModal from "@/app/Components/PaymentModal";

type usuario = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  detalles: string;
  direccion: string;
  avatar_url: string;
};

type empleado = {
  id: string;
  nombre: string;
  foto_url: string;
  usuario: usuario;
  biografia: string;
};

type servicio = {
  id: string;
  nombre: string;
  precio: string;
  duracion: string;
  descripcion: string;
  activo: boolean;
};

type profesional = {
  id: string;
  nombre: string;
  especialidad: string;
  experiencia: string;
};

type turno = {
  id: string;
  fecha: string;
  hora_inicio: string;
  estado: string;
  servicio?: servicio;
  empleado_id?: string;
};

type ResenaInfo = {
  id: string;
  rating: number;
  comentario: string;
  creado_en: string;
  empleado_id?: string;
  cliente?: {
    nombre: string;
    avatar_url: string | null;
  };
};

type CentroData = {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  telefono: string;
  ciudad: string;
  logo_url: string | null;
  imagenes: string[];
  horario: string;
  horariosRaw: Record<
    string,
    { abierto: boolean; apertura: string; cierre: string }
  >;
  horariosDisponibles: Record<string, string[]>;
  servicios: (servicio & { disponible: boolean })[];
  profesionales: (profesional & {
    foto_url: string | null;
    ratingStr: string;
    ratingCount: number;
  })[];
  resenas: ResenaInfo[];
  turnosFuturos: turno[];
  promedioRating: string;
};

export default function CentroPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = params.id as string;
  const supabase = createClient();

  const [centro, setCentro] = useState<CentroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorito, setFavorito] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedProfesional, setSelectedProfesional] = useState<string | null>(
    null,
  );

  const [user, setUser] = useState<any>(null);

  const [selectedTime, setSelectedTime] = useState<string>("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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
        .neq("activo", false); // incluye activo=TRUE y activo=NULL

      // 3. Obtener empleados
      const { data: empleados, error: empleadosError } = await supabase
        .from("empleado")
        .select(`id, biografia, foto_url, usuario:usuario_id (nombre)`)
        .eq("negocio_id", id)
        .eq("activo", true);

      const empIds = empleados?.map((e) => e.id) || [];

      // Fetch turnos para calcular la disponibilidad (solo turnos vigentes al futuro)
      const todayStr = new Date().toISOString().split("T")[0];
      const { data: turnos } = await supabase
        .from("turno")
        .select("id, empleado_id, fecha, hora_inicio, estado")
        .in("estado", ["pendiente", "confirmado", "confirmada"])
        .in(
          "empleado_id",
          empIds.length > 0 ? empIds : ["00000000-0000-0000-0000-000000000000"],
        )
        .gte("fecha", todayStr);

      // 4. Obtener reseñas del negocio (Intentamos traer empleado_id si existe)
      let reseñasMap: ResenaInfo[] = [];
      const { data: resenas1, error: err1 } = await supabase
        .from("resena")
        .select(
          `id, rating, comentario, creado_en, empleado_id, cliente:cliente_id (nombre, avatar_url)`,
        )
        .eq("negocio_id", id)
        .order("creado_en", { ascending: false });

      if (err1) {
        // Si la tabla resena aun no tiene empleado_id, aplicamos fallback seguro
        const { data: resenas2 } = await supabase
          .from("resena")
          .select(
            `id, rating, comentario, creado_en, cliente:cliente_id (nombre, avatar_url)`,
          )
          .eq("negocio_id", id)
          .order("creado_en", { ascending: false });
        reseñasMap = (resenas2 as any) || [];
      } else {
        reseñasMap = (resenas1 as any) || [];
      }

      const totalRating = reseñasMap.reduce(
        (acc: number, curr: ResenaInfo) => acc + curr.rating,
        0,
      );
      const promedioRating =
        reseñasMap.length > 0
          ? (totalRating / reseñasMap.length).toFixed(1)
          : "Nuevo";

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
        servicios: (servicios || []).map((s: servicio) => ({
          ...s,
          disponible: s.activo !== false,
        })),
        profesionales: ((empleados as unknown as empleado[]) || []).map((e) => {
          const misReseñas = reseñasMap.filter(
            (r) => r.empleado_id && r.empleado_id === e.id,
          );
          const rPromedio =
            misReseñas.length > 0
              ? (
                  misReseñas.reduce((acc, curr) => acc + curr.rating, 0) /
                  misReseñas.length
                ).toFixed(1)
              : "Nuevo";
          return {
            id: e.id,
            nombre: e.usuario?.nombre || "Profesional",
            especialidad: e.biografia || "Especialista",
            foto_url: e.foto_url || null,
            ratingStr: rPromedio,
            ratingCount: misReseñas.length,
          };
        }),
        horariosDisponibles,
        horariosRaw,
        resenas: reseñasMap,
        turnosFuturos: turnos || [],
        promedioRating,
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
  const availableTimesForSelectedDate = useMemo(() => {
    if (!selectedDateObj || !centro || !selectedProfesional) return [];

    // Todos los slots teóricos del local para ese dia (Ej. ['09:00', '10:00', ...])
    const allSlots: string[] =
      centro.horariosDisponibles[
        selectedDateObj.key as keyof typeof centro.horariosDisponibles
      ] || [];

    if (selectedProfesional === "cualquiera") {
      // Buscar si al menos existe 1 estilista libre en este slot.
      return allSlots.filter((slot) => {
        let ocupadosCount = 0;
        centro.profesionales.forEach((pro) => {
          const proOcupado = centro.turnosFuturos.find(
            (t) =>
              t.fecha === selectedDateObj.dateString &&
              t.hora_inicio.substring(0, 5) === slot &&
              t.empleado_id === pro.id,
          );
          if (proOcupado) ocupadosCount++;
        });
        return ocupadosCount < centro.profesionales.length; // Si hay menos ocupados que el total, significa que alguien está libre
      });
    }

    // Si se seleccionó un profesional concreto
    const turnosDelPro = (centro.turnosFuturos || []).filter(
      (t) =>
        t.fecha === selectedDateObj.dateString &&
        t.empleado_id === selectedProfesional,
    );
    const horasOcupadas = turnosDelPro.map((t) =>
      t.hora_inicio.substring(0, 5),
    );

    // Filtramos horas en base al calendario y le sumamos un chequeo en caso de que el estilista tenga jornada individual futura
    // (Aca el slot entra como '09:00', asi que horasOcupadas.includes funciona perfecto)
    return allSlots.filter((slot) => !horasOcupadas.includes(slot));
  }, [centro, selectedDateObj, selectedProfesional]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= Math.round(rating) ? (
              <IconStarFilled className="h-4 w-4 md:h-5 md:w-5 text-amber-400 drop-shadow-sm" />
            ) : (
              <IconStar
                className="h-4 w-4 md:h-5 md:w-5 text-gray-300"
                stroke={1.5}
              />
            )}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[64px]">
        <Header variant="app" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda - Esqueletos de info e imágenes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Esqueleto de Imagen */}
              <div className="flex flex-col gap-3 mb-6">
                <div className="w-full h-64 md:h-[600px] rounded-3xl bg-gray-200 animate-pulse" />
                <div className="flex gap-3 overflow-x-hidden pb-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-20 w-24 sm:h-20 sm:w-28 rounded-2xl bg-gray-200 animate-pulse flex-shrink-0"
                    />
                  ))}
                </div>
              </div>

              {/* Esqueleto de Info Básica */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div className="w-full md:w-1/2">
                    <div className="w-24 h-6 bg-gray-200 rounded-full animate-pulse mb-3" />
                    <div className="w-3/4 h-10 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                  <div className="w-24 h-12 bg-gray-200 rounded-2xl animate-pulse" />
                </div>

                <div className="space-y-3 mb-8">
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse shrink-0" />
                    <div className="space-y-2 w-full">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse shrink-0" />
                    <div className="space-y-2 w-full">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:col-span-2 mt-2 pt-4 border-t border-gray-200/60">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse shrink-0" />
                    <div className="space-y-2 w-full">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="w-48 h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Esqueleto de Servicios */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="w-48 h-8 bg-gray-200 rounded-lg animate-pulse mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="border border-gray-100 bg-gray-50 rounded-2xl p-5 flex justify-between items-start"
                    >
                      <div className="space-y-3 w-1/2">
                        <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse" />
                        <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="w-24 h-6 bg-gray-200 rounded animate-pulse mt-3" />
                      </div>
                      <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna derecha - Esqueleto Reserva */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 border border-gray-100">
                <div className="w-40 h-6 bg-gray-200 rounded animate-pulse mb-6" />

                <div className="space-y-6">
                  <div>
                    <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mb-3" />
                    <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse" />
                  </div>

                  <div>
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-3" />
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-16 rounded-xl bg-gray-200 animate-pulse"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="w-40 h-4 bg-gray-200 rounded animate-pulse mb-3" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
                      <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
                    </div>
                  </div>

                  <div>
                    <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mb-3" />
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="h-10 rounded-lg bg-gray-200 animate-pulse"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-14 bg-gray-200 rounded-2xl animate-pulse mt-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
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

    // Si eligio "Cualquiera", el sistema debe asignar de manera inteligente al empleado disponible en ese horario
    let finalEmpleadoId = selectedProfesional;
    if (selectedProfesional === "cualquiera") {
      const profesionalesLibres = centro.profesionales.filter((pro) => {
        const proTieneTurno = centro.turnosFuturos.find(
          (t) =>
            t.fecha === selectedDate &&
            t.hora_inicio.substring(0, 5) === selectedTime &&
            t.empleado_id === pro.id,
        );
        return !proTieneTurno;
      });

      if (profesionalesLibres.length > 0) {
        finalEmpleadoId = profesionalesLibres[0].id;
      } else {
        finalEmpleadoId = centro.profesionales[0]?.id; // Fallback
      }
    }

    const { error } = await supabase.from("turno").insert({
      cliente_id: user.id,
      empleado_id: finalEmpleadoId,
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
        message:
          "Pago procesado, pero hubo un error al guardar la cita. Contacta soporte.",
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Información del centro */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fotos del negocio (Estilo Galería Interactiva) */}
            {centro.imagenes && centro.imagenes.length > 0 ? (
              <div className="flex flex-col gap-3 mb-6">
                {/* Imagen Principal */}
                <div className="relative w-full h-64 md:h-[600px] rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
                  <Image
                    src={
                      centro.imagenes[activeImageIndex] || centro.imagenes[0]
                    }
                    alt={`${centro.nombre} - Imagen destacada`}
                    fill
                    className="object-cover transition-opacity duration-300 ease-in-out"
                    priority
                  />
                </div>

                {/* Thumbnails (Solo se muestra si hay > 1 imagen) */}
                {centro.imagenes.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x relative z-10">
                    {centro.imagenes.map((img: string, idx: number) => (
                      <div
                        key={idx}
                        onMouseEnter={() => setActiveImageIndex(idx)}
                        onPointerEnter={() => setActiveImageIndex(idx)}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative h-20 w-24 sm:h-20 sm:w-28 rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 border-2 transition-all duration-200 snap-center ${
                          activeImageIndex === idx
                            ? "border-[var(--primary)] shadow-md opacity-100 scale-[1.02]"
                            : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Miniatura ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : centro.logo_url ? (
              <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden bg-gray-100 shadow-sm">
                <Image
                  src={centro.logo_url}
                  alt={centro.nombre}
                  fill
                  className="object-contain p-4 hover:scale-105 transition-transform duration-500"
                />
              </div>
            ) : null}

            {/* Información básica */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-purple-50 text-[var(--primary)] text-xs font-semibold tracking-wide uppercase rounded-full mb-3">
                    {centro.categoria}
                  </span>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {centro.nombre}
                  </h2>
                </div>
                {centro.promedioRating !== "Nuevo" && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl shrink-0">
                    <IconStarFilled className="text-amber-500" size={24} />
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-amber-900 leading-none">
                        {centro.promedioRating}
                      </span>
                      <span className="text-[10px] text-amber-700 font-medium uppercase tracking-wider">
                        {centro.resenas?.length} reseñas
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                {centro.descripcion}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-start text-gray-700">
                  <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm mr-4 shrink-0">
                    <IconMapPin className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      Ubicación
                    </span>
                    <span>{centro.ciudad || "Dirección no especificada"}</span>
                  </div>
                </div>
                <div className="flex items-start text-gray-700">
                  <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm mr-4 shrink-0">
                    <IconClock className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      Horario de hoy
                    </span>
                    <span>{centro.horario}</span>
                  </div>
                </div>
                <div className="flex items-start text-gray-700 md:col-span-2 mt-2 pt-4 border-t border-gray-200/60">
                  <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm mr-4 shrink-0">
                    <IconPhone className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      Contacto
                    </span>
                    <span>{centro.telefono}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Servicios */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h3 className="font-bold text-2xl mb-6">Nuestros Servicios</h3>
              {centro.servicios && centro.servicios.length > 0 ? (
                <div className="space-y-4">
                  {centro.servicios.map((servicio) => (
                    <div
                      key={servicio.id}
                      className={`border rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-sm ${
                        selectedService === servicio.id
                          ? "border-[var(--primary)] ring-4 ring-[var(--primary)]/10 bg-purple-50 hover:bg-purple-50 shadow-purple-900/5 transform scale-[1.01]"
                          : "border-gray-200 hover:border-[var(--primary)]/40 hover:bg-gray-50 hover:shadow-md"
                      } ${!servicio.disponible ? "opacity-50 grayscale select-none" : ""}`}
                      onClick={() =>
                        servicio.disponible && setSelectedService(servicio.id)
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">
                            {servicio.nombre}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 max-w-sm">
                            {servicio.descripcion}
                          </p>
                          <div className="flex items-center mt-3 space-x-3">
                            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-md flex flex-row items-center gap-2">
                              <IconClock size={20} />
                              {servicio.duracion}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="font-bold text-xl text-[var(--primary)]">
                            RD${servicio.precio}
                          </span>
                          {!servicio.disponible && (
                            <span className="text-[10px] font-bold text-red-600 mt-2 px-2 py-1 bg-red-50 border border-red-100 rounded-md uppercase tracking-wide">
                              No disponible
                            </span>
                          )}
                          {selectedService === servicio.id && (
                            <span className="mt-3 text-xs font-bold text-purple-700 flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-md">
                              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />{" "}
                              Seleccionado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 border border-gray-100 rounded-2xl text-gray-500">
                  <span className="font-medium text-lg">Sin servicios</span>
                  <p className="text-sm mt-1">
                    Este negocio aún no ha añadido servicios a su catálogo.
                  </p>
                </div>
              )}
            </div>

            {/* Horarios Detallados */}
            <div className="mb-6">
              <HorariosPreview horarios={centro.horariosRaw} />
            </div>

            {/* Profesionales */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h3 className="font-bold text-2xl mb-6">Nuestros Estilistas</h3>
              {centro.profesionales && centro.profesionales.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {centro.profesionales.map((pro) => (
                    <div
                      key={pro.id}
                      className="flex items-center p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow"
                    >
                      <div className="w-14 h-14 rounded-full mr-4 overflow-hidden border-2 border-white shadow-sm shrink-0">
                        {pro.foto_url ? (
                          <Image
                            src={pro.foto_url}
                            alt={pro.nombre}
                            width={56}
                            height={56}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xl font-bold">
                            {pro.nombre.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {pro.nombre}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium">
                          {pro.especialidad}
                        </p>
                        {pro.ratingStr !== "Nuevo" && (
                          <div className="flex items-center gap-1 mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 self-start">
                            <IconStarFilled
                              size={10}
                              className="text-amber-500"
                            />
                            <span className="text-[10px] font-bold text-amber-700">
                              {pro.ratingStr}
                            </span>
                            <span className="text-[9px] text-amber-600/70">
                              ({pro.ratingCount})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 border border-gray-100 rounded-2xl text-gray-500">
                  <span className="font-medium text-lg">Aún sin equipo</span>
                  <p className="text-sm mt-1">
                    Este negocio todavía no cuenta con profesionales
                    disponibles.
                  </p>
                </div>
              )}
            </div>

            {/* Reseñas (Reviews tomadas desde DB) */}
            {centro.resenas && centro.resenas.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-2xl text-gray-900">
                    Reseñas de Clientes
                  </h3>
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                    <IconStarFilled size={18} className="text-amber-500" />
                    <span className="font-bold text-amber-700 text-lg">
                      {centro.promedioRating}
                    </span>
                    <span className="text-amber-600/70 text-sm font-medium tracking-wide">
                      ({centro.resenas.length})
                    </span>
                  </div>
                </div>
                <div className="grid gap-4">
                  {centro.resenas.map((res) => (
                    <div
                      key={res.id}
                      className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative"
                    >
                      <IconMessageCircle
                        className="absolute top-4 right-4 text-gray-200"
                        size={40}
                        stroke={1}
                      />
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-gray-200 shadow-sm">
                            {res.cliente?.avatar_url ? (
                              <img
                                src={res.cliente.avatar_url}
                                alt={res.cliente.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 bg-gray-100">
                                {res.cliente?.nombre?.charAt(0) || "U"}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-gray-900">
                              {res.cliente?.nombre || "Usuario"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {new Date(res.creado_en).toLocaleDateString(
                                "es-DO",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                          {renderStars(res.rating)}
                        </div>
                      </div>
                      {res.comentario ? (
                        <p className="text-gray-700 leading-relaxed text-sm relative z-10 italic">
                          "{res.comentario}"
                        </p>
                      ) : (
                        <p className="text-gray-400 leading-relaxed text-sm relative z-10 italic">
                          Sin comentario.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha - Reserva sticky */}

          <div className="lg:col-span-1">
            <div className="lg:col-span-1 min-h-full">
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
                        centro.servicios.find((s) => s.id === selectedService)
                          ?.nombre
                      }
                    </p>
                  </div>
                )}

                {/* Selector de Profesional */}
                {selectedService &&
                (!centro.profesionales || centro.profesionales.length === 0) ? (
                  <div className="mb-6 p-4 rounded-xl border border-red-100 bg-red-50 text-red-600 text-sm font-medium text-center">
                    Este negocio no tiene personal registrado. No es posible
                    agendar citas en este momento.
                  </div>
                ) : (
                  selectedService && (
                    <div className="mb-6 animate-fade-in">
                      <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                          2
                        </span>
                        ¿Con quién te atenderás?
                      </label>
                      <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-none snap-x">
                        {/* Opción Cualquiera */}
                        <button
                          onClick={() => {
                            setSelectedProfesional("cualquiera");
                            setSelectedDate(null);
                            setSelectedTime("");
                          }}
                          className={`flex flex-col items-center min-w-[80px] snap-center p-3 rounded-2xl border-2 transition-all ${
                            selectedProfesional === "cualquiera"
                              ? "border-[var(--primary)] bg-purple-50 shadow-md transform scale-[1.02]"
                              : "border-gray-100 bg-white hover:border-[var(--primary)]/30 hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                              selectedProfesional === "cualquiera"
                                ? "bg-[var(--primary)] text-white"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <IconUser size={22} />
                          </div>
                          <span
                            className={`text-[11px] font-bold text-center ${selectedProfesional === "cualquiera" ? "text-[var(--primary)]" : "text-gray-700"}`}
                          >
                            Cualquiera
                          </span>
                        </button>

                        {/* Lista de Profesionales del Centro */}
                        {centro.profesionales?.map((pro) => (
                          <button
                            key={pro.id}
                            onClick={() => {
                              setSelectedProfesional(pro.id);
                              setSelectedDate(null);
                              setSelectedTime("");
                            }}
                            className={`flex flex-col items-center min-w-[85px] snap-center p-3 rounded-2xl border-2 transition-all ${
                              selectedProfesional === pro.id
                                ? "border-[var(--primary)] bg-purple-50 shadow-md transform scale-[1.02]"
                                : "border-gray-100 bg-white hover:border-[var(--primary)]/30 hover:bg-gray-50"
                            }`}
                          >
                            <div
                              className={`w-12 h-12 rounded-full overflow-hidden mb-2 border-2 ${selectedProfesional === pro.id ? "border-[var(--primary)]" : "border-gray-100"}`}
                            >
                              {pro.foto_url ? (
                                <Image
                                  src={pro.foto_url}
                                  alt={pro.nombre}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
                                  {pro.nombre.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <span
                              className={`text-[11px] font-bold truncate w-full text-center ${selectedProfesional === pro.id ? "text-[var(--primary)]" : "text-gray-900"}`}
                            >
                              {pro.nombre.split(" ")[0]}
                            </span>
                            <div className="flex items-center gap-0.5 mt-1">
                              <IconStarFilled
                                size={10}
                                className="text-amber-500"
                              />
                              <span className="text-[10px] text-gray-600 font-semibold">
                                {pro.ratingStr}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* Selector de día */}
                {selectedProfesional && (
                  <div className="mb-6 animate-fade-in mt-4 border-t border-gray-100 pt-6">
                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                        3
                      </span>
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
                          className={`px-4 py-3 rounded-2xl text-sm font-medium flex flex-col items-center justify-center min-w-[75px] whitespace-nowrap transition-all border-2 ${
                            selectedDate === dia.dateString
                              ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md transform scale-105"
                              : "bg-white text-gray-700 border-gray-100 hover:border-[var(--primary)]/30 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-[10px] uppercase tracking-wider mb-1 opacity-80">
                            {dia.displayDay}
                          </span>
                          <span className="text-xl font-bold leading-none mb-1">
                            {dia.displayNum}
                          </span>
                          <span className="text-[10px] opacity-80">
                            {dia.displayMonth}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Horarios disponibles */}
                {selectedDate && (
                  <div className="mb-6 animate-fade-in mt-4 border-t border-gray-100 pt-6">
                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                        4
                      </span>
                      Selecciona un horario
                    </label>

                    {isMobile ? (
                      // Selector tipo rueda para móvil
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] appearance-none font-medium text-gray-800"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                          backgroundPosition: "right 0.75rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                          paddingRight: "2.5rem",
                        }}
                      >
                        <option value="">Seleccionar hora disponible</option>
                        {availableTimesForSelectedDate?.map((hora) => (
                          <option key={hora} value={hora}>
                            {hora}
                          </option>
                        ))}
                      </select>
                    ) : (
                      // Botones de selección única para desktop
                      <div>
                        {availableTimesForSelectedDate.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-sm text-gray-500 font-medium">
                              No hay horarios disponibles
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Intenta con otro estilista o fecha
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-2">
                            {availableTimesForSelectedDate?.map((hora) => (
                              <button
                                key={hora}
                                onClick={() => setSelectedTime(hora)}
                                className={`px-2 py-2.5 text-xs font-bold border-2 rounded-xl transition-all ${
                                  selectedTime === hora
                                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                                    : "bg-white border-gray-100 hover:border-[var(--primary)]/40 text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {hora}
                              </button>
                            ))}
                          </div>
                        )}

                        {selectedTime && (
                          <p className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                            <IconCheck size={14} /> Horario asegurado:{" "}
                            {selectedTime}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

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
          (s) => s.id === selectedService,
        );
        return (
          <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            onPaymentSuccess={handleConfirmedPayment}
            negocio={centro?.nombre ?? ""}
            servicio={servicioSeleccionado?.nombre ?? ""}
            precio={Number(servicioSeleccionado?.precio ?? 0)}
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
