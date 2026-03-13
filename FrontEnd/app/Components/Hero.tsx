"use client";
import { Titles } from "./Titles";
import { Buttons } from "./Buttons";
import Logo from "./Logo";

export default function Hero() {
  return (
    <div className="min-h-vh mt-12 bg-white">
      <div className="container max-w-7xl mx-auto px-4 pb-16">
        <div
          className="flex items-center gap-16 min-h-[800px]"
          style={{
            backgroundImage: "url(/hero1.png)",
            backgroundSize: "contain",
            backgroundPosition: "right center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex-1 space-y-8">
            {/* <Logo className="h-20" /> */}
            <Titles className="text-left">Define tu estilo</Titles>

            {/* Texto de descripción - Adaptado para barberías/salones */}
            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
              La plataforma perfecta para barberías, salones de belleza y
              centros de estética. Organiza tus citas, gestiona tu equipo y haz
              crecer tu negocio.
            </p>

            <Buttons>Iniciar ahora</Buttons>

            {/* Estadísticas
            <div className="flex gap-8 pt-8">
              <div>
                <span className="text-2xl font-bold text-gray-900">500+</span>
                <p className="text-sm text-gray-500">Salones activos</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">10k+</span>
                <p className="text-sm text-gray-500">Turnos/mes</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">98%</span>
                <p className="text-sm text-gray-500">Satisfacción</p>
              </div>
            </div> */}
          </div>

          {/* Columna derecha - Imagen placeholder con temática de estilismo */}
          {/* <div className="flex-1 h-full min-h-fit">
            <img src="/hero1.png" alt="hero" className="h-vh object-fill" />
          </div> */}
          {/* <div className="flex-1">
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-purple-200 
                            rounded-full opacity-30 blur-3xl"></div>
              <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-pink-200 
                            rounded-full opacity-30 blur-3xl"></div>
              
              <div className="relative w-full aspect-square bg-gradient-to-br 
                            from-purple-400 to-pink-500 rounded-3xl shadow-2xl
                            flex items-center justify-center overflow-hidden
                            transform hover:scale-105 transition-transform duration-500
                            hover:shadow-3xl">
                
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 text-6xl">💇‍♂️</div>
                  <div className="absolute bottom-10 right-10 text-6xl">💅</div>
                  <div className="absolute top-20 right-20 text-6xl">✂️</div>
                  <div className="absolute bottom-20 left-20 text-6xl">💆‍♀️</div>
                </div>
                
                <div className="absolute inset-0">
                  <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-white 
                                bg-opacity-20 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-white 
                                bg-opacity-20 rounded-full animate-pulse delay-1000"></div>
                </div>
                
                <span className="relative z-10 text-white text-3xl font-bold 
                               bg-black bg-opacity-30 px-8 py-4 
                               rounded-2xl backdrop-blur-sm
                               border-2 border-white border-opacity-30">
                  ESTILO PRO
                </span>
                
                <div className="absolute top-8 left-8 w-16 h-16 border-2 
                              border-white border-opacity-30 rounded-2xl 
                              rotate-12"></div>
                <div className="absolute bottom-8 right-8 w-20 h-20 border-2 
                              border-white border-opacity-30 rounded-full"></div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
