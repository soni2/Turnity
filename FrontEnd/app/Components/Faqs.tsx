"use client";
import { useState } from "react";

export default function Faqs() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const preguntas = [
    {
      pregunta: "¿Cómo reservo una cita?",
      respuesta:
        "Abre la app, busca a tu estilista, elige un horario y confirma. Listo.",
    },
    {
      pregunta: "¿Puedo cancelar en cualquier momento?",
      respuesta:
        "Sí. Puedes cancelar hasta dos horas antes de tu cita sin ningún cargo.",
    },
    {
      pregunta: "¿Qué pasa si llego tarde?",
      respuesta:
        "Avísale a tu estilista a través de la app. Ellos te guardarán el turno si es posible.",
    },
    {
      pregunta: "¿Puedo elegir a mi estilista de preferencia?",
      respuesta:
        "Por supuesto. Filtra por nombre o por estilo para encontrar exactamente a quien buscas.",
    },
    {
      pregunta: "¿Cómo sé qué estilista me conviene?",
      respuesta:
        "Cada perfil incluye reseñas y valoraciones de clientes reales para que elijas con confianza.",
    },
  ];

  const togglePregunta = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    //full width full height
    <>
      {preguntas.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
        >
          <button
            onClick={() => togglePregunta(index)}
            className="w-full text-left p-6 focus:outline-none hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-semibold text-black pr-8">
                {item.pregunta}
              </h3>
              <span className="text-2xl text-gray-500">
                {openQuestion === index ? "−" : "+"}
              </span>
            </div>
          </button>

          {openQuestion === index && (
            <div className="px-6 pb-6">
              <p className="text-gray-500 border-t pt-4">{item.respuesta}</p>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
