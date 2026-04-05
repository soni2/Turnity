"use client";
import Logo from "../Components/Logo";
import Input from "../Components/Input";
import { GoogleIcon } from "../Components/Icons";
import { IconUpload, IconUser } from "@tabler/icons-react";
import { auth } from "@/lib/auth";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapSelection = dynamic(
  () => import("@/app/business/registration/MapSelection"),
  { ssr: false },
);

export default function RegisterPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Nuevos campos
  const [detalles, setDetalles] = useState("");
  const [coordenadas, setCoordenadas] = useState({
    lat: 18.486058,
    lng: -69.931212,
  }); // Rep. Dom.
  const [direccionMapa, setDireccionMapa] = useState("");

  // OTP State
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Estados para foto
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUbicacionChange = (
    lat: number,
    lng: number,
    dir: string,
    addressContext?: {
      city?: string;
      town?: string;
      village?: string;
      country?: string;
    },
  ) => {
    setCoordenadas({ lat, lng });

    const city =
      addressContext?.city || addressContext?.town || addressContext?.village;
    const country = addressContext?.country;

    if (city && country) {
      setDireccionMapa(`${city}, ${country}`);
    } else if (city || country) {
      setDireccionMapa(city || country || dir);
    } else {
      setDireccionMapa(dir); // Fallback por si acaso
    }
  };

  const isPasswordValid = (pw: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(pw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!isPasswordValid(password)) {
      setError(
        "La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.",
      );
      return;
    }

    setLoading(true);

    const supabase = createClient();

    // 1. Subir la foto primero (si existe) para tener su URL lista
    let avatar_url = null;
    if (foto) {
      const fileExt = foto.name.split(".").pop();
      // Usamos un nombre aleatorio porque aún no tenemos el ID del usuario
      const fileName = `profile-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatares")
        .upload(fileName, foto);

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from("avatares")
          .getPublicUrl(uploadData.path);
        avatar_url = publicUrlData.publicUrl;
      }
    }

    // 2. Crear el usuario delegando a Supabase el almacenamiento de todos sus metadatos
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: nombre,
          telefono: telefono,
          detalles: detalles,
          direction: direccionMapa,
          avatar_url: avatar_url,
        },
      },
    });

    if (signUpError) {
      const msg =
        signUpError.message === "User already registered"
          ? "Ya existe una cuenta con este correo."
          : signUpError.message;
      setError(msg);
      setLoading(false);
      return;
    }

    // A partir de este momento, dependemos de que exista un Trigger en Postgres
    // (Por ejemplo: on_auth_user_created) que copie de raw_user_meta_data a public.usuario

    setLoading(false);

    // Si Supabase requiere confirmación de correo
    if (data.session === null) {
      setSuccess(true);
      setShowOtp(true);
    } else {
      router.push("/explore");
      router.refresh();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error: otpError } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "signup",
    });

    if (otpError) {
      setError("Código incorrecto, expirado o ya utilizado.");
      setLoading(false);
    } else {
      router.push("/explore");
      router.refresh();
    }
  };

  const handleGoogle = () => auth.loginWithGoogle();

  // ── Pantalla de "revisa tu correo / ingresa código" ─────────────────────────
  if (showOtp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[var(--primary)] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="h-8 w-8 text-[var(--primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifica tu correo
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Hemos enviado un enlace de confirmación a <strong>{email}</strong>.
            Si no lo has recibido, revisa tu bandeja de entrada o la carpeta de
            spam.
          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <Input
              label="Código de 6 dígitos"
              type="text"
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
              maxLength={6}
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Verificando..." : "Confirmar código"}
            </button>
          </form>

          {/* <p className="mt-4 text-xs text-gray-400">
            Asegúrate de revisar tu carpeta de spam
          </p> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex rounded-2xl overflow-hidden max-w-4xl w-full shadow-xl">
        {/* Panel izquierdo */}
        <div className="w-1/3 bg-[var(--primary)] hidden sm:flex items-center justify-center">
          <Logo className="h-10 fill-white" />
        </div>

        {/* Formulario */}
        <div className="flex-1 bg-white p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Crear cuenta
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Es gratis, rápido y sin tarjeta
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Foto de perfil */}
            <div className="flex flex-col items-center justify-center mb-4">
              <label className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-[var(--primary)] transition-colors">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IconUser className="w-10 h-10 text-gray-400 group-hover:text-[var(--primary)] transition-colors" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconUpload className="w-6 h-6 text-white" />
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
              <span className="text-xs text-gray-500 mt-2">
                Sube una foto (opcional)
              </span>
            </div>

            <Input
              label="Nombre completo"
              type="text"
              placeholder=" "
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <Input
              label="Correo electrónico"
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Teléfono"
              type="tel"
              placeholder=" "
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Repetir contraseña"
              type="password"
              placeholder=" "
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biografía (opcional)
              </label>
              <textarea
                value={detalles}
                onChange={(e) => setDetalles(e.target.value)}
                placeholder="Cuéntanos un poco sobre ti..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[var(--primary)] transition-colors"
                style={{ resize: "none" }}
              />
            </div>

            {/* Mapa de Ubicación */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿De dónde nos visitas? (opcional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Solo guardaremos tu ciudad y país para brindarte una mejor
                experiencia al explorar establecimientos.
              </p>
              <div className="h-[200px] w-full rounded-xl overflow-hidden border border-gray-200 mb-2">
                <MapSelection
                  onUbicacionChange={handleUbicacionChange}
                  ubicacionInicial={coordenadas}
                />
              </div>
              {direccionMapa && (
                <p className="text-xs text-[var(--primary)] font-medium truncate mt-1">
                  Ubicación a guardar: {direccionMapa}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400">
                O regístrate con
              </span>
            </div>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors mb-5"
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-[var(--primary)] font-semibold hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
