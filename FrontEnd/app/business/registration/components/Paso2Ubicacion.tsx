"use client";
import useRegistrationBusiness from "../Hooks/useRegistrationBusiness";
import dynamic from "next/dynamic";
import { FormData } from "../types/registroNegocio";

const MapSelection = dynamic(() => import("../MapSelection"), { ssr: false });

export default function Paso2Ubicacion({
  formData,
  handleUbicacionChange,
  coordenadasMapa,
  direccionMapa,
}: {
  formData: FormData;
  handleUbicacionChange: (
    lat: number,
    lng: number,
    direccion: string,
    address?: {
      city?: string;
      town?: string;
      village?: string;
      municipality?: string;
      state?: string;
      country?: string;
    },
  ) => void;
  coordenadasMapa: { lat: number; lng: number };
  direccionMapa: string;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Ubicación</h2>
        <p className="text-gray-600">¿Dónde se encuentra tu negocio?</p>
      </div>

      {/* Mapa de selección */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ubicación en el mapa *
        </label>
        <MapSelection
          onUbicacionChange={handleUbicacionChange}
          ubicacionInicial={coordenadasMapa}
        />
      </div>

      {/* Dirección generada automáticamente */}
      {direccionMapa && (
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección detectada
          </label>
          <p className="text-gray-800">{direccionMapa}</p>
          <input type="hidden" name="direccion" value={direccionMapa} />
        </div>
      )}

      {/* Campo de coordenadas (solo lectura) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Coordenadas
        </label>
        <input
          type="text"
          value={
            formData.coordenadas ||
            `${coordenadasMapa.lat.toFixed(6)}, ${coordenadasMapa.lng.toFixed(6)}`
          }
          readOnly
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Coordenadas generadas automáticamente al hacer clic en el mapa
        </p>
      </div>

      {/* Sugerencias */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">
          💡 Tips para ubicar tu negocio:
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Coloca el marcador exactamente en la puerta de entrada</li>
          <li>• Si estás en un centro comercial, marca la entrada principal</li>
          <li>• Usa el buscador para encontrar direcciones específicas</li>
          <li>• Puedes arrastrar el marcador para ajustar la posición</li>
        </ul>
      </div>
    </div>
  );
}
