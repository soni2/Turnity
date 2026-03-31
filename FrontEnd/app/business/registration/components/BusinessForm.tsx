"use client";
import { Buttons } from "@/app/Components/Buttons";
import useRegistrationBusiness from "../Hooks/useRegistrationBusiness";
import ProgressBar from "./ProgressBar";
import NegocioCreado from "./NegocioCreado";

export default function BusinessForm() {
  const {
    paso,
    handleSubmit,
    setPaso,
    renderPaso,
    handleCreate,
    isPasoValido,
    negocioCreado,
  } = useRegistrationBusiness();

  // ── Mostrar pantalla de éxito tras crear el negocio ──────────
  if (negocioCreado) {
    return (
      <NegocioCreado
        negocioId={negocioCreado.id}
        negocioNombre={negocioCreado.nombre}
      />
    );
  }


  const pasoValido = isPasoValido(paso);

  const mensajesPorPaso: Record<number, string> = {
    1: "Completa el nombre, categoría, correo y teléfono para continuar.",
    2: "Haz clic en el mapa para seleccionar la ubicación de tu negocio.",
    3: "Debe haber al menos un día de la semana marcado como abierto.",
    4: "Cada servicio debe tener nombre, precio y duración.",
    5: "Sube el logo de tu negocio para continuar.",
    6: "Selecciona al menos un método de pago.",
  };

  return (
    <>
      <ProgressBar paso={paso} />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6 md:p-8"
      >
        {renderPaso()}

        {/* Aviso cuando el paso no está completo */}
        {!pasoValido && (
          <p className="mt-5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-center">
            ⚠️ {mensajesPorPaso[paso] ?? "Completa los campos requeridos para continuar."}
          </p>
        )}

        {/* Navegación */}
        <div className="flex justify-between mt-6 pt-6 border-t gap-4">
          {/* Botón Anterior */}
          <Buttons
            onClick={() => setPaso((prev) => Math.max(1, prev - 1))}
            disabled={paso === 1}
            className="px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl font-semibold transition-all"
          >
            Anterior
          </Buttons>

          {/* Botón Siguiente / Completar */}
          {paso < 6 ? (
            <Buttons
              onClick={() => pasoValido && setPaso((prev) => prev + 1)}
              disabled={!pasoValido}
              className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
            >
              Siguiente →
            </Buttons>
          ) : (
            <Buttons
              onClick={pasoValido ? handleCreate : undefined}
              disabled={!pasoValido}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
            >
              ✓ Completar registro
            </Buttons>
          )}
        </div>
      </form>
    </>
  );
}
