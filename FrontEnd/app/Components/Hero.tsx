"use client";
import { Titles } from "./Titles";
import { Buttons } from "./Buttons";
import { useFunctions } from "../hooks/useFunctions";

export default function Hero() {
  const { handleRouter } = useFunctions();

  return (
    <div className="min-h-vh mt-12 bg-white">
      <div className="container max-w-7xl mx-auto px-4 pb-16 ">
        <div
          className="flex items-center gap-16 min-h-[800px] grid grid-cols-5"
          style={{
            backgroundImage: "url(/hero1.png)",
            backgroundSize: "contain",
            backgroundPosition: "right center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex-1 col-span-full space-y-8 md:col-span-2">
            {/* <Logo className="h-20" /> */}
            <Titles className="text-left">Define tu estilo</Titles>

            {/* Texto de descripción - Adaptado para barberías/salones */}
            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
              La plataforma perfecta para barberías, salones de belleza y
              centros de estética. Organiza tus citas, gestiona tu equipo y haz
              crecer tu negocio.
            </p>

            <Buttons onClick={() => handleRouter("/explore")}>
              Explorar negocios
            </Buttons>
          </div>
        </div>
      </div>
    </div>
  );
}
