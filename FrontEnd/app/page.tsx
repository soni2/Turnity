"use client";
import Hero from "./Components/Hero";
import Section from "./Components/Section";
// import Clients from "./Components/Clients";
// import Faqs from "./Components/Faqs";
import Card from "./Components/Card";
import { Buttons } from "./Components/Buttons";
import ClientsCard from "./Components/ClientsCard";
import { RegisterIcon, SearchIcon, TickIcon } from "./Components/Icons";
import Faqs from "./Components/Faqs";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconX } from "@tabler/icons-react";

export default function Home() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const testimonios = [
    {
      texto:
        "Reservé mi corte en menos de un minuto. Se acabó andar llamando por todos lados.",
      autor: "Carlos Méndez",
      estrellas: 5,
      img: "/person1.jpg",
    },
    {
      texto:
        "Encontré un estilista que de verdad entiende mi estilo. La app lo hizo súper fácil.",
      autor: "Javier Ramírez",
      estrellas: 5,
      img: "/person2.jpg",
    },
    {
      texto:
        "Las confirmaciones y recordatorios evitan que se me olviden las citas.",
      autor: "Diego Fernández",
      estrellas: 4,
      img: "/person3.jpg",
    },
  ];

  const steps = [
    {
      title: "Crea tu cuenta",
      description:
        "Obtén la plantilla de la App de Reserva de Estilistas en tu teléfono y regístrate con tus datos.",
      icon: <RegisterIcon className="mb-6" />,
    },
    {
      title: "Encuentra a tu estilista",
      description:
        "Busca por ubicación, estilo o nombre para descubrir a tu match perfecto.",
      icon: <SearchIcon className="mb-6" />,
    },
    {
      title: "Confirma tu cita",
      description:
        "Selecciona tu horario y recibe una confirmación instantánea con todos los detalles que necesitas.",
      icon: <TickIcon className="mb-6" />,
    },
  ];

  const mainFunctions = [
    {
      title: "Reserva online fácil",
      description:
        "Organiza tus citas cuando quieras, sin llamadas ni esperas.",
      img: "/func1.jpg",
    },
    {
      title: "Expertos a tu alcance",
      description:
        "Perfiles detallados con reseñas reales para que encuentres a los estilistas perfectos.",
      img: "/func2.jpg",
    },
    {
      title: "Confirmación al instante",
      description:
        "Descarga la app y crea tu cuenta en menos de un minuto para empezar a reservar.",
      img: "/func3.jpg",
    },
  ];

  function handleRouter(path: string) {
    router.push(path);
  }

  return (
    <div>
      <Header />
      <Hero />
      {/* Sección de funciones */}
      <Section
        title="TU TURNO IDEAL, SIN COMPLICACIONES"
        description="Reserva tu lugar con solo unos toques y recibe confirmación instantánea de tu estilista."
        button={true}
        buttonText="Explora más funciones"
        onButtonClick={() => setShowModal(true)}
      >
        {mainFunctions.map((funcion, index) => (
          <Card
            key={index}
            title={funcion.title}
            description={funcion.description}
            className="flex flex-col  items-center gap-3"
          >
            <img
              src={funcion.img}
              alt="funcion"
              className="w-full h-54 object-cover object-center"
            />
          </Card>
        ))}
      </Section>

      {/* Sección de pasos */}
      <Section
        title="3 simples pasos para agendar tu turno"
        description="Reserva tu lugar con solo unos toques y recibe confirmación instantánea de tu estilista."
        button={false}
        background="purple"
      >
        {steps.map((step, index) => (
          <Card
            key={index}
            title={step.title}
            description={step.description}
            background="purple"
            className="flex flex-col  items-center gap-3"
          >
            {step.icon}
          </Card>
        ))}
      </Section>

      {/* Sección de clientes */}
      <Section
        title="¿QUÉ DICEN NUESTROS CLIENTES?"
        description="Ellos vivieron la experiencia"
        button={false}
      >
        {testimonios.map((testimonio, index) => (
          <ClientsCard
            key={index}
            texto={testimonio.texto}
            autor={testimonio.autor}
            estrellas={testimonio.estrellas}
            image={testimonio.img}
          />
        ))}
      </Section>

      <Section
        title="Preguntas frecuentes"
        description="Todo lo que necesitas saber sobre cómo reservar y usar la app"
        gridMd="md:grid-cols-1"
        gap="gap-2"
      >
        <Faqs />
      </Section>

      <Section
        title="¿Listo para ocupar esa silla?"
        description="Empieza a reservar tus turnos hoy."
        button={false}
        background="purple"
        gridMd="md:grid-cols-2"
      >
        <Buttons
          onClick={() => handleRouter("/explore")}
          className="w-full bg-black border-2 border-black"
        >
          Explorar negocios
        </Buttons>
        <Buttons
          onClick={() => handleRouter("/register")}
          className="w-full border-2 border-white"
        >
          Crea una cuenta gratis
        </Buttons>
      </Section>
      <Footer />

      {/* Modal Extra Features */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
               <IconX size={24} />
            </button>
            <h2 className="text-3xl font-extrabold text-[var(--primary)] mb-6 text-center md:text-left">Todo lo que necesitas, en Turnity</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
               <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100/50 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-2 whitespace-nowrap">🔔 Notificaciones en tiempo real</h3>
                 <p className="text-sm text-gray-600 leading-relaxed">Recibe alertas instantáneas y recordatorios en tu cuenta y calendario cuando modifiquen tu cita.</p>
               </div>
               <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100/50 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-2 whitespace-nowrap">✂️ Múltiples estilistas</h3>
                 <p className="text-sm text-gray-600 leading-relaxed">Un mismo negocio puede organizar múltiples barberos/estilistas y agendar sus horarios de forma independiente.</p>
               </div>
               <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100/50 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-2 whitespace-nowrap">⭐ Reseñas y reputación</h3>
                 <p className="text-sm text-gray-600 leading-relaxed">Asegura tu visita leyendo valoraciones verificadas de otros clientes sobre sus experiencias en la tienda.</p>
               </div>
               <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100/50 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-2 whitespace-nowrap">📊 Panel administrativo</h3>
                 <p className="text-sm text-gray-600 leading-relaxed">Si administras un negocio, obtienes un dashboard potente para gestionar finanzas y empleados.</p>
               </div>
            </div>
            
            <div className="mt-8 text-center border-t border-gray-100 pt-6">
              <button 
                onClick={() => {setShowModal(false); handleRouter("/explore");}}
                className="bg-[var(--primary)] text-white px-8 py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg w-full md:w-auto"
              >
                Empezar a explorar ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
