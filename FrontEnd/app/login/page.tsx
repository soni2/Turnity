"use client";
import React, { Suspense } from "react";
import Logo from "../Components/Logo";
import Input from "../Components/Input";
import { auth } from "@/lib/auth";
import { GoogleIcon } from "../Components/Icons";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PasswordValidator from "../Components/PasswordValidator";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/explore";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor, ingresa tu correo electrónico.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await auth.resetPassword(email);
      setSuccessMsg("¡Enlace enviado! Revisa tu bandeja de entrada o la carpeta de spam.");
      setLoading(false);
    } catch (err: any) {
      setError(
        err.message === "User not found"
          ? "No se encontró ningún usuario con ese correo."
          : err.message
      );
      setLoading(false);
    }
  };

    const isPasswordValid = (pw: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(pw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (!isPasswordValid(password)) {
      setError("La contraseña no cumple con los parámetros (mínimo 6 caracteres, 1 mayúscula, 1 minúscula y 1 número).");
      setLoading(false);
      return;
    }

    try {
      await auth.loginWithEmail(email, password);
      router.push(next);
      router.refresh();
    } catch (err: any) {
      setError(
        err.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : err.message,
      );
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    const nextParam = searchParams.get("next") || undefined;
    auth.loginWithGoogle(nextParam);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex rounded-2xl overflow-hidden max-w-4xl w-full shadow-xl">
        {/* Panel izquierdo */}
        <div className="w-1/3 bg-[var(--primary)] hidden sm:flex items-center justify-center">
          <Logo className="h-10 fill-white" />
        </div>

        {/* Formulario */}
        <div className="flex-1 bg-white p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              {isResetMode ? "Recuperar contraseña" : "Inicia sesión"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isResetMode 
                ? "Te enviaremos un enlace para restablecer tu contraseña" 
                : "Bienvenido de vuelta"}
            </p>
          </div>

          {isResetMode ? (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <Input
                label="Correo electrónico"
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Mensajes de feedback */}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-center">
                  {error}
                </p>
              )}
              {successMsg && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-center">
                  {successMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {loading ? "Enviando enlace..." : "Enviar enlace de recuperación"}
              </button>
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          ) : (
            <>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {password && (
                  <PasswordValidator password={password} />
                )}

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-600">
                    <input type="checkbox" className="rounded border-gray-300" />
                    Recordarme
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[var(--primary)] hover:underline font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
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
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-400">O continúa con</span>
                </div>
              </div>

              {/* Google */}
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors mb-5"
              >
                <GoogleIcon />
                Iniciar sesión con Google
              </button>

              <p className="text-center text-sm text-gray-500">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="text-[var(--primary)] font-semibold hover:underline">
                  Regístrate gratis
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Cargando...</p></div>}>
      <LoginContent />
    </Suspense>
  );
}
