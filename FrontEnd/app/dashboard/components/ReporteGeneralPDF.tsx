"use client";
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Estilos del Documento PDF
const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: "#ffffff" },
  title: { fontSize: 22, textAlign: "center", marginBottom: 10, color: "#6b21a8" }, // Color var(--primary)
  subtitle: { fontSize: 12, textAlign: "center", marginBottom: 20, color: "#6b7280" },
  table: { display: "flex", width: "auto", borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableColHeader: { width: "15%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: "#f3f4f6" },
  tableColWideHeader: { width: "25%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: "#f3f4f6" },
  tableCol: { width: "15%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableColWide: { width: "25%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCellHeader: { margin: 5, fontSize: 10, fontWeight: "bold" },
  tableCell: { margin: 5, fontSize: 9 },
  summaryBox: { marginTop: 30, padding: 15, backgroundColor: "#f9fafb", borderRadius: 5, border: "1px solid #e5e7eb" },
  summaryText: { fontSize: 12, color: "#374151", marginBottom: 5 },
  summaryTotal: { fontSize: 14, color: "#111827", fontWeight: "bold" },
});

export default function ReporteGeneralPDF({ turnos, negocioNombre }: { turnos: any[], negocioNombre: string }) {
  // Calculamos los totales
  const completados = turnos.filter(t => t.estado === "completado");
  const cancelados = turnos.filter(t => t.estado === "cancelado");
  
  const ingresosTotales = completados.reduce(
    (acc, t) => acc + (t.servicio?.precio || 0), 0
  );

  return (
    <Document>
      <Page style={styles.page} size="A4">
        {/* Cabecera del Documento */}
        <Text style={styles.title}>Reporte Oficial de Citas</Text>
        <Text style={[styles.title, { fontSize: 16, textAlign: "center", marginBottom: 5 }]}>{negocioNombre}</Text>
        <Text style={styles.subtitle}>Generado el: {new Date().toLocaleString("es-DO")}</Text>

        {/* Tabla de Citas */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Fecha</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Hora</Text></View>
            <View style={styles.tableColWideHeader}><Text style={styles.tableCellHeader}>Cliente</Text></View>
            <View style={styles.tableColWideHeader}><Text style={styles.tableCellHeader}>Servicio</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Estado</Text></View>
          </View>

          {turnos.map((t, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{t.fecha}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{t.hora_inicio}</Text></View>
              <View style={styles.tableColWide}><Text style={styles.tableCell}>{t.cliente?.nombre || "Anónimo"}</Text></View>
              <View style={styles.tableColWide}><Text style={styles.tableCell}>{t.servicio?.nombre || "N/A"}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{t.estado.toUpperCase()}</Text></View>
            </View>
          ))}
        </View>

        {/* Resumen Final */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Total de Citas Registradas: {turnos.length}</Text>
          <Text style={styles.summaryText}>Completadas Exitosamente: {completados.length}</Text>
          <Text style={styles.summaryText}>Canceladas: {cancelados.length}</Text>
          <Text style={styles.summaryTotal}>Ingresos Totales: RD$ {ingresosTotales.toLocaleString("es-DO")}</Text>
        </View>
      </Page>
    </Document>
  );
}
