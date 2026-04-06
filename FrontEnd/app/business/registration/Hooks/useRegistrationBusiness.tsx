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
import { create } from "domain";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [direccionMapa, setDireccionMapa] = useState("");
  const [formData, setFormData] = useState<FormData>({
    // Paso 1: Información básica
    nombreNegocio: "",
    categoria: "",
    descripcion: "",
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

  const [logoUp, setLogoUp] = useState<File | null>(null);

  const [buttonDisabled, setButtonDisabled] = useState(false);

  const renderPaso = () => {
    switch (paso) {
      case 1:
        return (
          <Paso1InfoBasica
            categorias={categorias}
            formData={formData}
            handleChange={handleChange}
            buttonDisabled={buttonDisabled}
            setButtonDisabled={setButtonDisabled}
          />
        );

      case 2:
        return (
          <Paso2Ubicacion
            formData={formData}
            handleUbicacionChange={handleUbicacionChange}
            coordenadasMapa={coordenadasMapa}
            direccionMapa={direccionMapa}
          />
        );

      case 3:
        return (
          <Paso3Horarios
            formData={formData}
            handleHorarioChange={handleHorarioChange}
            tipoHorario={tipoHorario}
            setTipoHorario={setTipoHorario}
          />
        );

      case 4:
        return (
          <Paso4Servicios
            formData={formData}
            handleServicioChange={handleServicioChange}
            agregarServicio={agregarServicio}
            eliminarServicio={eliminarServicio}
          />
        );

      case 5:
        return (
          <Paso6Fotos
            formData={formData}
            setFormData={setFormData}
            handleFotoChange={handleFotoChange}
            handleLogoChange={handleLogoChange}
            eliminarFoto={eliminarFoto}
          />
        );

      case 6:
        return <Paso7Pagos formData={formData} setFormData={setFormData} />;

      default:
        return null;
    }
  };

  const handleUbicacionChange = (
    lat: number,
    lng: number,
    direccionCompleta: string,
    address?: {
      city?: string;
      town?: string;
      village?: string;
      municipality?: string;
      state?: string;
      country?: string;
    },
  ) => {
    setCoordenadasMapa({ lat, lng });
    setDireccionMapa(direccionCompleta);

    // direccion = coordenadas como string
    const coordStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    // ciudad = "Localidad, País" extraído del objeto Nominatim
    const localidad =
      address?.city ??
      address?.town ??
      address?.village ??
      address?.municipality ??
      address?.state ??
      "";
    const pais = address?.country ?? "";
    const ciudadStr = localidad && pais
      ? `${localidad}, ${pais}`
      : localidad || pais || direccionCompleta.split(",").slice(-2).join(",").trim();

    setFormData((prev) => ({
      ...prev,
      direccion: coordStr,
      coordenadas: coordStr,
      ciudad: ciudadStr,
    }));
  };

  const [negocioCreado, setNegocioCreado] = useState<{
    id: string;
    nombre: string;
  } | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
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
        fotos: [...prev.fotos, ...filesArray].slice(0, 3),
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
    // if (e.target.files && e.target.files[0]) {
    //   setFormData((prev) => ({ ...prev, logo: e.target.files![0] }));
    // }
    setLogoUp(e.target.files![0]);
    setFormData((prev) => ({ ...prev, logo: e.target.files![0] }));
  };

  async function uploadFileToSupabase(
    file: File,
    path: string,
    userId: string,
  ) {
    const supabase = createClient();

    const { data, error } = await supabase.storage
      .from("negocios")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        metadata: { userId },
      });

    if (error) {
      console.error("Error al subir archivo:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("negocios")
      .getPublicUrl(path);
    return urlData.publicUrl;
  }

  const handleCreate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error en el servidor:", errorText);
        return;
      }

      const responseData = await res.json();
      const negocio = responseData.data;

      if (!negocio) {
        console.error("No se recibió la información del negocio");
        return;
      }

      if (logoUp) {
        const logoUrl = await uploadFileToSupabase(
          logoUp,
          `/${negocio.id}/logo.png`,
          negocio.dueno_id,
        );

        if (logoUrl) {
          await fetch("/api/update-logo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ negocioId: negocio.id, logoUrl }),
          })
            .then((res) => res.json())
            .then((res) => console.log(res));
        }
      }

      if (formData.fotos && formData.fotos.length > 0) {
        const fotosUrls: string[] = [];

        for (let i = 0; i < formData.fotos.length; i++) {
          const foto = formData.fotos[i];
          const extension = foto.name.split(".").pop() || "jpg";
          const path = `/${negocio.id}/fotos/foto_${i + 1}.${extension}`;

          const fotoUrl = await uploadFileToSupabase(
            foto,
            path,
            negocio.dueno_id,
          );

          if (fotoUrl) {
            fotosUrls.push(fotoUrl);
          }
        }

        if (fotosUrls.length > 0) {
          await fetch("/api/update-fotos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ negocioId: negocio.id, fotosUrls }),
          })
            .then((res) => res.json())
            .then((res) => console.log("Fotos actualizadas:", res));
        }
      }

      // ✅ Marcar negocio como creado para mostrar pantalla de éxito
      setNegocioCreado({ id: negocio.id, nombre: negocio.nombre ?? formData.nombreNegocio });
      console.log("Proceso finalizado con éxito");
    } catch (err) {
      console.error("Error crítico en handleCreate:", err);
    } finally {
      setIsSubmitting(false);
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

  /**
   * Valida si el paso actual tiene todos sus campos esenciales completos.
   * Retorna true si se puede avanzar al siguiente paso.
   */
  const isPasoValido = (numeroPaso: number): boolean => {
    switch (numeroPaso) {
      case 1:
        return (
          formData.nombreNegocio.trim() !== "" &&
          formData.categoria !== "" &&
          formData.email.trim() !== "" &&
          formData.telefono.trim() !== ""
        );
      case 2:
        // Válido si el usuario hizo clic en el mapa (coordenadas no vacías)
        return formData.coordenadas.trim() !== "";
      case 3:
        // Válido si al menos un día de la semana está abierto
        return Object.values(formData.horarios).some((d) => d.abierto);
      case 4:
        // Cada servicio debe tener nombre, precio y duración
        return formData.servicios.every(
          (s) =>
            s.nombre.trim() !== "" &&
            s.precio.toString().trim() !== "" &&
            s.duracion.toString().trim() !== "",
        );
      case 5:
        // El logo es obligatorio para continuar
        return formData.logo !== null;
      case 6:
        // Al menos un método de pago seleccionado
        return Object.values(formData.metodosPago).some(Boolean);
      default:
        return true;
    }
  };

  return {
    paso,
    tipoHorario,
    coordenadasMapa,
    direccionMapa,
    formData,
    negocioCreado,
    categorias,
    handleUbicacionChange,
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
    handleCreate,
    isPasoValido,
    isSubmitting,
  };
}
