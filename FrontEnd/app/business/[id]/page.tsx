"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/app/Components/Header";
import HorariosPreview from "@/app/dashboard/components/SchedulePreview";
import PaymentModal from "@/app/Components/PaymentModal";

import { CentroData, empleado, servicio, ResenaInfo, turno } from "./types";
import BusinessGallery from "./components/BusinessGallery";
import BusinessInfo from "./components/BusinessInfo";
import ServicesList from "./components/ServicesList";
import ProfesionalesList from "./components/ProfesionalesList";
import ResenasList from "./components/ResenasList";
import BookingPanel from "./components/BookingPanel";
import LoadingSkeleton from "./components/LoadingSkeleton";

export default function CentroPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = params.id as string;

  const [centro, setCentro] = useState<CentroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedProfesional, setSelectedProfesional] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    isError: false,
    title: "",
    message: "",
  });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [turnosActuales, setTurnosActuales] = useState<turno[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch de los datos del centro
  useEffect(() => {
    async function fetchCentroData() {
      const supabase = createClient();

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

      const { data: servicios } = await supabase
        .from("servicio")
        .select("*")
        .eq("negocio_id", id)
        .neq("activo", false);

      const { data: empleados } = await supabase
        .from("empleado")
        .select(`id, biografia, foto_url, usuario:usuario_id (nombre)`)
        .eq("negocio_id", id)
        .eq("activo", true);

      const empIds = empleados?.map((e) => e.id) || [];

      const todayStr = new Date().toISOString().split("T")[0];
      const { data: turnos } = await supabase
        .from("turno")
        .select("id, empleado_id, fecha, hora_inicio, estado")
        .in("estado", ["pendiente", "confirmado"])
        .in(
          "empleado_id",
          empIds.length > 0 ? empIds : ["00000000-0000-0000-0000-000000000000"],
        )
        .gte("fecha", todayStr);

      // Reseñas con fallback si la columna empleado_id no existe
      let reseñasMap: ResenaInfo[] = [];
      const { data: resenas1, error: err1 } = await supabase
        .from("resena")
        .select(`id, rating, comentario, creado_en, empleado_id, cliente:cliente_id (nombre, avatar_url)`)
        .eq("negocio_id", id)
        .order("creado_en", { ascending: false });

      if (err1) {
        const { data: resenas2 } = await supabase
          .from("resena")
          .select(`id, rating, comentario, creado_en, cliente:cliente_id (nombre, avatar_url)`)
          .eq("negocio_id", id)
          .order("creado_en", { ascending: false });
        reseñasMap = (resenas2 as any) || [];
      } else {
        reseñasMap = (resenas1 as any) || [];
      }

      const totalRating = reseñasMap.reduce((acc: number, curr: ResenaInfo) => acc + curr.rating, 0);
      const promedioRating =
        reseñasMap.length > 0
          ? (totalRating / reseñasMap.length).toFixed(1)
          : "Nuevo";

      const horariosRaw: Record<string, { abierto: boolean; apertura: string; cierre: string }> =
        negocio.horarios || {};

      const DIAS_MAP: Record<string, string> = {
        lunes: "lun", martes: "mar", miercoles: "mie",
        jueves: "jue", viernes: "vie", sabado: "sab", domingo: "dom",
      };

      function generarSlots(apertura: string, cierre: string): string[] {
        const slots: string[] = [];
        const [hIni, mIni] = apertura.split(":").map(Number);
        const [hFin] = cierre.split(":").map(Number);
        for (let h = hIni; h < hFin; h++) {
          slots.push(`${String(h).padStart(2, "0")}:${String(mIni).padStart(2, "0")}`);
        }
        return slots;
      }

      const horariosDisponibles: Record<string, string[]> = {
        lun: ["9:00","10:00","11:00","14:00","15:00","16:00"],
        mar: ["9:00","10:00","11:00","14:00","15:00","16:00"],
        mie: ["9:00","10:00","11:00","14:00","15:00","16:00"],
        jue: ["9:00","10:00","11:00","14:00","15:00","16:00"],
        vie: ["9:00","10:00","11:00","14:00","15:00","16:00"],
        sab: ["9:00","10:00","11:00","12:00","13:00"],
      };
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

      const fotosNegocio: string[] = Array.isArray(negocio.fotos) ? negocio.fotos : [];

      const formattedCentro: CentroData = {
        ...negocio,
        categoria: negocio.categoria || "Sin categoría",
        telefono: negocio.telefono_contacto || negocio.telefono || "Sin teléfono",
        horario: horarioTexto,
        imagenes: fotosNegocio,
        servicios: (servicios || []).map((s: servicio) => ({ ...s, disponible: s.activo !== false })),
        profesionales: ((empleados as unknown as empleado[]) || []).map((e) => {
          const misReseñas = reseñasMap.filter((r) => r.empleado_id && r.empleado_id === e.id);
          const rPromedio =
            misReseñas.length > 0
              ? (misReseñas.reduce((acc, curr) => acc + curr.rating, 0) / misReseñas.length).toFixed(1)
              : "Nuevo";
          return {
            id: e.id,
            nombre: e.usuario?.nombre || "Profesional",
            especialidad: e.biografia || "Especialista",
            experiencia: "",
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

  // Calcular fechas disponibles próximas
  const upcomingDates = useMemo(() => {
    if (!centro) return [];
    const dates = [];
    const today = new Date();
    const mapDayToKey: Record<number, string> = { 0:"dom",1:"lun",2:"mar",3:"mie",4:"jue",5:"vie",6:"sab" };
    const mapDayToDisplay = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    const mapMonthToDisplay = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const key = mapDayToKey[d.getDay()];
      const availableTimes = centro.horariosDisponibles[key as keyof typeof centro.horariosDisponibles];
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

  const selectedDateObj = upcomingDates.find((d) => d.dateString === selectedDate);

  // Re-fetch turnos al cambiar profesional o fecha
  useEffect(() => {
    if (!selectedDateObj || !selectedProfesional || !centro) return;

    const currentCentro = centro;
    const queryDate = selectedDateObj.dateString;

    async function fetchTurnosActuales() {
      setLoadingSlots(true);

      const empIds =
        selectedProfesional === "cualquiera"
          ? currentCentro.profesionales.map((p) => p.id)
          : [selectedProfesional];

      if (empIds.length === 0) {
        setTurnosActuales([]);
        setLoadingSlots(false);
        return;
      }

      const { data, error } = await createClient()
        .from("turno")
        .select("id, empleado_id, fecha, hora_inicio, estado")
        .in("estado", ["pendiente", "confirmado"])
        .in("empleado_id", empIds)
        .eq("fecha", queryDate);

      if (error) {
        console.error("Error fetching turnos:", error.message || error);
        setTurnosActuales([]);
      } else {
        setTurnosActuales((data as turno[]) || []);
      }

      setLoadingSlots(false);
    }

    fetchTurnosActuales();
  }, [selectedDateObj, selectedProfesional, centro]);

  // Calcular slots disponibles y su estado de ocupación
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDateObj || !centro || !selectedProfesional) return [];

    const dateStr = selectedDateObj.dateString;
    const dayKey = selectedDateObj.key;
    const businessHours = centro.horariosDisponibles[dayKey] || [];
    if (businessHours.length === 0) return [];

    const normalizeHora = (h: string): string => {
      if (!h) return "00:00";
      const [hh, mm] = h.split(":");
      return `${String(parseInt(hh, 10)).padStart(2, "0")}:${String(parseInt(mm || "0", 10)).padStart(2, "0")}`;
    };

    const todayStr = new Date().toISOString().split("T")[0];
    const isToday = dateStr === todayStr;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const availableHours = businessHours.filter((hour) => {
      if (!isToday) return true;
      const [h, m] = hour.split(":").map(Number);
      return h * 60 + m > currentMinutes;
    });

    return availableHours.map((hour) => {
      const normalizedHour = normalizeHora(hour);
      let isOccupied = false;

      if (selectedProfesional === "cualquiera") {
        const turnosEnEsaHora = turnosActuales.filter(
          (turno) => normalizeHora(turno.hora_inicio) === normalizedHour,
        ).length;
        isOccupied = turnosEnEsaHora >= centro.profesionales.length;
      } else {
        isOccupied = turnosActuales.some(
          (turno) =>
            normalizeHora(turno.hora_inicio) === normalizedHour &&
            turno.empleado_id === selectedProfesional,
        );
      }

      return { hora: hour, ocupado: isOccupied, bloqueado: isOccupied || loadingSlots };
    });
  }, [centro, selectedDateObj, selectedProfesional, turnosActuales, loadingSlots]);

  // Handlers de selección
  const handleSelectProfesional = (id: string) => {
    setSelectedProfesional(id);
    setSelectedDate(null);
    setSelectedTime("");
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleReserva = async () => {
    if (!selectedService || !selectedTime || !centro || !selectedDate) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!centro.profesionales[0]) {
      setModalConfig({ isOpen: true, isError: true, title: "Sin profesionales", message: "No hay profesionales disponibles para este negocio." });
      return;
    }

    setPaymentModalOpen(true);
  };

  const handleConfirmedPayment = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !selectedService || !selectedTime || !selectedDate || !centro) return;

    let finalEmpleadoId = selectedProfesional;
    if (selectedProfesional === "cualquiera") {
      const normalizeH = (h: string) => {
        const p = h.split(":");
        return `${String(parseInt(p[0] || "0", 10)).padStart(2, "0")}:${String(parseInt(p[1] || "0", 10)).padStart(2, "0")}`;
      };
      const profesionalesLibres = centro.profesionales.filter(
        (pro) => !turnosActuales.some(
          (t) => normalizeH(t.hora_inicio) === normalizeH(selectedTime) && t.empleado_id === pro.id,
        ),
      );
      finalEmpleadoId = profesionalesLibres.length > 0 ? profesionalesLibres[0].id : centro.profesionales[0]?.id;
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
      setModalConfig({ isOpen: true, isError: true, title: "Error en la reserva", message: "Pago procesado, pero hubo un error al guardar la cita. Contacta soporte." });
    } else {
      setModalConfig({ isOpen: true, isError: false, title: "¡Reserva confirmada!", message: "Tu pago fue procesado y tu cita ha sido agendada con éxito." });
      setTurnosActuales((prev) => [
        ...prev,
        { id: crypto.randomUUID(), fecha: selectedDate!, hora_inicio: selectedTime, estado: "pendiente", empleado_id: finalEmpleadoId ?? undefined },
      ]);
      setSelectedService(null);
      setSelectedTime("");
      setSelectedDate(null);
    }
  };

  // --- Estados de UI ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[64px]">
        <Header variant="app" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LoadingSkeleton />
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

  const servicioSeleccionado = centro.servicios.find((s) => s.id === selectedService);

  return (
    <div className="min-h-screen bg-gray-50 pt-[64px]">
      <Header variant="app" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-6">
            <BusinessGallery
              imagenes={centro.imagenes}
              logoUrl={centro.logo_url}
              nombre={centro.nombre}
            />
            <BusinessInfo centro={centro} />
            <ServicesList
              servicios={centro.servicios}
              selectedService={selectedService}
              onSelectService={setSelectedService}
            />
            <div className="mb-6">
              <HorariosPreview horarios={centro.horariosRaw} />
            </div>
            <ProfesionalesList profesionales={centro.profesionales} />
            <ResenasList resenas={centro.resenas} promedioRating={centro.promedioRating} />
          </div>

          {/* Columna derecha - Panel de reserva */}
          <div className="lg:col-span-1">
            <BookingPanel
              centro={centro}
              selectedService={selectedService}
              selectedProfesional={selectedProfesional}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              upcomingDates={upcomingDates}
              slotsForSelectedDate={slotsForSelectedDate}
              loadingSlots={loadingSlots}
              isMobile={isMobile}
              onSelectProfesional={handleSelectProfesional}
              onSelectDate={handleSelectDate}
              onSelectTime={setSelectedTime}
              onReserva={handleReserva}
            />
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentSuccess={handleConfirmedPayment}
        negocio={centro.nombre}
        servicio={servicioSeleccionado?.nombre ?? ""}
        precio={Number(servicioSeleccionado?.precio ?? 0)}
        fecha={selectedDate ?? ""}
        hora={selectedTime}
      />

      {/* Modal de confirmación/error */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl">
            {modalConfig.isError ? (
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ) : (
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modalConfig.title}</h3>
            <div className="text-sm text-gray-500 mb-8">
              <p>{modalConfig.message}</p>
            </div>
            <button
              onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
              className={`w-full py-3 rounded-xl font-semibold transition-colors text-white ${
                modalConfig.isError ? "bg-red-600 hover:bg-red-700" : "bg-[var(--primary)] hover:opacity-90"
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
