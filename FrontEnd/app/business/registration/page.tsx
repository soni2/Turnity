"use client";

import Link from "next/link";
import useRegistrationBusiness from "./Hooks/useRegistrationBusiness";
import Paso1InfoBasica from "./components/Paso1InfoBasica";
import Paso2Ubicacion from "./components/Paso2Ubicacion";
import Paso3Horarios from "./components/Paso3Horarios";
import Paso4Servicios from "./components/Paso4Servicios";
import Paso5Equipo from "./components/Paso5Equipo";
import Paso6Fotos from "./components/Paso6Fotos";
import Paso7Pagos from "./components/Paso7Pagos";
import { Buttons } from "@/app/Components/Buttons";
import { Titles } from "@/app/Components/Titles";

export default function RegistroNegocioPage() {
  const { paso, negocioCreado, handleSubmit, setPaso } =
    useRegistrationBusiness();

  const renderPaso = () => {
    switch (paso) {
      case 1:
        return <Paso1InfoBasica />;

      case 2:
        return <Paso2Ubicacion />;

      case 3:
        return <Paso3Horarios />;

      case 4:
        return <Paso4Servicios />;

      case 5:
        return <Paso5Equipo />;

      case 6:
        return <Paso6Fotos />;

      case 7:
        return <Paso7Pagos />;

      default:
        return null;
    }
  };

  if (negocioCreado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            {/* <CheckCircleIcon className="h-10 w-10 text-green-600" /> */}
          </div>
          <h2 className="text-2xl font-bold mb-4">
            ¡Negocio registrado con éxito!
          </h2>
          <p className="text-gray-600 mb-8">
            Hemos recibido tu solicitud. En las próximas 24-48 horas revisaremos
            la información y activaremos tu negocio en la plataforma.
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          {/* <BuildingStorefrontIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" /> */}
          <Titles className="text-3xl font-bold">Registra tu negocio</Titles>
          <p className="text-gray-600 mt-2">
            Únete a la comunidad y comienza a recibir reservas online
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Paso {paso} de 7
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((paso / 7) * 100)}% completado
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[var(--primary)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(paso / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-6 md:p-8"
        >
          {renderPaso()}

          {/* Navegación */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Buttons
              onClick={() => setPaso((prev) => Math.max(1, prev - 1))}
              className={`px-6 py-3 border border-gray-300 rounded-lg font-medium transition-colors ${
                paso === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
              disabled={paso === 1}
            >
              Anterior
            </Buttons>

            {paso < 7 ? (
              <Buttons
                onClick={() => setPaso((prev) => prev + 1)}
                className=" bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Siguiente
              </Buttons>
            ) : (
              <Buttons
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Completar registro
              </Buttons>
            )}
          </div>
        </form>

        {/* Beneficios */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {/* <UserGroupIcon className="h-6 w-6 text-gray-600" /> */}
            </div>
            <h3 className="font-medium mb-1">Más clientes</h3>
            <p className="text-sm text-gray-500">
              Llega a nuevas personas buscando servicios como los tuyos
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {/* <ClockIcon className="h-6 w-6 text-gray-600" /> */}
            </div>
            <h3 className="font-medium mb-1">Gestión de agenda</h3>
            <p className="text-sm text-gray-500">
              Organiza tus citas de manera fácil y eficiente
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {/* <CreditCardIcon className="h-6 w-6 text-gray-600" /> */}
            </div>
            <h3 className="font-medium mb-1">Pagos seguros</h3>
            <p className="text-sm text-gray-500">
              Ofrece múltiples opciones de pago a tus clientes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
