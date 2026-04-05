"use client";
import React, { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReporteGeneralPDF from "./ReporteGeneralPDF";
import { IconDownload } from "@tabler/icons-react";

export default function PDFDownloadButton({ turnos, negocioNombre }: { turnos: any[], negocioNombre: string }) {
  // Solución vital para Next.js: EVITAR Server Side Rendering del Link de PDF.
  // Solo se renderizará cuando "document" ya exista en el navegador.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return (
      <button disabled className="flex items-center gap-2 bg-gray-100 text-gray-500 text-sm font-medium px-4 py-2 rounded-lg opacity-50 cursor-not-allowed">
        <IconDownload size={16} /> Cargando Módulo...
      </button>
    );
  }

  // Generamos un nombre limpio sin espacios
  const cleanName = negocioNombre.replace(/\s+/g, '_');
  const fileName = `Reporte_${cleanName}_${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={<ReporteGeneralPDF turnos={turnos} negocioNombre={negocioNombre} />}
      fileName={fileName}
    >
      {({ blob, url, loading, error }) => (
        <button
          disabled={loading || turnos.length === 0}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
            loading || turnos.length === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-purple-100 text-[var(--primary)] hover:bg-purple-200 shadow-sm"
          }`}
        >
          <IconDownload size={16} />
          {loading ? "Generando documento..." : "Exportar Todas a PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
