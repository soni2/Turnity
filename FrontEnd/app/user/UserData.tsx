"use client";
import React, { useState } from "react";
import Header from "../Components/Header";
import MobileNav from "../Components/MobileNav";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ── Sub-components ─────────────────────────────────────────────────────────────
import ProfileHeader from "./Components/ProfileHeader";
import ContactInfo from "./Components/ContactInfo";
import Preferences from "./Components/Preferences";
import AppointmentHistory from "./Components/AppointmentHistory";
import BusinessSidebar from "./Components/BusinessSidebar";

// ── Types ──────────────────────────────────────────────────────────────────────
import { Cita } from "./userTypes";

interface Negocio {
  id: string;
  nombre: string;
  logo_url: string;
}

interface UserDataProps {
  userId: string;
  name: string;
  email: string;
  phone: string;
  detalles: string;
  registerDate: string;
  profilePicture: string;
  direction: string;
  citas?: Cita[];
  negocio?: Negocio[];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function UserData({
  userId,
  name,
  email,
  phone,
  detalles,
  registerDate,
  profilePicture,
  direction,
  negocio = [],
  citas = [],
}: UserDataProps) {
  const router = useRouter();

  // ── Edit state ────────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: name || "",
    telefono: phone || "",
    direction: direction || "",
    detalles: detalles || "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFoto(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPreviewUrl(null);
    setFoto(null);
    setFormData({
      nombre: name || "",
      telefono: phone || "",
      detalles: detalles || "",
      direction: direction || "",
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const supabase = createClient();
    let updatedAvatarUrl = profilePicture;

    if (foto) {
      const fileExt = foto.name.split(".").pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatares")
        .upload(fileName, foto);
      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from("avatares")
          .getPublicUrl(uploadData.path);
        updatedAvatarUrl = publicUrlData.publicUrl;
      }
    }

    const { error } = await supabase
      .from("usuario")
      .update({
        nombre: formData.nombre,
        telefono: formData.telefono,
        direction: formData.direction,
        detalles: formData.detalles,
        ...(updatedAvatarUrl !== profilePicture && {
          avatar_url: updatedAvatarUrl,
        }),
      })
      .eq("id", userId);

    setIsSaving(false);
    if (!error) {
      setIsEditing(false);
      setFoto(null);
      router.refresh();
    } else {
      console.error(error);
      alert("Hubo un error al actualizar el perfil.");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header variant="app" />

      <div className="w-full h-40 md:h-56 opacity-90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-28 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            <ProfileHeader
              name={name}
              profilePicture={profilePicture}
              detalles={detalles}
              registerDate={registerDate}
              isEditing={isEditing}
              isSaving={isSaving}
              previewUrl={previewUrl}
              formData={{
                nombre: formData.nombre,
                detalles: formData.detalles,
              }}
              onChange={(field, value) =>
                setFormData((prev) => ({ ...prev, [field]: value }))
              }
              onEdit={() => setIsEditing(true)}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
              onFileChange={handleFileChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ContactInfo
                email={email}
                phone={phone}
                direction={direction}
                isEditing={isEditing}
                formData={{
                  telefono: formData.telefono,
                  direction: formData.direction,
                }}
                onChange={(field, value) =>
                  setFormData((prev) => ({ ...prev, [field]: value }))
                }
              />
              <Preferences />
            </div>

            <AppointmentHistory citas={citas} userId={userId} />
          </div>

          {/* ── Right Sidebar ────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">
            <BusinessSidebar
              negocios={negocio}
              onCrear={() => router.push("/business/registration")}
            />
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
