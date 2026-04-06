"use client";
import Logo from "@/app/Components/Logo";
import Input from "@/app/Components/Input";
import { GoogleIcon } from "@/app/Components/Icons";
import { IconUpload, IconUser } from "@tabler/icons-react";
import { auth } from "@/lib/auth";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import PasswordValidator from "@/app/Components/PasswordValidator";

const MapSelection = dynamic(
  () => import("@/app/business/registration/MapSelection"),
  { ssr: false },
);

// ── Helpers ────────────────────────────────────────────────────────────────────
const isPasswordValid = (pw: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(pw);

// ── Sub-component: OTP Screen ──────────────────────────────────────────────────
function OtpScreen({
  email,
  otpCode,
  loading,
  error,
  onChange,
  onSubmit,
}: {
  email: string;
  otpCode: string;
  loading: boolean;
  error: string | null;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[var(--primary)] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="h-8 w-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifica tu correo</h2>
        <p className="text-gray-500 text-sm mb-6">
          Hemos enviado un enlace de confirmación a <strong>{email}</strong>.
          Si no lo has recibido, revisa tu bandeja de entrada o la carpeta de spam.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Código de 6 dígitos" type="text" placeholder="123456" value={otpCode}
            onChange={(e) => onChange(e.target.value)} required maxLength={6} />
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">{error}</p>
          )}
          <button type="submit" disabled={loading || otpCode.length < 6}
            className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
            {loading ? "Verificando..." : "Confirmar código"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Sub-component: AvatarPicker ───────────────────────────────────────────────
function AvatarPicker({ previewUrl, onChange }: { previewUrl: string | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="flex flex-col items-center justify-center mb-4">
      <label className="relative cursor-pointer group">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-[var(--primary)] transition-colors">
          {previewUrl
            ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            : <IconUser className="w-10 h-10 text-gray-400 group-hover:text-[var(--primary)] transition-colors" />}
        </div>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <IconUpload className="w-6 h-6 text-white" />
        </div>
        <input type="file" className="hidden" accept="image/*" onChange={onChange} />
      </label>
      <span className="text-xs text-gray-500 mt-2">Sube una foto (opcional)</span>
    </div>
  );
}

// ── Sub-component: LocationPicker ─────────────────────────────────────────────
function LocationPicker({
  coordenadas,
  direccionMapa,
  onUbicacionChange,
}: {
  coordenadas: { lat: number; lng: number };
  direccionMapa: string;
  onUbicacionChange: (lat: number, lng: number, dir: string, ctx?: any) => void;
}) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">¿De dónde nos visitas? (opcional)</label>
      <p className="text-xs text-gray-500 mb-3">
        Solo guardaremos tu ciudad y país para brindarte una mejor experiencia al explorar establecimientos.
      </p>
      <div className="h-[200px] w-full rounded-xl overflow-hidden border border-gray-200 mb-2">
        <MapSelection onUbicacionChange={onUbicacionChange} ubicacionInicial={coordenadas} />
      </div>
      {direccionMapa && (
        <p className="text-xs text-[var(--primary)] font-medium truncate mt-1">Ubicación a guardar: {direccionMapa}</p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [detalles, setDetalles] = useState("");
  const [coordenadas, setCoordenadas] = useState({ lat: 18.486058, lng: -69.931212 });
  const [direccionMapa, setDireccionMapa] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFoto(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUbicacionChange = (lat: number, lng: number, dir: string, ctx?: any) => {
    setCoordenadas({ lat, lng });
    const city = ctx?.city || ctx?.town || ctx?.village;
    const country = ctx?.country;
    setDireccionMapa(city && country ? `${city}, ${country}` : city || country || dir);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }
    if (!isPasswordValid(password)) {
      setError("La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Upload avatar first (optional)
    let avatar_url = null;
    if (foto) {
      const fileExt = foto.name.split(".").pop();
      const fileName = `profile-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from("avatares").upload(fileName, foto);
      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage.from("avatares").getPublicUrl(uploadData.path);
        avatar_url = publicUrlData.publicUrl;
      }
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { nombre, telefono, detalles, direction: direccionMapa, avatar_url } },
    });

    if (signUpError) {
      setError(signUpError.message === "User already registered"
        ? "Ya existe una cuenta con este correo."
        : signUpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    if (data.session === null) { setShowOtp(true); }
    else { router.push("/explore"); router.refresh(); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.verifyOtp({ email, token: otpCode, type: "signup" });
    if (otpError) { setError("Código incorrecto, expirado o ya utilizado."); setLoading(false); }
    else { router.push("/explore"); router.refresh(); }
  };

  if (showOtp) return (
    <OtpScreen email={email} otpCode={otpCode} loading={loading} error={error}
      onChange={setOtpCode} onSubmit={handleVerifyOtp} />
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex rounded-2xl overflow-hidden max-w-4xl w-full shadow-xl">
        {/* Left panel */}
        <div className="w-1/3 bg-[var(--primary)] hidden sm:flex items-center justify-center">
          <Logo className="h-10 fill-white" />
        </div>

        {/* Form */}
        <div className="flex-1 bg-white p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Crear cuenta</h2>
            <p className="text-sm text-gray-500 mt-1">Es gratis, rápido y sin tarjeta</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <AvatarPicker previewUrl={previewUrl} onChange={handleFileChange} />

            <Input label="Nombre completo" type="text" placeholder=" " value={nombre}
              onChange={(e) => setNombre(e.target.value)} required />
            <Input label="Correo electrónico" type="email" placeholder=" " value={email}
              onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Teléfono" type="tel" placeholder=" " value={telefono}
              onChange={(e) => setTelefono(e.target.value)} />
            <Input label="Contraseña" type="password" placeholder=" " value={password}
              onChange={(e) => setPassword(e.target.value)} required />
            <Input label="Repetir contraseña" type="password" placeholder=" " value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} required />

            {(password || confirmPassword) && (
              <PasswordValidator password={password} confirmPassword={confirmPassword} showMatch />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biografía (opcional)</label>
              <textarea value={detalles} onChange={(e) => setDetalles(e.target.value)}
                placeholder="Cuéntanos un poco sobre ti..." rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[var(--primary)] transition-colors resize-none" />
            </div>

            <LocationPicker coordenadas={coordenadas} direccionMapa={direccionMapa}
              onUbicacionChange={handleUbicacionChange} />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-center">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400">O regístrate con</span>
            </div>
          </div>

          <button onClick={() => auth.loginWithGoogle()}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors mb-5">
            <GoogleIcon /> Continuar con Google
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
