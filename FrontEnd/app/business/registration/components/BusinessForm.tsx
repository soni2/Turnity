"use client";
import { Buttons } from "@/app/Components/Buttons";
import useRegistrationBusiness from "../Hooks/useRegistrationBusiness";
import ProgressBar from "./ProgressBar";

export default function BusinessForm() {
  const { paso, handleSubmit, setPaso, renderPaso, formData, handleCreate } =
    useRegistrationBusiness();

  return (
    <>
      <ProgressBar paso={paso} />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6 md:p-8"
      >
        {renderPaso()}

        {/* Navegación */}
        <div className="flex justify-between mt-8 pt-6 border-t gap-4">
          <Buttons
            onClick={() => setPaso((prev) => Math.max(1, prev - 1))}
            className={`px-6 py-3 border border-gray-300 rounded-lg font-medium transition-colors ${
              paso === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
            disabled={paso === 1}
          >
            Anterior
          </Buttons>

          {paso < 6 ? (
            <Buttons
              onClick={() => setPaso((prev) => prev + 1)}
              className=" bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Siguiente
            </Buttons>
          ) : (
            <Buttons
              onClick={handleCreate}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Completar registro
            </Buttons>
          )}
        </div>
      </form>
    </>
  );
}
