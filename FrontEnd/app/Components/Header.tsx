"use client";

import { useState, useEffect } from "react";
import Logo from "./Logo";
import { SearchIcon } from "./Icons";
import Link from "next/link";
import { Buttons } from "./Buttons";
import { useRouter } from "next/navigation";

type HeaderProps = {
  variant?: "home" | "app";
};

export default function Header({ variant = "home" }: HeaderProps) {
  const [isFixed, setIsFixed] = useState(false);

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

  // 🎨 estilos dinámicos
  const navStyles = solid
    ? "bg-[var(--primary)]"
    : "absolute backdrop-blur-md bg-white/40";

  const textStyles = solid ? "text-white" : "text-[var(--primary)]";

  const router = useRouter();

  return (
    <nav
      className={`p-4 w-full fixed top-0 z-50 transition-all ${navStyles} ${textStyles}`}
    >
      <div className="md:max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        {/* 🔷 Logo */}
        <Logo
          className={`${solid ? "fill-white" : "fill-[var(--primary)]"} h-8`}
        />

        {/* 🎯 Navegación central (App) */}
        {!isHome && (
          <div className="hidden lg:flex items-center space-x-12 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/explore" className="font-bold text-lg hover:opacity-80 transition-opacity">
              Inicio
            </Link>
            <Link href="/agenda" className="font-medium hover:opacity-80 transition-opacity">
              Agenda
            </Link>
            <Link href="/user" className="font-medium hover:opacity-80 transition-opacity">
              Perfil
            </Link>
          </div>
        )}

        {/* 🎯 Acciones (solo en home) */}
        {isHome && (
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
        )}
      </div>
    </nav>
  );
}
