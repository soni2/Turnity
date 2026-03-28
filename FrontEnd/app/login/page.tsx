"use client";
import Logo from "../Components/Logo";
import Input from "../Components/Input";
import { auth } from "@/lib/auth";
import { GoogleIcon } from "../Components/Icons";
import { Buttons } from "../Components/Buttons";

function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  // Aquí puedes agregar la lógica para manejar el inicio de sesión
}

function handleSubmitWithGoogle() {
  auth.loginWithGoogle();
}

export default function Page() {
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

          <form className="space-y-6" onSubmit={handleSubmit}>
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
          <button
            onClick={handleSubmitWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors mb-6"
          >
            <GoogleIcon />
            Inicia sesión con Google
          </button>

          {/* Sign up link */}
          <p className="text-center text-gray-600">
            ¿No tienes una cuenta?{" "}
            <a href="/register" className="text-black font-medium hover:underline">
              Regístrate ahora
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
