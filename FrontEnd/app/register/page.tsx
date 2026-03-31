"use client";
import Logo from "../Components/Logo";
import Input from "../Components/Input";
import { GoogleIcon } from "../Components/Icons";
import { auth } from "@/lib/auth";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    // 1. Crear el usuario en Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,       // guardado en auth.users → raw_user_meta_data
          telefono,
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

    // 2. Insertar en la tabla pública `usuario` (si existe)
    if (data.user) {
      await supabase.from("usuario").upsert({
        id: data.user.id,
        nombre,
        email,
        telefono,
      });
    }

    setLoading(false);

    // Si Supabase requiere confirmación de correo, mostrar aviso
    if (data.session === null) {
      setSuccess(true);
    } else {
      router.push("/explore");
      router.refresh();
    }
  };

  const handleGoogle = () => auth.loginWithGoogle();

  // ── Pantalla de "revisa tu correo" ─────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Revisa tu correo!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Te enviamos un enlace de confirmación a <strong>{email}</strong>. Haz clic en él para activar tu cuenta.
          </p>
          <Link href="/login" className="inline-block px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold hover:opacity-90">
            Ir al inicio de sesión
          </Link>
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
            <h2 className="text-2xl font-semibold text-gray-900">Crear cuenta</h2>
            <p className="text-sm text-gray-500 mt-1">Es gratis, rápido y sin tarjeta</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
              <span className="px-3 bg-white text-gray-400">O regístrate con</span>
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
            <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
