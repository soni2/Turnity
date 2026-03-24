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

        {/* 🔍 Buscador */}
        {!isHome && (
          // 🔹 APP (buscador completo)
          <div className="relative w-full max-w-[500px] mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Buscar servicios, estilistas..."
                className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black bg-white/90 placeholder:text-gray-500 placeholder:italic text-black"
              />

              <button className="absolute right-2 bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                Buscar
              </button>

              <SearchIcon className="absolute left-4 h-5 w-5 text-gray-400" />
            </div>
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
