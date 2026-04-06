"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconSettings,
  IconEdit,
  IconCheck,
  IconX,
  IconPlus,
  IconTrash,
  IconLoader2,
  IconCalendarEvent,
  IconUsers,
  IconCurrencyDollar,
  IconStar,
  IconUpload,
  IconAlertTriangle,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/app/Components/Header";
import StatsCard from "../components/StatsCard";
import PDFDownloadButton from "../components/PDFDownloadButton";

// ─── Types ────────────────────────────────────────────────────────────────────
type NegocioDetalle = {
  id: string;
  nombre: string;
  logo_url: string | null;
  categoria: string;
  email_contacto: string;
  telefono_contacto: string;
  descripcion: string | null;
  direccion: string | null;
  ciudad: string | null;
  horarios: Record<string, { abierto: boolean; apertura: string; cierre: string }>;
  fotos: string[] | null;
};

type Servicio = {
  id: string;
  nombre: string;
  precio: number;
  duracion: string | number;
  descripcion: string | null;
  activo: boolean;
};

type Empleado = {
  id: string;
  biografia: string | null;
  foto_url: string | null;
  usuario: { id: string; nombre: string } | null;
};

type Turno = {
  id: string;
  fecha: string;
  hora_inicio: string;
  estado: string;
  cliente: { nombre: string } | null;
  servicio: { nombre: string; precio: number } | null;
};

type Stats = {
  citasHoy: number;
  ingresosHoy: number;
  empleados: number;
};

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  confirmado: "bg-green-100 text-green-700",
  completado: "bg-blue-100 text-blue-700",
  cancelado: "bg-red-100 text-red-600",
};

const DIAS_MAP = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function BusinessDashboardLayout({
  data,
  id,
}: {
  data: NegocioDetalle[];
  id: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("resumen");
  const [negocio, setNegocio] = useState<NegocioDetalle>(data[0]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [stats, setStats] = useState<Stats>({ citasHoy: 0, ingresosHoy: 0, empleados: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  // Filtros de citas
  const [fechaCitas, setFechaCitas] = useState("");
  const [verTodasPendientes, setVerTodasPendientes] = useState(false);

  // Edit modals
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [editHorariosOpen, setEditHorariosOpen] = useState(false);
  const [editServicioModal, setEditServicioModal] = useState<Servicio | null | "nuevo">(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingHorarios, setSavingHorarios] = useState(false);
  const [savingServicio, setSavingServicio] = useState(false);

  // Edit state copies
  const [infoEdit, setInfoEdit] = useState({
    nombre: negocio.nombre || "",
    email_contacto: negocio.email_contacto || "",
    telefono_contacto: negocio.telefono_contacto || "",
    descripcion: negocio.descripcion || "",
    categoria: negocio.categoria || "",
  });
  const [horariosEdit, setHorariosEdit] = useState({ ...negocio.horarios });
  const [servicioEdit, setServicioEdit] = useState({
    nombre: "",
    precio: 0,
    duracion: "",
    descripcion: "",
  });

  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setDataLoading(true);
    const today = new Date().toISOString().split("T")[0];

    // Servicios
    const { data: srvData } = await supabase
      .from("servicio")
      .select("id, nombre, precio, duracion, descripcion, activo")
      .eq("negocio_id", id)
      .order("nombre");

    // Empleados
    const { data: empData } = await supabase
      .from("empleado")
      .select("id, biografia, foto_url, usuario:usuario_id(id, nombre)")
      .eq("negocio_id", id)
      .eq("activo", true);

    // Todas las citas futuras y pasadas para cargarlas en tabla y poder filtrar
    const { data: turnosData } = await supabase
      .from("turno")
      .select(`
        id, fecha, hora_inicio, estado,
        servicio:servicio_id(nombre, precio),
        cliente:cliente_id(nombre)
      `)
      .in("empleado_id", (empData || []).map((e: any) => e.id))
      .order("fecha", { ascending: true })
      .order("hora_inicio", { ascending: true });

    setFechaCitas(today);

    // Turnos de hoy para stats
    const { data: turnosHoy } = await supabase
      .from("turno")
      .select("id, hora_inicio, estado, servicio:servicio_id(precio)")
      .in(
        "empleado_id",
        (empData || []).map((e: any) => e.id),
      )
      .eq("fecha", today);

    const ingresosHoy = (turnosHoy || [])
      .filter((t: any) => t.estado === "completado")
      .reduce((acc: number, t: any) => acc + (t.servicio?.precio ?? 0), 0);

    setServicios((srvData as Servicio[]) || []);
    setEmpleados((empData as any[]) || []);
    setTurnos((turnosData as any[]) || []);
    setStats({
      citasHoy: (turnosHoy || []).filter((t: any) => t.estado !== "cancelado").length,
      ingresosHoy,
      empleados: (empData || []).length,
    });

    setDataLoading(false);
  }, [id, supabase]);

  const fetchTurnos = useCallback(async () => {
    const { data: empData } = await supabase
      .from("empleado")
      .select("id")
      .eq("negocio_id", id)
      .eq("activo", true);

    if (!empData || empData.length === 0) return;

    const { data: turnosData } = await supabase
      .from("turno")
      .select(`
        id, fecha, hora_inicio, estado,
        servicio:servicio_id(nombre, precio),
        cliente:cliente_id(nombre)
      `)
      .in("empleado_id", empData.map((e: any) => e.id))
      .order("fecha", { ascending: true })
      .order("hora_inicio", { ascending: true });

    setTurnos((turnosData as any[]) || []);
  }, [id, supabase]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Show toast ─────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Save info básica ────────────────────────────────────────────────────────
  const handleSaveInfo = async () => {
    setSavingInfo(true);
    const { error } = await supabase
      .from("negocio")
      .update({
        nombre: infoEdit.nombre,
        email_contacto: infoEdit.email_contacto,
        telefono_contacto: infoEdit.telefono_contacto,
        descripcion: infoEdit.descripcion,
        categoria: infoEdit.categoria,
      })
      .eq("id", id);

    setSavingInfo(false);
    if (error) {
      showToast("Error al guardar la información.", "err");
    } else {
      setNegocio((prev) => ({ ...prev, ...infoEdit }));
      setEditInfoOpen(false);
      showToast("Información actualizada correctamente.");
    }
  };

  // ── Save horarios ───────────────────────────────────────────────────────────
  const handleSaveHorarios = async () => {
    setSavingHorarios(true);
    const { error } = await supabase
      .from("negocio")
      .update({ horarios: horariosEdit })
      .eq("id", id);

    setSavingHorarios(false);
    if (error) {
      showToast("Error al guardar los horarios.", "err");
    } else {
      setNegocio((prev) => ({ ...prev, horarios: horariosEdit }));
      setEditHorariosOpen(false);
      showToast("Horarios actualizados correctamente.");
    }
  };

  // ── Save servicio ──────────────────────────────────────────────────────────
  const handleSaveServicio = async () => {
    setSavingServicio(true);
    if (editServicioModal === "nuevo") {
      const { error } = await supabase.from("servicio").insert({
        negocio_id: id,
        nombre: servicioEdit.nombre,
        precio: servicioEdit.precio,
        duracion: servicioEdit.duracion,
        descripcion: servicioEdit.descripcion || null,
        activo: true,
      });
      setSavingServicio(false);
      if (error) {
        showToast("Error al crear el servicio.", "err");
      } else {
        setEditServicioModal(null);
        showToast("Servicio creado correctamente.");
        fetchAll();
      }
    } else if (editServicioModal) {
      const { error } = await supabase
        .from("servicio")
        .update({
          nombre: servicioEdit.nombre,
          precio: servicioEdit.precio,
          duracion: servicioEdit.duracion,
          descripcion: servicioEdit.descripcion || null,
        })
        .eq("id", editServicioModal.id);
      setSavingServicio(false);
      if (error) {
        showToast("Error al actualizar el servicio.", "err");
      } else {
        setEditServicioModal(null);
        showToast("Servicio actualizado correctamente.");
        fetchAll();
      }
    }
  };

  // ── Toggle servicio activo ─────────────────────────────────────────────────
  const handleToggleServicio = async (srv: Servicio) => {
    const { error } = await supabase
      .from("servicio")
      .update({ activo: !srv.activo })
      .eq("id", srv.id);
    if (!error) {
      setServicios((prev) =>
        prev.map((s) => (s.id === srv.id ? { ...s, activo: !s.activo } : s)),
      );
    }
  };

  // ── Cambiar estado de turno ────────────────────────────────────────────────
  const handleCambiarEstadoTurno = async (turnoId: string, nuevoEstado: string) => {
    const { error } = await supabase
      .from("turno")
      .update({ estado: nuevoEstado })
      .eq("id", turnoId);
    if (!error) {
      setTurnos((prev) =>
        prev.map((t) => (t.id === turnoId ? { ...t, estado: nuevoEstado } : t)),
      );
      showToast(`Cita actualizada a "${nuevoEstado}".`);
    } else {
      showToast("Error al cambiar estado.", "err");
    }
  };

  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [generandoLink, setGenerandoLink] = useState(false);

  const handleCopiarEnlace = async () => {
    setGenerandoLink(true);
    try {
      const res = await fetch("/api/create-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocioId: id }),
      });
      const resData = await res.json();
      if (!res.ok) {
        if (typeof showToast !== 'undefined') showToast(resData.error || "Error al crear enlace", "err");
      } else {
        await navigator.clipboard.writeText(resData.link);
        if (typeof showToast !== 'undefined') showToast("¡Enlace seguro de invitación copiado al portapapeles!");
      }
    } catch (err) {
      if (typeof showToast !== 'undefined') showToast("Hubo un error al generar el enlace", "err");
    } finally {
      setGenerandoLink(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingLogo(true);
    const file = e.target.files[0];
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `/${id}/logo_${Date.now()}.${ext}`;

    const { error } = await supabase.storage
        .from("negocios")
        .upload(path, file, { cacheControl: "3600", upsert: true });

    if (error) {
       showToast("Error al subir el logo", "err");
    } else {
       const { data: urlData } = supabase.storage.from("negocios").getPublicUrl(path);
       const newLogoUrl = urlData.publicUrl;

       const { error: updateError } = await supabase
         .from("negocio")
         .update({ logo_url: newLogoUrl })
         .eq("id", id);
         
       if (!updateError) {
          setNegocio(prev => ({ ...prev, logo_url: newLogoUrl }));
          showToast("Logo actualizado correctamente.");
       } else {
          showToast("Error al guardar el logo", "err");
       }
    }
    setUploadingLogo(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const newFiles = Array.from(e.target.files);
    let fotosActuales = [...(negocio.fotos || [])];

    if (fotosActuales.length + newFiles.length > 3) {
      showToast("Solo puedes tener un máximo de 3 fotos.", "err");
      return;
    }

    setUploadingFoto(true);

    for (const file of newFiles) {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `/${id}/fotos/foto_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;

      const { error } = await supabase.storage
        .from("negocios")
        .upload(path, file, { cacheControl: "3600", upsert: true });

      if (error) {
        showToast("Error al subir imagen", "err");
        continue;
      }

      const { data: urlData } = supabase.storage.from("negocios").getPublicUrl(path);
      fotosActuales.push(urlData.publicUrl);
    }

    const { error: updateError } = await supabase
      .from("negocio")
      .update({ fotos: fotosActuales })
      .eq("id", id);

    if (updateError) {
      showToast("Error al actualizar negocio con fotos", "err");
    } else {
      setNegocio(prev => ({ ...prev, fotos: fotosActuales }));
      showToast("Fotos subidas correctamente.");
    }
    setUploadingFoto(false);
  };

  const handleEliminarFoto = async (fotoUrl: string) => {
    const fotosNuevas = (negocio.fotos || []).filter(url => url !== fotoUrl);
    
    // Tratamos de extraer la ruta para borrarla del storage si es de supabase
    if (fotoUrl.includes("supabase.co") && fotoUrl.includes("/negocios/")) {
       const parts = fotoUrl.split("/negocios/");
       if (parts.length > 1) {
          const storagePath = parts[1];
          await supabase.storage.from("negocios").remove([storagePath]);
       }
    }

    const { error } = await supabase
      .from("negocio")
      .update({ fotos: fotosNuevas })
      .eq("id", id);

    if (error) {
       showToast("Error al eliminar foto", "err");
    } else {
       setNegocio(prev => ({ ...prev, fotos: fotosNuevas }));
       showToast("Foto eliminada correctamente.");
    }
  };

  // ── Eliminar empleado ───────────────────────────────────────────────────────
  const [eliminandoEmpleadoId, setEliminandoEmpleadoId] = useState<string | null>(null);

  const handleEliminarEmpleado = async (empId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar a este empleado del negocio? Esta acción no se puede deshacer.")) return;
    setEliminandoEmpleadoId(empId);
    const { error } = await supabase
      .from("empleado")
      .update({ activo: false })
      .eq("id", empId);
    setEliminandoEmpleadoId(null);
    if (error) {
      showToast("Error al eliminar el empleado.", "err");
    } else {
      setEmpleados((prev) => prev.filter((e) => e.id !== empId));
      showToast("Empleado eliminado del negocio.");
    }
  };

  // ── Eliminar negocio ────────────────────────────────────────────────────────
  const [deleteNegocioOpen, setDeleteNegocioOpen] = useState(false);
  const [deleteNegocioConfirm, setDeleteNegocioConfirm] = useState("");
  const [deletingNegocio, setDeletingNegocio] = useState(false);

  const handleEliminarNegocio = async () => {
    if (deleteNegocioConfirm !== negocio.nombre) return;
    setDeletingNegocio(true);
    const { error } = await supabase
      .from("negocio")
      .delete()
      .eq("id", id);
    setDeletingNegocio(false);
    if (error) {
      showToast("Error al eliminar el negocio.", "err");
      setDeleteNegocioOpen(false);
    } else {
      router.push("/dashboard");
    }
  };

  if (!negocio) return null;

  const turnosMostrar = verTodasPendientes
    ? turnos.filter((t) => t.estado === "pendiente")
    : turnos.filter((t) => t.fecha === fechaCitas);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header variant="app" />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${
            toast.type === "ok"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "ok" ? <IconCheck size={16} /> : <IconX size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Sub-header sticky */}
      <div className="bg-white border-b sticky top-[64px] z-10 shadow-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Volver + Editar info */}
          <div className="flex items-center justify-between py-4">
            <Link
              href="/dashboard"
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <IconArrowLeft size={16} className="mr-1" /> Volver a mis negocios
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setInfoEdit({
                    nombre: negocio.nombre || "",
                    email_contacto: negocio.email_contacto || "",
                    telefono_contacto: negocio.telefono_contacto || "",
                    descripcion: negocio.descripcion || "",
                    categoria: negocio.categoria || "",
                  });
                  setEditInfoOpen(true);
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <IconEdit size={15} />
                Editar negocio
              </button>
              <button
                onClick={() => { setDeleteNegocioConfirm(""); setDeleteNegocioOpen(true); }}
                className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <IconTrash size={15} />
                Eliminar
              </button>
            </div>
          </div>

          {/* Info del negocio */}
          <div className="flex items-center gap-4 pb-6">
            <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 relative group">
              {negocio.logo_url ? (
                <Image
                  src={negocio.logo_url}
                  alt={negocio.nombre}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 text-xl">
                  {negocio.nombre.charAt(0)}
                </div>
              )}
              {/* Overlay para editar logo */}
              <label 
                title="Cambiar logo"
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200 text-white z-10"
              >
                {uploadingLogo ? (
                   <IconLoader2 size={20} className="animate-spin" />
                ) : (
                   <IconEdit size={20} />
                )}
                <input
                   type="file"
                   accept="image/*"
                   className="hidden"
                   onChange={handleLogoUpload}
                   disabled={uploadingLogo}
                />
              </label>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{negocio.nombre}</h1>
              <p className="text-sm text-gray-500">
                {negocio.categoria} • {negocio.ciudad || "Sin dirección"}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 overflow-x-auto">
            {["Resumen", "Servicios", "Equipo", "Fotos"].map((tab) => {
              const tabId = tab.toLowerCase();
              return (
                <button
                  key={tabId}
                  onClick={() => setActiveTab(tabId)}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tabId
                      ? "border-[var(--primary)] text-[var(--primary)]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── TAB: RESUMEN ─────────────────────────────────────── */}
          {activeTab === "resumen" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Citas hoy"
                  value={dataLoading ? "..." : String(stats.citasHoy)}
                  icon={<IconCalendarEvent size={20} className="text-[var(--primary)]" />}
                />
                <StatsCard
                  title="Ingresos hoy"
                  value={dataLoading ? "..." : `RD$ ${stats.ingresosHoy.toLocaleString("es-DO")}`}
                  icon={<IconCurrencyDollar size={20} className="text-green-600" />}
                />
                <StatsCard
                  title="Empleados activos"
                  value={dataLoading ? "..." : String(stats.empleados)}
                  icon={<IconUsers size={20} className="text-blue-600" />}
                />
                <StatsCard
                  title="Servicios activos"
                  value={dataLoading ? "..." : String(servicios.filter((s) => s.activo).length)}
                  icon={<IconStar size={20} className="text-amber-500" />}
                />
              </div>

              {/* Contenido inferior */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Citas rápido */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold text-gray-900">Gestión de Citas</h3>
                      {!dataLoading && turnos.length > 0 && (
                        <PDFDownloadButton turnos={turnos} negocioNombre={negocio.nombre} />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setVerTodasPendientes(false)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${!verTodasPendientes ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          Por fecha
                        </button>
                        <button
                          onClick={() => setVerTodasPendientes(true)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${verTodasPendientes ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          Pendientes
                        </button>
                      </div>
                      {!verTodasPendientes && (
                        <input
                          type="date"
                          value={fechaCitas}
                          onChange={(e) => setFechaCitas(e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-gray-50"
                        />
                      )}
                    </div>
                  </div>

                  {dataLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : turnosMostrar.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <IconCalendarEvent size={48} className="mx-auto mb-3 opacity-40" stroke={1.5} />
                      <p className="text-lg font-medium">No hay citas para mostrar</p>
                      <p className="text-sm mt-1">Prueba seleccionando otra fecha o filtro</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-sm text-gray-400">
                            <th className="pb-3 font-medium">Fecha</th>
                            <th className="pb-3 font-medium">Hora</th>
                            <th className="pb-3 font-medium">Cliente</th>
                            <th className="pb-3 font-medium">Servicio</th>
                            <th className="pb-3 font-medium">Estado</th>
                            <th className="pb-3 font-medium text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {turnosMostrar.map((turno) => (
                            <tr key={turno.id} className="border-b border-gray-50 last:border-0">
                              <td className="py-4 text-sm text-gray-600">{turno.fecha}</td>
                              <td className="py-4 text-sm font-semibold text-gray-900">
                                {turno.hora_inicio}
                              </td>
                              <td className="py-4 text-sm font-medium text-gray-700">
                                {(turno.cliente as any)?.nombre ?? "Cliente"}
                              </td>
                              <td className="py-4 text-sm text-gray-500">
                                {turno.servicio?.nombre ?? "—"}
                              </td>
                              <td className="py-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                                    ESTADO_COLORS[turno.estado] ?? "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {turno.estado}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex justify-end gap-1">
                                  {turno.estado === "pendiente" && (
                                    <button
                                      onClick={() => handleCambiarEstadoTurno(turno.id, "confirmado")}
                                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                    >
                                      Confirmar
                                    </button>
                                  )}
                                  {(turno.estado === "pendiente" || turno.estado === "confirmado") && (
                                    <>
                                      <button
                                        onClick={() => handleCambiarEstadoTurno(turno.id, "completado")}
                                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                      >
                                        Completar
                                      </button>
                                      <button
                                        onClick={() => handleCambiarEstadoTurno(turno.id, "cancelado")}
                                        className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                      >
                                        Cancelar
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Horarios + Info */}
                <div className="space-y-4">
                  {/* Horarios */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900">Horarios</h3>
                      <button
                        onClick={() => {
                          setHorariosEdit({ ...negocio.horarios });
                          setEditHorariosOpen(true);
                        }}
                        className="text-xs text-[var(--primary)] flex items-center gap-1 hover:underline"
                      >
                        <IconEdit size={12} /> Editar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {DIAS_MAP.map((dia) => {
                        const config = negocio.horarios?.[dia.key];
                        const isOpen = config?.abierto;
                        return (
                          <div
                            key={dia.key}
                            className="flex justify-between items-center text-sm border-b border-gray-50 pb-1.5 last:border-0"
                          >
                            <span className="text-gray-600 font-medium">{dia.label}</span>
                            <span className={isOpen ? "text-gray-900" : "text-gray-400"}>
                              {isOpen ? `${config.apertura} - ${config.cierre}` : "Cerrado"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Info contacto */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900">Información</h3>
                      <button
                        onClick={() => {
                          setInfoEdit({
                            nombre: negocio.nombre || "",
                            email_contacto: negocio.email_contacto || "",
                            telefono_contacto: negocio.telefono_contacto || "",
                            descripcion: negocio.descripcion || "",
                            categoria: negocio.categoria || "",
                          });
                          setEditInfoOpen(true);
                        }}
                        className="text-xs text-[var(--primary)] flex items-center gap-1 hover:underline"
                      >
                        <IconEdit size={12} /> Editar
                      </button>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium text-gray-800">Email:</span>
                        <br />
                        {negocio.email_contacto || "No configurado"}
                      </p>
                      <p>
                        <span className="font-medium text-gray-800">Teléfono:</span>
                        <br />
                        {negocio.telefono_contacto || "No configurado"}
                      </p>
                      {negocio.descripcion && (
                        <p>
                          <span className="font-medium text-gray-800">Descripción:</span>
                          <br />
                          {negocio.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: SERVICIOS ───────────────────────────────────── */}
          {activeTab === "servicios" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Servicios</h3>
                <button
                  onClick={() => {
                    setServicioEdit({ nombre: "", precio: 0, duracion: "", descripcion: "" });
                    setEditServicioModal("nuevo");
                  }}
                  className="flex items-center gap-1.5 text-sm bg-[var(--primary)] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all"
                >
                  <IconPlus size={16} /> Nuevo servicio
                </button>
              </div>

              {dataLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : servicios.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg font-medium">No hay servicios registrados</p>
                  <p className="text-sm mt-1">Agrega el primer servicio de tu negocio</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {servicios.map((srv) => (
                    <div
                      key={srv.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        srv.activo
                          ? "border-gray-100 bg-white"
                          : "border-gray-100 bg-gray-50 opacity-60"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{srv.nombre}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-500">
                            {srv.duracion} min
                          </span>
                          {srv.descripcion && (
                            <span className="text-xs text-gray-400 truncate max-w-[200px]">
                              {srv.descripcion}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="font-semibold text-gray-900 whitespace-nowrap">
                          RD$ {srv.precio}
                        </span>
                        {/* Toggle activo/inactivo */}
                        <button
                          onClick={() => handleToggleServicio(srv)}
                          title={srv.activo ? "Desactivar" : "Activar"}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            srv.activo ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              srv.activo ? "translate-x-5" : ""
                            }`}
                          />
                        </button>
                        {/* Editar */}
                        <button
                          onClick={() => {
                            setServicioEdit({
                              nombre: srv.nombre,
                              precio: srv.precio,
                              duracion: String(srv.duracion),
                              descripcion: srv.descripcion || "",
                            });
                            setEditServicioModal(srv);
                          }}
                          className="p-1.5 text-gray-400 hover:text-[var(--primary)] transition-colors rounded-lg hover:bg-purple-50"
                        >
                          <IconEdit size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}



          {/* ── TAB: EQUIPO ──────────────────────────────────────── */}
          {activeTab === "equipo" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between flex-col md:flex-row md:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Mi Equipo</h3>
                  <p className="text-sm text-gray-500 mt-1">Comparte este enlace para que otros profesionales se unan a tu negocio.</p>
                </div>
                <button
                  onClick={handleCopiarEnlace}
                  disabled={generandoLink}
                  className="text-sm bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-wait"
                >
                  {generandoLink ? <IconLoader2 size={16} className="animate-spin" /> : <IconPlus size={16} />}
                  {generandoLink ? "Generando..." : "Copiar enlace de invitación"}
                </button>
              </div>

              {dataLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-36 bg-gray-100 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : empleados.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <IconUsers size={48} className="mx-auto mb-3 opacity-40" stroke={1.5} />
                  <p className="text-lg font-medium">No hay empleados registrados</p>
                  <p className="text-sm mt-1">
                    Los empleados que se unan al negocio aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {empleados.map((emp) => (
                    <div
                      key={emp.id}
                      className="border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-all flex flex-col items-center text-center"
                    >
                      <div className="w-16 h-16 rounded-full mb-3 overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 relative">
                        {emp.foto_url ? (
                          <Image
                            src={emp.foto_url}
                            alt={(emp.usuario as any)?.nombre ?? "Empleado"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                            {((emp.usuario as any)?.nombre ?? "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-gray-900 line-clamp-1">
                        {(emp.usuario as any)?.nombre ?? "Empleado"}
                      </h4>
                      {emp.biografia && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{emp.biografia}</p>
                      )}
                      <button
                        onClick={() => handleEliminarEmpleado(emp.id)}
                        disabled={eliminandoEmpleadoId === emp.id}
                        className="mt-3 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {eliminandoEmpleadoId === emp.id
                          ? <IconLoader2 size={13} className="animate-spin" />
                          : <IconTrash size={13} />}
                        Eliminar del equipo
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: FOTOS ───────────────────────────────────────── */}
          {activeTab === "fotos" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Fotos del Negocio <span className="text-sm font-normal text-gray-500">{(negocio.fotos?.length || 0)} / 3 permitidas</span></h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Agrega fotos de tu establecimiento para lucirlo a tus clientes.
                  </p>
                </div>
                <div>
                  <label 
                    title={((negocio.fotos?.length || 0) >= 3) ? "Límite de 3 fotos alcanzado" : "Subir fotos"}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      ((negocio.fotos?.length || 0) >= 3) 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : "cursor-pointer bg-[var(--primary)] text-white hover:opacity-90"
                    }`}
                  >
                    {uploadingFoto ? (
                      <IconLoader2 size={16} className="animate-spin" />
                    ) : (
                      <IconUpload size={16} />
                    )}
                    <span>Subir fotos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploadingFoto || ((negocio.fotos?.length || 0) >= 3)}
                    />
                  </label>
                </div>
              </div>

              {!(negocio.fotos && negocio.fotos.length > 0) ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <IconUpload size={48} className="mx-auto mb-3 opacity-40" stroke={1.5} />
                  <p className="text-lg font-medium">No has subido fotos aún</p>
                  <p className="text-sm mt-1">Sube tus primeras fotos haciendo clic en "Subir fotos"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(negocio.fotos || []).map((fotoUrl, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden shadow-sm aspect-video border border-gray-200">
                      <img
                        src={fotoUrl}
                        alt={"Foto " + (idx + 1)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                        <button
                          onClick={() => {
                            if (window.confirm("¿Seguro que deseas eliminar esta foto?")) {
                              handleEliminarFoto(fotoUrl);
                            }
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                          title="Eliminar foto"
                        >
                          <IconTrash size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ─── Modal: Editar Información Básica ─────────────────────────────── */}
      {editInfoOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--primary)] to-purple-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-semibold">Editar información del negocio</h2>
              <button
                onClick={() => setEditInfoOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <IconX size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del negocio
                </label>
                <input
                  type="text"
                  value={infoEdit.nombre}
                  onChange={(e) => setInfoEdit((p) => ({ ...p, nombre: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={infoEdit.categoria}
                  onChange={(e) => setInfoEdit((p) => ({ ...p, categoria: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {[
                    "Barbería",
                    "Salón de belleza",
                    "Centro de uñas",
                    "Spa",
                    "Centro de estética",
                    "Peluquería infantil",
                    "Centro de depilación",
                    "Otro",
                  ].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de contacto
                </label>
                <input
                  type="email"
                  value={infoEdit.email_contacto}
                  onChange={(e) =>
                    setInfoEdit((p) => ({ ...p, email_contacto: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={infoEdit.telefono_contacto}
                  onChange={(e) =>
                    setInfoEdit((p) => ({ ...p, telefono_contacto: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={infoEdit.descripcion}
                  onChange={(e) => setInfoEdit((p) => ({ ...p, descripcion: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                  placeholder="Describe brevemente tu negocio..."
                />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setEditInfoOpen(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveInfo}
                disabled={savingInfo}
                className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {savingInfo ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconCheck size={16} />
                )}
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Editar Horarios ────────────────────────────────────────── */}
      {editHorariosOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[var(--primary)] to-purple-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-semibold">Editar horarios</h2>
              <button
                onClick={() => setEditHorariosOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <IconX size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3">
              {DIAS_MAP.map(({ key, label }) => {
                const diaConfig = horariosEdit[key] ?? {
                  abierto: false,
                  apertura: "09:00",
                  cierre: "20:00",
                };
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100"
                  >
                    <div className="w-24 shrink-0">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    {/* Toggle */}
                    <button
                      onClick={() =>
                        setHorariosEdit((prev) => ({
                          ...prev,
                          [key]: { ...diaConfig, abierto: !diaConfig.abierto },
                        }))
                      }
                      className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                        diaConfig.abierto ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          diaConfig.abierto ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                    {diaConfig.abierto ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={diaConfig.apertura}
                          onChange={(e) =>
                            setHorariosEdit((prev) => ({
                              ...prev,
                              [key]: { ...diaConfig, apertura: e.target.value },
                            }))
                          }
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] flex-1"
                        />
                        <span className="text-gray-400 text-sm">–</span>
                        <input
                          type="time"
                          value={diaConfig.cierre}
                          onChange={(e) =>
                            setHorariosEdit((prev) => ({
                              ...prev,
                              [key]: { ...diaConfig, cierre: e.target.value },
                            }))
                          }
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] flex-1"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Cerrado</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-6 pb-6 flex gap-3 border-t pt-4">
              <button
                onClick={() => setEditHorariosOpen(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveHorarios}
                disabled={savingHorarios}
                className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {savingHorarios ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconCheck size={16} />
                )}
                Guardar horarios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Crear / Editar Servicio ───────────────────────────────── */}
      {editServicioModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--primary)] to-purple-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-semibold">
                {editServicioModal === "nuevo" ? "Nuevo servicio" : "Editar servicio"}
              </h2>
              <button
                onClick={() => setEditServicioModal(null)}
                className="text-white/70 hover:text-white"
              >
                <IconX size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del servicio
                </label>
                <input
                  type="text"
                  value={servicioEdit.nombre}
                  onChange={(e) =>
                    setServicioEdit((p) => ({ ...p, nombre: e.target.value }))
                  }
                  placeholder="Ej. Corte clásico"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (RD$)
                  </label>
                  <input
                    type="number"
                    value={servicioEdit.precio}
                    onChange={(e) =>
                      setServicioEdit((p) => ({ ...p, precio: Number(e.target.value) }))
                    }
                    min={0}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    value={servicioEdit.duracion}
                    onChange={(e) =>
                      setServicioEdit((p) => ({ ...p, duracion: e.target.value }))
                    }
                    min={1}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={servicioEdit.descripcion}
                  onChange={(e) =>
                    setServicioEdit((p) => ({ ...p, descripcion: e.target.value }))
                  }
                  rows={2}
                  placeholder="Descripción breve del servicio..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setEditServicioModal(null)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveServicio}
                disabled={
                  savingServicio ||
                  !servicioEdit.nombre.trim() ||
                  !servicioEdit.precio ||
                  !servicioEdit.duracion
                }
                className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingServicio ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconCheck size={16} />
                )}
                {editServicioModal === "nuevo" ? "Crear servicio" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Eliminar Negocio ─────────────────────────────────────────── */}
      {deleteNegocioOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <IconAlertTriangle size={20} />
                <h2 className="font-semibold">Eliminar negocio</h2>
              </div>
              <button onClick={() => setDeleteNegocioOpen(false)} className="text-white/70 hover:text-white">
                <IconX size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                Esta acción es <strong>permanente e irreversible</strong>. Se eliminarán todos
                los datos del negocio incluyendo servicios, empleados y citas.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium">
                  Para confirmar, escribe exactamente el nombre del negocio:
                </p>
                <p className="text-sm font-bold text-red-900 mt-1 select-all">{negocio.nombre}</p>
              </div>
              <input
                type="text"
                value={deleteNegocioConfirm}
                onChange={(e) => setDeleteNegocioConfirm(e.target.value)}
                placeholder="Escribe el nombre del negocio..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setDeleteNegocioOpen(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarNegocio}
                disabled={deletingNegocio || deleteNegocioConfirm !== negocio.nombre}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingNegocio ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconTrash size={16} />
                )}
                Eliminar negocio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
