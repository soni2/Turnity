"use client";

import { useState } from "react";
import Logo from "../Components/Logo";
import Input from "../Components/Input";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { IconMail } from "@tabler/icons-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await auth.resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.message ||
          "Ocurrió un error al intentar enviar el correo de recuperación."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Logo className="h-8 fill-[var(--primary)]" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Recuperar Contraseña
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Ingresa tu correo electrónico y te enviaremos un enlace para que
            puedas establecer una nueva contraseña.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center">
              <IconMail size={32} className="text-[var(--primary)]" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">
              ¡Correo enviado!
            </h3>
            <p className="text-gray-600 text-sm">
              Revisa tu bandeja de entrada o la carpeta de spam para{" "}
              <strong>{email}</strong> y sigue las instrucciones.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Enviando enlace..." : "Enviar enlace de recuperación"}
            </button>

            <div className="text-center mt-6">
              <Link
                href="/login"
                className="text-sm text-gray-500 hover:text-[var(--primary)] font-medium transition-colors"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
