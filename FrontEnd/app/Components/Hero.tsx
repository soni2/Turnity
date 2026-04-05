"use client";
import { Titles } from "./Titles";
import { Buttons } from "./Buttons";
import { useFunctions } from "../hooks/useFunctions";

export default function Hero() {
  const { handleRouter } = useFunctions();

  return (
    <div className="min-h-vh mt-12 bg-white">
      <div className="container max-w-7xl mx-auto px-4 pb-16 ">
        <div className="items-center gap-8 md:gap-16 min-h-[600px] md:min-h-[800px] grid grid-cols-1 md:grid-cols-5">
          {/* Contenido de Texto */}
          <div className="col-span-1 md:col-span-2 space-y-8 flex flex-col justify-center">
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

          {/* Imagen ilustrativa en la parte derecha */}
          <div className="hidden md:flex col-span-3 items-center justify-end h-full w-full">
            <img 
              src="/hero1.png" 
              alt="Plataforma para salones y barberías" 
              className="object-contain object-right w-full h-full max-h-[800px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
