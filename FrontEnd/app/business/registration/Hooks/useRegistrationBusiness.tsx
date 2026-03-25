"use client";
import React, { useState } from "react";

import {
  Dia,
  FormData,
  HorarioDia,
  CampoHorarios,
} from "../types/registroNegocio";
import Paso1InfoBasica from "../components/Paso1InfoBasica";
import Paso2Ubicacion from "../components/Paso2Ubicacion";
import Paso3Horarios from "../components/Paso3Horarios";
import Paso4Servicios from "../components/Paso4Servicios";
import Paso5Equipo from "../components/Paso5Equipo";
import Paso6Fotos from "../components/Paso6Fotos";
import Paso7Pagos from "../components/Paso7Pagos";
import { createClient } from "@/lib/supabase/client";

export default function useRegistrationBusiness() {
  const [paso, setPaso] = useState(1);
  const [tipoHorario, setTipoHorario] = useState<"continuo" | "partido">(
    "continuo",
  );
  const [coordenadasMapa, setCoordenadasMapa] = useState({
    lat: 18.4861,
    lng: -69.9312,
  });

  const [direccionMapa, setDireccionMapa] = useState("");
  const [formData, setFormData] = useState<FormData>({
    // Paso 1: Información básica
    nombreNegocio: "",
    categoria: "",
    email: "",
    telefono: "",
    sitioWeb: "",

    // Paso 2: Ubicación
    direccion: "",
    ciudad: "Santo Domingo",
    // sector: "",
    coordenadas: "",

    // Paso 3: Horarios
    horarios: {
      lunes: { abierto: true, apertura: "09:00", cierre: "20:00" },
      martes: { abierto: true, apertura: "09:00", cierre: "20:00" },
      miercoles: { abierto: true, apertura: "09:00", cierre: "20:00" },
      jueves: { abierto: true, apertura: "09:00", cierre: "20:00" },
      viernes: { abierto: true, apertura: "09:00", cierre: "20:00" },
      sabado: { abierto: true, apertura: "09:00", cierre: "18:00" },
      domingo: { abierto: false, apertura: "09:00", cierre: "18:00" },
    },

    // Paso 4: Servicios
    servicios: [
      { id: 1, nombre: "", precio: "", duracion: "", descripcion: "" },
    ],

    // Paso 5: Equipo
    profesionales: [{ id: 1, nombre: "", especialidad: "", experiencia: "" }],

    // Paso 6: Fotos
    fotos: [] as File[],
    logo: null as File | null,

    // Paso 7: Métodos de pago
    metodosPago: {
      efectivo: true,
      tarjeta: false,
      transferencia: false,
    },
  });

  const renderPaso = () => {
    switch (paso) {
      case 1:
        return <Paso1InfoBasica />;

      case 2:
        return <Paso2Ubicacion />;

      case 3:
        return <Paso3Horarios />;

      case 4:
        return <Paso4Servicios />;

      case 5:
        return <Paso5Equipo />;

      case 6:
        return <Paso6Fotos />;

      case 7:
        return <Paso7Pagos />;

      default:
        return null;
    }
  };

  const handleUbicacionChange = (
    lat: number,
    lng: number,
    direccion: string,
  ) => {
    setCoordenadasMapa({ lat, lng });
    setDireccionMapa(direccion);

    // Actualizar el formData con la dirección y coordenadas
    setFormData((prev) => ({
      ...prev,
      direccion: direccion.split(",")[0] || direccion, // Tomar solo la primera parte
      coordenadas: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    }));
  };

  const [negocioCreado, setNegocioCreado] = useState(false);

  const categorias = [
    "Barbería",
    "Salón de belleza",
    "Centro de uñas",
    "Spa",
    "Centro de estética",
    "Peluquería infantil",
    "Centro de depilación",
    "Otro",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHorarioChange = <K extends CampoHorarios>(
    dia: Dia,
    campo: K,
    valor: HorarioDia[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: {
          ...prev.horarios[dia as keyof typeof prev.horarios],
          [campo]: valor,
        },
      },
    }));
  };

  const handleServicioChange = (id: number, campo: string, valor: string) => {
    setFormData((prev) => ({
      ...prev,
      servicios: prev.servicios.map((s) =>
        s.id === id ? { ...s, [campo]: valor } : s,
      ),
    }));
  };

  const agregarServicio = () => {
    const nuevoId = Math.max(...formData.servicios.map((s) => s.id)) + 1;
    setFormData((prev) => ({
      ...prev,
      servicios: [
        ...prev.servicios,
        { id: nuevoId, nombre: "", precio: "", duracion: "", descripcion: "" },
      ],
    }));
  };

  const eliminarServicio = (id: number) => {
    if (formData.servicios.length > 1) {
      setFormData((prev) => ({
        ...prev,
        servicios: prev.servicios.filter((s) => s.id !== id),
      }));
    }
  };

  const handleProfesionalChange = (
    id: number,
    campo: string,
    valor: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      profesionales: prev.profesionales.map((p) =>
        p.id === id ? { ...p, [campo]: valor } : p,
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const agregarProfesional = () => {
    const nuevoId = Math.max(...formData.profesionales.map((p) => p.id)) + 1;
    setFormData((prev) => ({
      ...prev,
      profesionales: [
        ...prev.profesionales,
        { id: nuevoId, nombre: "", especialidad: "", experiencia: "" },
      ],
    }));
  };

  const eliminarProfesional = (id: number) => {
    if (formData.profesionales.length > 1) {
      setFormData((prev) => ({
        ...prev,
        profesionales: prev.profesionales.filter((p) => p.id !== id),
      }));
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        fotos: [...prev.fotos, ...filesArray].slice(0, 5), // Máximo 5 fotos
      }));
    }
  };

  const eliminarFoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index),
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, logo: e.target.files![0] }));
    }
  };

  // const handleSubmit = () => {
  //   const supabase = createClient();
  //   const { data, error } = supabase.from("negocios").insert({
  //     nombre: formData.nombreNegocio,
  //     categoria: formData.categoria,
  //     email: formData.email,
  //     telefono: formData.telefono,
  //     sitio_web: formData.sitioWeb,
  //     direccion: formData.direccion,
  //     ciudad: formData.ciudad,
  //     sector: formData.sector,
  //     coordenadas: formData.coordenadas,
  //     horarios: formData.horarios,
  //     servicios: formData.servicios,
  //     dueno_id:
  //   });

  //   if (error) {
  //     console.error("Error al crear el negocio:", error);
  //   }
  //   // e.preventDefault();
  //   // // Aquí iría la lógica para enviar los datos al backend
  //   // console.log("Datos del negocio:", formData);
  //   // setNegocioCreado(true);
  // };

  return {
    paso,
    tipoHorario,
    coordenadasMapa,
    direccionMapa,
    formData,
    handleUbicacionChange,
    negocioCreado,
    categorias,
    handleChange,
    handleHorarioChange,
    handleServicioChange,
    agregarServicio,
    handleSubmit,
    eliminarServicio,
    handleProfesionalChange,
    agregarProfesional,
    eliminarProfesional,
    handleFotoChange,
    eliminarFoto,
    handleLogoChange,
    setPaso,
    setTipoHorario,
    setFormData,
    renderPaso,
  };
}
