"use client";

import { useState, useEffect } from "react";
import Logo from "./Logo";
import Link from "next/link";
import { Buttons } from "./Buttons";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { auth } from "@/lib/auth";

type HeaderProps = {
  variant?: "home" | "app";
};

export default function Header({ variant = "home" }: HeaderProps) {
  const [isFixed, setIsFixed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

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
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();

  }, [supabase]);
  const navStyles = solid
    ? "bg-[var(--primary)]"
    : "absolute backdrop-blur-md bg-white/40";

  const textStyles = solid ? "text-white" : "text-[var(--primary)]";

  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

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

        {/* 🎯 Navegación central (App) */}
        {!isHome && (
          <div className="hidden lg:flex items-center space-x-12 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/explore"
              className={`${
                isActive("/explore") ? "font-bold text-lg" : "font-medium"
              } hover:opacity-80 transition-opacity`}
            >
              Inicio
            </Link>
            <Link
              href="/agenda"
              className={`${
                isActive("/agenda") ? "font-bold text-lg" : "font-medium"
              } hover:opacity-80 transition-opacity`}
            >
              Agenda
            </Link>
            <Link
              href="/user"
              className={`${
                isActive("/user") ? "font-bold text-lg" : "font-medium"
              } hover:opacity-80 transition-opacity`}
            >
              Perfil
            </Link>
          </div>
        )}

        {/* 🎯 Acciones */}
        <div className="flex items-center space-x-4">
          {isHome && !user && (
            <>
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
            </>
          )}
          {user && (
            <button
              onClick={async () => {
                await auth.logout();
                router.push("/login");
              }}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Cerrar sesión"
            >
              <IconLogout size={24} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
