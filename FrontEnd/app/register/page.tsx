"use client";
import Logo from "../Components/Logo";
import Input from "../Components/Input";
import { GoogleIcon } from "../Components/Icons";
import { Buttons } from "../Components/Buttons";

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
          <div className="text-center mb-8 flex flex-col items-center gap-2">
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">
              Registrar
            </h2>
          </div>

          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <Input label="Nombre completo" type="text" placeholder=" " />
            <Input label="Correo" type="email" placeholder=" " />
            <Input label="Teléfono" type="phone" placeholder=" " />
            <Input label="Contraseña" type="password" placeholder=" " />
            <Input label="Repetir Contraseña" type="password" placeholder=" " />

            {/* Submit button */}
            <Buttons className="w-full">Registrarse</Buttons>
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
            <GoogleIcon />
            Inicia sesión con Google
          </button>

          {/* Sign up link */}
          <p className="text-center text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <a href="/login" className="text-black font-medium hover:underline">
              Inicia sesión ahora
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
