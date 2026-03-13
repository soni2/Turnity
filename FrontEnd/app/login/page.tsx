"use client";
import { useState } from "react";
import Logo from "../Components/Logo";
import Input from "../Components/Input";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 ">
      <div className="flex rounded-2xl overflow-hidden max-w-4xl w-full">
        <div className="w-1/3 bg-[var(--primary)] flex items-center justify-center">
          <Logo className="h-10 fill-white" />
        </div>

        {/* Formulario */}
        <div className="w-2/3 bg-white shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8 flex flex-col items-center gap-4">
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">
              Inicia Sesión
            </h2>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Email */}
            <Input label="Correo electrónico" type="email" placeholder=" " />

            {/* Password */}
            <Input label="Contraseña" type="password" placeholder=" " />

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-black focus:ring-black mr-2"
                />
                <span className="te xt-gray-700">Recordarme</span>
              </label>
              <a href="#" className="text-black hover:underline font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Iniciar Sesión
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O</span>
            </div>
          </div>

          {/* Google button */}
          <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors mb-6">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Inicia sesión con Google
          </button>

          {/* Sign up link */}
          <p className="text-center text-gray-600">
            ¿No tienes una cuenta?{" "}
            <a href="#" className="text-black font-medium hover:underline">
              Regístrate ahora
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
