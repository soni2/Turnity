"use client";

import { useState, useEffect } from "react";
import Logo from "./Logo";
import { Buttons } from "./Buttons";
import { SearchIcon } from "./Icons";

export default function Header({ search }: { search?: boolean }) {
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const height = window.innerHeight;
      if (window.scrollY > height - 65) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <nav
      className={`p-4 w-full transition-all fixed top-0 ${isFixed ? "bg-[var(--primary)] z-50" : "absolute backdrop-blur-md bg-white/40 z-50"} text-white`}
    >
      {/* Logo */}
      <div className="md:max-w-[1200px] mx-auto flex items-center justify-between">
        <span
          className={`text-3xl font-bold  ${isFixed ? "bg-white" : "bg-gradient-to-r from-purple-700 to-pink-600"} bg-clip-text text-transparent`}
        >
          <Logo
            className={`${isFixed ? "fill-white" : "fill-[var(--primary)]"} h-8`}
          />
        </span>
        {search && (
          <div className="relative max-w-[300px] mx-auto">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar servicios, estilistas..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        )}
        <div className={`flex items-center space-x-4 content-center`}>
          <button
            className={`bg-[var(--primary)] py-3 px-8 rounded-md uppercase font-bold  ${!isFixed ? "text-white" : "text-[var(--primary)] bg-white"}`}
          >
            Iniciar sesión
          </button>

          <div
            className={`text-[var(--primary)] uppercase font-bold  ${isFixed ? "text-white" : "text-[var(--primary)]"}`}
          >
            REGISTER
          </div>
        </div>
      </div>
    </nav>
  );
}

export function HeaderTwo() {
  return (
    <nav
      className={`p-4 w-full transition-all fixed top-0 bg-[var(--primary)] z-50 text-white`}
    >
      {/* Logo */}
      <div className="md:max-w-[1200px] mx-auto flex items-center justify-between">
        <span
          className={`text-3xl font-bold bg-white bg-clip-text text-transparent`}
        >
          <Logo className="fill-white h-8" />
        </span>
        <div className="relative mx-auto w-full max-w-[500px]">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Buscar servicios, estilistas..."
              className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white/90 
                 placeholder:text-gray-500 placeholder:italic"
            />

            <button className="absolute right-2 bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
              Buscar
            </button>

            <div className="absolute left-4 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        {/* <div className={`flex items-center space-x-4 content-center`}>
          <button
            className={`bg-[var(--primary)] py-3 px-8 rounded-md uppercase font-bold text-white  bg-white`}
          >
            Iniciar sesión
          </button>

          <div className={`uppercase font-bold text-white`}>REGISTER</div>
        </div> */}
      </div>
    </nav>
  );
}
