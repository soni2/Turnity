"use client";

import { useState, useEffect } from "react";
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
} from "@tabler/icons-react";
import { auth } from "@/lib/auth";

type HeaderProps = {
  variant?: "home" | "app";
};

export default function Header({ variant = "home" }: HeaderProps) {
  const [isFixed, setIsFixed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");

  const isHome = variant === "home";
  const solid = !isHome || isFixed;

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      const height = window.innerHeight;
      setIsFixed(window.scrollY > height - 65);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);
  const navStyles = solid
    ? "bg-[var(--primary)]"
    : "absolute backdrop-blur-md bg-white/40";

  const textStyles = solid ? "text-white" : "text-[var(--primary)]";

  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  /* ── Variante APP ── */
  if (!isHome) {
    return (
      <nav className="w-full fixed top-0 z-50 bg-[var(--primary)] shadow-md">
        <div className="md:max-w-[1200px] mx-auto px-4 h-16 flex items-center gap-4">
          {/* ── Izquierda: Logo ── */}
          <Link href="/explore" className="flex items-center gap-2 shrink-0">
            <Logo className="fill-white h-7" />
          </Link>

          {/* ── Centro: Barra de búsqueda ── */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <IconSearch size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar servicios, negocios..."
                className="
                  w-full pl-9 pr-4 py-2 rounded-full text-sm
                  bg-white/15 text-white placeholder-white/60
                  border border-white/25
                  focus:outline-none focus:bg-white/25 focus:border-white/50
                  transition-all duration-200
                "
              />
            </div>
          </div>

          {/* ── Derecha: Iconos de acción ── */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Perfil */}
            <Link
              href="/user"
              title="Perfil"
              className={`${isActive("/user") && "bg-white "} p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200`}
            >
              <IconUser
                size={22}
                stroke={1.6}
                className={`${isActive("/user") && "stroke-[var(--primary)]"}`}
              />
            </Link>

            {/* Notificaciones */}
            <button
              title="Notificaciones"
              className="relative p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200"
            >
              <IconBell size={22} stroke={1.6} />
              {/* Badge de notificación */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 ring-2 ring-[var(--primary)]" />
            </button>

            {/* Agenda */}
            <Link
              href="/agenda"
              title="Agenda"
              className={`${isActive("/agenda") && "bg-white "} p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200`}
            >
              <IconLibrary
                size={22}
                stroke={1.6}
                className={`${isActive("/agenda") && "stroke-[var(--primary)]"}`}
              />
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  /* ── Variante HOME (sin cambios) ── */
  return (
    <nav
      className={`p-4 w-full fixed top-0 z-50 transition-all ${navStyles} ${textStyles}`}
    >
      <div className="md:max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/index" className="flex items-center gap-2">
          <Logo
            className={`${solid ? "fill-white" : "fill-[var(--primary)]"} h-7`}
          />
        </Link>

        {/* Acciones */}
        <div className="flex items-center space-x-4">
          <Buttons onClick={() => router.push("/login")} className="p-0">
            Iniciar sesión
          </Buttons>
          <Link href="/register">
            <span
              className={`uppercase font-bold ${
                solid ? "text-white" : "text-[var(--primary)]"
              }`}
            >
              Registrar
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
