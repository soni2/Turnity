"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { JSX } from "react";
import Logo from "./Logo";
import Link from "next/link";
import { Buttons } from "./Buttons";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  IconSearch,
  IconUser,
  IconBell,
  IconLibrary,
  IconX,
  IconCalendar,
  IconClock,
  IconCheck,
  IconChecks,
  IconLogout,
  IconLogin,
} from "@tabler/icons-react";

type HeaderProps = {
  variant?: "home" | "app" | "guest";
};

type Negocio = {
  id: string;
  nombre: string;
  categoria: string | null;
  ciudad: string | null;
};

type Notificacion = {
  id: string;
  tipo: "hoy" | "proxima" | "confirmada" | "cancelada" | "nueva";
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  leida: boolean;
  turnoId: string;
};

// ─── helpers (module-level, no hook deps) ───────────────────────────────────
function formatNotifFecha(fecha: string): string {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-DO", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function buildNotifs(turnos: any[], servicioMap: Record<string, string>, currentUserId: string): Notificacion[] {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const notifs: Notificacion[] = [];

  for (const t of turnos) {
    const nombreServicio = servicioMap[t.servicio_id] ?? "Cita";
    const isToday     = t.fecha === todayStr;
    const isUpcoming  = t.fecha >  todayStr;
    const isCanceled  = t.estado === "cancelado";
    const isConfirmed = t.estado === "confirmado";
    const isOwner     = t.cliente_id !== currentUserId; // Si no es el cliente, la estamos recibiendo como dueños/empleados

    if (isCanceled) {
      notifs.push({
        id: `cancel-${t.id}`, tipo: "cancelada",
        titulo: isOwner ? "Cancelación" : "Cita cancelada",
        descripcion: isOwner ? `Un cliente canceló ${nombreServicio}.` : `Tu cita de ${nombreServicio} fue cancelada.`,
        fecha: t.fecha, hora: t.hora_inicio, leida: false, turnoId: t.id,
      });
    } else if (isToday) {
      notifs.push({
        id: `hoy-${t.id}`, tipo: "hoy",
        titulo: isOwner ? "Turno pendiente hoy" : "¡Cita hoy!",
        descripcion: isOwner ? `Tienes agendado ${nombreServicio} hoy a las ${t.hora_inicio}.` : `Tienes ${nombreServicio} hoy a las ${t.hora_inicio}.`,
        fecha: t.fecha, hora: t.hora_inicio, leida: false, turnoId: t.id,
      });
    } else if (isUpcoming && isConfirmed) {
      notifs.push({
        id: `conf-${t.id}`, tipo: "confirmada",
        titulo: isOwner ? "Reserva aprobada" : "Cita confirmada",
        descripcion: isOwner ? `${nombreServicio} en la agenda el ${formatNotifFecha(t.fecha)} a las ${t.hora_inicio}.` : `${nombreServicio} confirmada para el ${formatNotifFecha(t.fecha)} a las ${t.hora_inicio}.`,
        fecha: t.fecha, hora: t.hora_inicio, leida: false, turnoId: t.id,
      });
    } else if (isUpcoming) {
      // pending (any age) → "próxima cita" o "nueva reserva a revisar"
      notifs.push({
        id: `prox-${t.id}`, tipo: "proxima",
        titulo: isOwner ? "NUEVA RESERVA" : "Próxima cita",
        descripcion: isOwner ? `Solicitud de ${nombreServicio} el ${formatNotifFecha(t.fecha)} (${t.hora_inicio}).` : `${nombreServicio} el ${formatNotifFecha(t.fecha)} a las ${t.hora_inicio}.`,
        fecha: t.fecha, hora: t.hora_inicio, leida: false, turnoId: t.id,
      });
    }
  }
  return notifs;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Header({ variant = "home" }: HeaderProps) {
  // Stable supabase client — never recreated
  const supabase = useMemo(() => createClient(), []);

  const [isFixed,        setIsFixed]        = useState(false);
  const [user,           setUser]           = useState<any>(null);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [dropdownResults,setDropdownResults]= useState<Negocio[]>([]);
  const [showDropdown,   setShowDropdown]   = useState(false);
  const [isSearching,    setIsSearching]    = useState(false);
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [unreadCount,    setUnreadCount]    = useState(0);
  
  // Custom Toast State
  const [liveToast, setLiveToast] = useState<{ title: string; message: string; visible: boolean } | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef  = useRef<HTMLDivElement>(null);

  const router    = useRouter();
  const pathname  = usePathname();
  const isHome    = variant === "home";
  const solid     = !isHome || isFixed;
  const isExplorePage = pathname === "/explore";

  // ── Scroll (home only) ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setIsFixed(window.scrollY > window.innerHeight - 65);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, [supabase]);

  // ── Click outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Notifications fetch ───────────────────────────────────────────────────
  const fetchNotificaciones = useCallback(async () => {
    if (!user) { setNotificaciones([]); setUnreadCount(0); return; }

    const today   = new Date();
    const past30  = new Date(today); past30.setDate(today.getDate() - 30);
    const in60    = new Date(today); in60.setDate(today.getDate() + 60);

    const { data: misEmpleados } = await supabase
      .from("empleado")
      .select("id")
      .eq("usuario_id", user.id);
    const empIds = misEmpleados?.map(e => e.id) || [];
    let queryFilter = `cliente_id.eq.${user.id}`;
    if (empIds.length > 0) {
      queryFilter = `cliente_id.eq.${user.id},empleado_id.in.(${empIds.join(",")})`;
    }

    const { data: turnos, error } = await supabase
      .from("turno")
      .select("id, fecha, hora_inicio, estado, servicio_id, cliente_id")
      .or(queryFilter)
      .gte("fecha", past30.toISOString().split("T")[0])
      .lte("fecha", in60.toISOString().split("T")[0])
      .order("fecha", { ascending: false });

    if (error || !turnos) { console.error("notif fetch error", error); return; }

    // Resolve service names
    const sids = [...new Set(turnos.map((t: any) => t.servicio_id).filter(Boolean))] as string[];
    const { data: servicios } = sids.length
      ? await supabase.from("servicio").select("id, nombre").in("id", sids)
      : { data: [] };

    const servicioMap: Record<string, string> = {};
    (servicios ?? []).forEach((s: any) => { servicioMap[s.id] = s.nombre; });

    const notifs = buildNotifs(turnos, servicioMap, user.id);

    // Restore read state from localStorage
    const storageKey = `notif-read-${user.id}`;
    const readIds: Set<string> = new Set(
      JSON.parse(localStorage.getItem(storageKey) ?? "[]")
    );
    const notifsPersisted = notifs.map(n => ({
      ...n,
      leida: readIds.has(n.id),
    }));

    setNotificaciones(notifsPersisted);
    setUnreadCount(notifsPersisted.filter(n => !n.leida).length);
  }, [user, supabase]); // stable: supabase is memoized, user changes only on auth change

  // ── Initial load + Realtime subscription ──────────────────────────────────
  useEffect(() => {
    fetchNotificaciones();
    if (!user) return;

    const handlePayload = (payload: any) => {
      // Recargar lista
      fetchNotificaciones();

      // Preparar textos de notificacion
      let notifTitle = "Actualización de Cita";
      let notifMessage = "Han habido cambios en tu agenda.";

      const isOwnerEvent = payload.new?.cliente_id !== user.id;

      if (payload.eventType === "INSERT") {
        notifTitle = isOwnerEvent ? "¡Nueva Reserva!" : "¡Nueva Cita!";
        notifMessage = isOwnerEvent 
          ? "Un cliente acaba de agendar un turno en tu negocio." 
          : "Se ha agregado una cita a tu calendario.";
      } else if (payload.eventType === "UPDATE") {
        const newState = payload.new.estado;
        if (newState === "cancelado") {
          notifTitle = "Cita Cancelada";
          notifMessage = isOwnerEvent ? "Un cliente ha cancelado su cita." : "Una de tus citas ha sido cancelada.";
        } else if (newState === "confirmado") {
          notifTitle = "Cita Confirmada";
          notifMessage = isOwnerEvent ? "Turno marcado como confirmado." : "Tu cita ha sido confirmada.";
        }
      }

      // Activar Live Toast interno
      setLiveToast({ title: notifTitle, message: notifMessage, visible: true });

      // Lanzar Notificación Nativa a Windows/MacOS
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`Turnity: ${notifTitle}`, {
          body: notifMessage,
        });
      }

      // Esconder el Toast después de 4 segundos
      setTimeout(() => {
        setLiveToast((prev) => (prev ? { ...prev, visible: false } : null));
      }, 4500);
    };

    const channel = supabase.channel(`realtime-turnos-${user.id}`);

    // Cliente Realtime
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "turno", filter: `cliente_id=eq.${user.id}` },
      handlePayload
    );

    // Negocio Realtime
    let isSubscribed = false;
    supabase
      .from("empleado")
      .select("id")
      .eq("usuario_id", user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          data.forEach(emp => {
            channel.on(
              "postgres_changes",
              { event: "*", schema: "public", table: "turno", filter: `empleado_id=eq.${emp.id}` },
              handlePayload
            );
          });
        }
        if (!isSubscribed) {
          channel.subscribe();
          isSubscribed = true;
        }
      });

    return () => { 
      isSubscribed = true;
      supabase.removeChannel(channel); 
    };
  }, [fetchNotificaciones, user, supabase]);

  // ── Search ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDropdownResults([]);
      setShowDropdown(false);
      return;
    }
    const t = setTimeout(async () => {
      setIsSearching(true);
      const { data, error } = await supabase
        .from("negocio")
        .select("id, nombre, categoria, ciudad")
        .ilike("nombre", `%${searchQuery}%`)
        .limit(6);

      if (!error && data) {
        setDropdownResults(data);
        setShowDropdown(data.length > 0);
      }
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, supabase]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
    if (e.key === "Escape") setShowDropdown(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDropdownResults([]);
    setShowDropdown(false);
    if (isExplorePage) {
       router.push("/explore"); 
    }
  };

  const markAllRead = () => {
    const ids = notificaciones.map(n => n.id);
    if (user) {
      const storageKey = `notif-read-${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(ids));
    }
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const notifColorMap: Record<string, string> = {
    hoy:       "bg-purple-100 text-purple-700",
    proxima:   "bg-blue-100   text-blue-700",
    confirmada:"bg-green-100  text-green-700",
    cancelada: "bg-red-100    text-red-600",
    nueva:     "bg-amber-100  text-amber-700",
  };
  const notifIconMap: Record<string, JSX.Element> = {
    hoy:       <IconBell     size={16} />,
    proxima:   <IconClock    size={16} />,
    confirmada:<IconCheck    size={16} />,
    cancelada: <IconX        size={16} />,
    nueva:     <IconCalendar size={16} />,
  };

  const navStyles  = solid ? "bg-[var(--primary)]" : "absolute backdrop-blur-md bg-white/40";
  const textStyles = solid ? "text-white"          : "text-[var(--primary)]";
  const isActive   = (path: string) => pathname === path;

  /* ── Variante GUEST (unauthenticated pages: /login, /register, etc.) ── */
  if (variant === "guest") {
    return (
      <nav className="w-full fixed top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="fill-[var(--primary)] h-6" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-white bg-[var(--primary)] hover:opacity-90 transition-opacity px-4 py-2 rounded-xl"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  /* ── Variante APP ── */
  if (!isHome) {
    /* ── APP sin sesión: barra simplificada para visitantes ── */
    if (!user) {
      return (
        <nav className="w-full fixed top-0 z-50 bg-[var(--primary)] shadow-md">
          <div className="md:max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <Link href="/explore" className="flex items-center gap-2 shrink-0">
              <Logo className="fill-white h-5 md:h-7" />
            </Link>

            {/* Buscador compacto */}
            <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none">
                <IconSearch size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => dropdownResults.length > 0 && setShowDropdown(true)}
                placeholder="Buscar servicios, negocios..."
                autoComplete="off"
                className="w-full pl-9 pr-4 py-2 rounded-full text-sm bg-white/15 text-white placeholder-white/60 border border-white/25 focus:outline-none focus:bg-white/25 focus:border-white/50 transition-all"
              />
              {showDropdown && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100">
                  <div className="py-1">
                    {dropdownResults.map(n => (
                      <button key={n.id} onClick={() => { setShowDropdown(false); setSearchQuery(""); router.push(`/business/${n.id}`); }}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-purple-50 transition-colors">
                        <span className="block text-sm font-medium text-gray-900 truncate">{n.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTAs para invitado */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => router.push(`/login?next=${encodeURIComponent(pathname)}`)}
                className="text-sm font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all"
              >
                Iniciar sesión
              </button>
              <Link
                href="/register"
                className="text-sm font-semibold bg-white text-[var(--primary)] hover:opacity-90 transition-opacity px-4 py-2 rounded-xl"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </nav>
      );
    }

    return (
    <>
      <nav className="w-full fixed top-0 z-50 bg-[var(--primary)] shadow-md">
        <div className="md:max-w-[1200px] mx-auto px-4 h-16 flex items-center gap-4">

          {/* Logo — smaller on mobile, full size on md+ */}
          <Link href="/explore" className="flex items-center gap-2 shrink-0">
            <Logo className="fill-white h-5 md:h-7" />
          </Link>

          {/* Search */}
          <div className="flex-1 flex justify-center">
            <div ref={searchRef} className="relative w-full max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none">
                {isSearching ? (
                  <svg className="animate-spin" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                ) : (
                  <IconSearch size={18} />
                )}
              </span>

              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => dropdownResults.length > 0 && setShowDropdown(true)}
                placeholder="Buscar servicios, negocios..."
                autoComplete="off"
                className="w-full pl-9 pr-9 py-2 rounded-full text-sm bg-white/15 text-white placeholder-white/60 border border-white/25 focus:outline-none focus:bg-white/25 focus:border-white/50 transition-all duration-200"
              />

              {searchQuery && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors" aria-label="Limpiar búsqueda">
                  <IconX size={15} />
                </button>
              )}

              {showDropdown && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100">
                  <div className="py-1">
                    {dropdownResults.map(n => (
                      <button key={n.id} onClick={() => { setShowDropdown(false); setSearchQuery(""); router.push(`/business/${n.id}`); }}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-purple-50 transition-colors group">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <IconSearch size={14} className="text-[var(--primary)]" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-gray-900 truncate">{n.nombre}</span>
                          {(n.categoria || n.ciudad) && (
                            <span className="block text-xs text-gray-500 truncate">
                              {[n.categoria, n.ciudad].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100">
                    <button onClick={() => { setShowDropdown(false); router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`); }}
                      className="w-full px-4 py-2.5 text-sm text-[var(--primary)] font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                      <IconSearch size={14} />
                      Ver todos los resultados de &ldquo;{searchQuery}&rdquo;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Profile */}
            <Link href="/user" title="Perfil"
              className={`${isActive("/user") && "bg-white"} p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200`}>
              <IconUser size={22} stroke={1.6} className={`${isActive("/user") && "stroke-[var(--primary)]"}`} />
            </Link>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button id="notifications-btn" title="Notificaciones"
                onClick={() => { 
                  setNotifOpen(v => !v); 
                  markAllRead(); 
                  // Solicitar permiso amistosamente al navegador
                  if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
                    Notification.requestPermission();
                  }
                }}
                className="relative p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200">
                <IconBell size={22} stroke={1.6} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-red-500 ring-2 ring-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm">Notificaciones</h3>
                    <div className="flex items-center gap-2">
                      {notificaciones.length > 0 && (
                        <button onClick={markAllRead} className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1">
                          <IconChecks size={13} /> Marcar leídas
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <IconX size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notificaciones.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <IconBell size={22} className="text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Sin notificaciones</p>
                        <p className="text-xs text-gray-400 mt-1">Tus citas y alertas aparecerán aquí</p>
                      </div>
                    ) : (
                      notificaciones.map(notif => (
                        <div key={notif.id}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${notif.leida ? "opacity-60" : ""}`}>
                          <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${notifColorMap[notif.tipo]}`}>
                            {notifIconMap[notif.tipo]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 leading-tight">{notif.titulo}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{notif.descripcion}</p>
                          </div>
                          {!notif.leida && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--primary)] mt-2" />}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-gray-100">
                    <Link href="/agenda" onClick={() => setNotifOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 text-sm text-[var(--primary)] font-medium hover:bg-purple-50 transition-colors">
                      <IconCalendar size={15} /> Ver toda mi agenda
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Agenda */}
            <Link href="/agenda" title="Agenda"
              className={`${isActive("/agenda") && "bg-white"} p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200`}>
              <IconLibrary size={22} stroke={1.6} className={`${isActive("/agenda") && "stroke-[var(--primary)]"}`} />
            </Link>

            {/* Auth button — logout if logged in, login if guest */}
            {user ? (
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200"
              >
                <IconLogout size={22} stroke={1.6} />
              </button>
            ) : (
              <button
                onClick={() => router.push(`/login?next=${encodeURIComponent(pathname)}`)}
                title="Iniciar sesi\u00f3n"
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200"
              >
                <IconLogin size={22} stroke={1.6} />
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* ── CUSTOM LIVE TOAST ── */}
      {liveToast && (
        <div 
          className={`fixed bottom-6 right-6 z-[9999] max-w-sm w-full bg-white rounded-xl shadow-2xl border-l-4 border-[var(--primary)] p-4 transform transition-all duration-500 ease-out ${
            liveToast.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
              <IconBell size={18} className="text-[var(--primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{liveToast.title}</p>
              <p className="text-xs text-gray-600 leading-snug">{liveToast.message}</p>
            </div>
            <button 
              onClick={() => setLiveToast({ ...liveToast, visible: false })}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <IconX size={16} />
            </button>
          </div>
        </div>
      )}
    </>
    );
  }

  /* ── Variante HOME ── */
  return (
    <nav className={`p-4 w-full fixed top-0 z-50 transition-all ${navStyles} ${textStyles}`}>
      <div className="md:max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        <Link href="/index" className="flex items-center gap-2">
          <Logo className={`${solid ? "fill-white" : "fill-[var(--primary)]"} h-7`} />
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/login?next=${encodeURIComponent(pathname)}`)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl border-2 transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5
              ${solid
                ? "border-white/60 text-white hover:bg-white/15"
                : "border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10"
              }`}
          >
            Iniciar sesión
          </button>
          <Link href="/register">
            <span className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5
              ${solid
                ? "bg-white text-[var(--primary)]"
                : "bg-[var(--primary)] text-white"
              }`}>
              Registrate
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
