// components/MapaSeleccionUbicacion.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Solución para el ícono de marcador en Next.js
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  country?: string;
  country_code?: string;
}

interface Props {
  onUbicacionChange: (
    lat: number,
    lng: number,
    direccion: string,
    address?: NominatimAddress,
  ) => void;
  ubicacionInicial?: { lat: number; lng: number };
}

export default function MapSelection({
  onUbicacionChange,
  ubicacionInicial,
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [direccionBuscada, setDireccionBuscada] = useState("");

  // Coordenadas por defecto (Santo Domingo)
  const santoDomingoCoords: [number, number] = [18.4861, -69.9312];

  useEffect(() => {
    if (typeof window !== "undefined" && !mapRef.current) {
      // Inicializar mapa
      const map = L.map("map").setView(
        ubicacionInicial
          ? [ubicacionInicial.lat, ubicacionInicial.lng]
          : santoDomingoCoords,
        13,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Agregar marcador inicial si hay ubicación
      if (ubicacionInicial) {
        const marker = L.marker([ubicacionInicial.lat, ubicacionInicial.lng], {
          draggable: true,
        }).addTo(map);
        markerRef.current = marker;

        marker.on("dragend", async () => {
          const position = marker.getLatLng();
          await obtenerDireccion(position.lat, position.lng);
        });
      }

      // Manejar clic en el mapa
      map.on("click", async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;

        // Remover marcador anterior
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Crear nuevo marcador
        const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current = marker;

        marker.on("dragend", async () => {
          const position = marker.getLatLng();
          await obtenerDireccion(position.lat, position.lng);
        });

        await obtenerDireccion(lat, lng);
      });

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const obtenerDireccion = async (lat: number, lng: number) => {
    try {
      setBuscando(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      );
      const data = await response.json();

      const direccion =
        data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onUbicacionChange(lat, lng, direccion, data.address ?? {});
    } catch (error) {
      console.error("Error obteniendo dirección:", error);
      onUbicacionChange(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Buscador de direcciones */}
      {/* <div className="flex gap-2">
        <input
          type="text"
          value={direccionBuscada}
          onChange={(e) => setDireccionBuscada(e.target.value)}
          placeholder="Buscar dirección o lugar..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          onKeyPress={(e) => e.key === "Enter" && buscarDireccion()}
        />
        <button
          type="button"
          onClick={buscarDireccion}
          disabled={buscando}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {buscando ? "Buscando..." : "Buscar"}
        </button>
      </div> */}

      {/* Mapa */}
      <div
        id="map"
        className="w-full h-96 rounded-lg border-2 border-gray-300 z-0"
        style={{ cursor: "crosshair" }}
      />

      <p className="text-sm text-gray-500 flex items-center">
        <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
        Haz clic en el mapa para marcar la ubicación exacta de tu negocio
      </p>
    </div>
  );
}
