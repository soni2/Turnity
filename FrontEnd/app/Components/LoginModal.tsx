"use client";
import React, { useState, useEffect, useRef } from "react";
import Logo from "./Logo";
import Input from "./Input";
import PasswordValidator from "./PasswordValidator";
import { GoogleIcon } from "./Icons";
import { IconX } from "@tabler/icons-react";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Redirect URL after successful login. Defaults to /explore */
  redirectTo?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const isPasswordValid = (pw: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(pw);

// ── Component ─────────────────────────────────────────────────────────────────
export default function LoginModal({ isOpen, onClose, redirectTo = "/explore" }: LoginModalProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setEmail(""); setPassword(""); setError(null);
      setSuccessMsg(null); setIsResetMode(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccessMsg(null); setLoading(true);

    if (!isPasswordValid(password)) {
      setError("La contraseña no cumple con los parámetros (mínimo 6 caracteres, 1 mayúscula, 1 minúscula y 1 número).");
      setLoading(false);
      return;
    }

    try {
      await auth.loginWithEmail(email, password);
      onClose();
      router.push(redirectTo);
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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Por favor, ingresa tu correo electrónico."); return; }
    setLoading(true); setError(null); setSuccessMsg(null);
    try {
      await auth.resetPassword(email);
      setSuccessMsg("¡Enlace enviado! Revisa tu bandeja de entrada o la carpeta de spam.");
    } catch (err: any) {
      setError(err.message === "User not found"
        ? "No se encontró ningún usuario con ese correo."
        : err.message);
    }
    setLoading(false);
  };

  const handleGoogle = () => auth.loginWithGoogle(redirectTo);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(255,255,255,0.20)", backdropFilter: "blur(12px)" }}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-md bg-white/95 rounded-3xl shadow-2xl overflow-hidden
          animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-100"
          aria-label="Cerrar"
        >
          <IconX size={20} />
        </button>

        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--primary)] via-purple-400 to-[var(--primary)]" />

        <div className="px-8 py-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-7">
            <Logo className="fill-[var(--primary)] h-7 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              {isResetMode ? "Recuperar contraseña" : "Bienvenido de vuelta"}
            </h2>
            <p className="text-sm text-gray-500 mt-1 text-center">
              {isResetMode
                ? "Te enviaremos un enlace para restablecer tu contraseña"
                : "Inicia sesión para continuar"}
            </p>
          </div>

          {/* ── Reset Mode ── */}
          {isResetMode ? (
            <form onSubmit={handleReset} className="space-y-4">
              <Input label="Correo electrónico" type="email" placeholder=" " value={email}
                onChange={(e) => setEmail(e.target.value)} required />

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-center">{error}</p>}
              {successMsg && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-center">{successMsg}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-[var(--primary)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
                {loading ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>

              <div className="text-center">
                <button type="button" onClick={() => { setIsResetMode(false); setError(null); setSuccessMsg(null); }}
                  className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
                  ← Volver al inicio de sesión
                </button>
              </div>
            </form>

          ) : (
            <>
              {/* ── Login Form ── */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Correo electrónico" type="email" placeholder=" " value={email}
                  onChange={(e) => setEmail(e.target.value)} required />
                <Input label="Contraseña" type="password" placeholder=" " value={password}
                  onChange={(e) => setPassword(e.target.value)} required />

                {password && <PasswordValidator password={password} />}

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" />
                    Recordarme
                  </label>
                  <button type="button" onClick={() => { setIsResetMode(true); setError(null); }}
                    className="text-[var(--primary)] hover:underline font-medium">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-center">{error}</p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-[var(--primary)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-md shadow-purple-200">
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
              <button onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm">
                <GoogleIcon />
                Iniciar sesión con Google
              </button>

              {/* Register link */}
              <p className="text-center text-sm text-gray-500 mt-5">
                ¿No tienes cuenta?{" "}
                <Link href="/register" onClick={onClose}
                  className="text-[var(--primary)] font-semibold hover:underline">
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
