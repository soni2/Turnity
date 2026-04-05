"use client";
import React, { useState } from "react";
import Logo from "../Components/Logo";
import Input from "../Components/Input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      setError("La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex justify-center mb-6">
          {/* Usamos el Logo existente, puedes ajustarlo si quieres */}
          <Logo className="h-10 fill-[var(--primary)] text-[var(--primary)]" />
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Nueva contraseña</h2>
          <p className="text-sm text-gray-500 mt-1">Escribe tu nueva contraseña segura.</p>
        </div>

        {success ? (
          <div className="text-center">
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-4 mb-4">
              ¡Contraseña actualizada con éxito!
            </p>
            <p className="text-sm text-gray-500">Redirigiendo al panel...</p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Nueva contraseña"
              type="password"
              placeholder="Contraseña segura"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Repetir nueva contraseña"
              type="password"
              placeholder="Vuelve a escribirla"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || password.length < 6}
              className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
