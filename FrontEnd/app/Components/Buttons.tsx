"use client";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

{
  /* Botón de iniciar */
}
export const Buttons = ({ children, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={`group relative px-10 py-5  bg-[var(--primary)]
        font-bold rounded-xl overflow-hidden
        transition-all duration-300 shadow-xl
        hover:shadow-2xl hover:from-purple-700
        transform hover:-translate-y-1 w-full cursor-pointer
        active:translate-y-0 active:shadow-lg flex items-center justify-center ${props.className}`}
    >
      <span className="relative uppercase flex items-center gap-2 text-white">
        {children}
      </span>
    </button>
  );
};
