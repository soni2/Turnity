"use client";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  /** Si se pasa className, REEMPLAZA los estilos de variante base. */
  className?: string;
};

export const Buttons = ({ children, className, disabled, ...props }: ButtonProps) => {
  // Estilos base que siempre se aplican
  const base =
    "relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl " +
    "transition-all duration-200 select-none cursor-pointer " +
    "hover:brightness-110 hover:-translate-y-0.5 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)]";

  // Si el className externo NO incluye un color de fondo explícito ni padding, agregamos los por defecto
  const hasBg = className?.includes("bg-");
  const hasText = className?.includes("text-");
  const hasPadding = className?.includes("p-") || className?.includes("px-") || className?.includes("py-");

  const defaultColors = `${!hasBg ? "bg-[var(--primary)]" : ""} ${!hasText ? "text-white" : ""} ${!hasPadding ? "px-6 py-3" : ""}`;

  // Estilo cuando está deshabilitado
  const disabledStyle = "opacity-50 cursor-not-allowed pointer-events-none";

  const finalClass = [
    base,
    defaultColors,
    className,
    disabled ? disabledStyle : "",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <button
      {...props}
      disabled={disabled}
      className={finalClass}
    >
      {children}
    </button>
  );
};
