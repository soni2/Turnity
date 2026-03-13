"use client";
import React from "react";

{
  /* Botón de iniciar */
}
export const Buttons = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <button
      className={`group relative mt-8 px-10 py-5  bg-[var(--primary)]
        font-bold rounded-xl overflow-hidden
        transition-all duration-300 shadow-xl
        hover:shadow-2xl hover:from-purple-700 hover:to-pink-600
        transform hover:-translate-y-1
        active:translate-y-0 active:shadow-lg flex items-center justify-center ${className}`}
    >
      <span className="relative uppercase flex items-center gap-2 text-white">
        {children}
      </span>
    </button>
  );
};
