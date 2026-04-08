"use client";
import Image from "next/image";
import { IconUser, IconStarFilled, IconCheck } from "@tabler/icons-react";
import { CentroData, servicio } from "../types";

type DateOption = {
  dateString: string;
  key: string;
  displayDay: string;
  displayNum: number;
  displayMonth: string;
};

type SlotInfo = {
  hora: string;
  ocupado: boolean;
  bloqueado: boolean;
};

type Props = {
  centro: CentroData;
  selectedService: string | null;
  selectedProfesional: string | null;
  selectedDate: string | null;
  selectedTime: string;
  upcomingDates: DateOption[];
  slotsForSelectedDate: SlotInfo[];
  loadingSlots: boolean;
  isMobile: boolean;
  onSelectProfesional: (id: string) => void;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onReserva: () => void;
};

export default function BookingPanel({
  centro,
  selectedService,
  selectedProfesional,
  selectedDate,
  selectedTime,
  upcomingDates,
  slotsForSelectedDate,
  loadingSlots,
  isMobile,
  onSelectProfesional,
  onSelectDate,
  onSelectTime,
  onReserva,
}: Props) {
  const servicioSeleccionado = centro.servicios.find(
    (s: servicio & { disponible: boolean }) => s.id === selectedService,
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h3 className="font-semibold text-lg mb-4">Reservar cita</h3>

      {/* Servicio seleccionado (resumen) */}
      {selectedService && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Servicio seleccionado</p>
          <p className="font-medium">{servicioSeleccionado?.nombre}</p>
        </div>
      )}

      {/* Selector de Profesional */}
      {selectedService && !centro.profesionales?.length ? (
        <div className="mb-6 p-4 rounded-xl border border-red-100 bg-red-50 text-red-600 text-sm font-medium text-center">
          Este negocio no tiene personal registrado. No es posible agendar citas
          en este momento.
        </div>
      ) : (
        selectedService && (
          <div className="mb-6 animate-fade-in">
            <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                2
              </span>
              ¿Con quién te atenderás?
            </label>
            <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-none snap-x">
              {/* Opción Cualquiera */}
              <button
                onClick={() => onSelectProfesional("cualquiera")}
                className={`flex flex-col items-center min-w-[80px] snap-center p-3 rounded-2xl border-2 transition-all ${
                  selectedProfesional === "cualquiera"
                    ? "border-[var(--primary)] bg-purple-50 shadow-md transform scale-[1.02]"
                    : "border-gray-100 bg-white hover:border-[var(--primary)]/30 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    selectedProfesional === "cualquiera"
                      ? "bg-[var(--primary)] text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <IconUser size={22} />
                </div>
                <span
                  className={`text-[11px] font-bold text-center ${
                    selectedProfesional === "cualquiera"
                      ? "text-[var(--primary)]"
                      : "text-gray-700"
                  }`}
                >
                  Cualquiera
                </span>
              </button>

              {/* Lista de Profesionales */}
              {centro.profesionales?.map((pro) => (
                <button
                  key={pro.id}
                  onClick={() => onSelectProfesional(pro.id)}
                  className={`flex flex-col items-center min-w-[85px] snap-center p-3 rounded-2xl border-2 transition-all ${
                    selectedProfesional === pro.id
                      ? "border-[var(--primary)] bg-purple-50 shadow-md transform scale-[1.02]"
                      : "border-gray-100 bg-white hover:border-[var(--primary)]/30 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full overflow-hidden mb-2 border-2 ${
                      selectedProfesional === pro.id
                        ? "border-[var(--primary)]"
                        : "border-gray-100"
                    }`}
                  >
                    {pro.foto_url ? (
                      <Image
                        src={pro.foto_url}
                        alt={pro.nombre}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
                        {pro.nombre.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-bold truncate w-full text-center ${
                      selectedProfesional === pro.id
                        ? "text-[var(--primary)]"
                        : "text-gray-900"
                    }`}
                  >
                    {pro.nombre.split(" ")[0]}
                  </span>
                  <div className="flex items-center gap-0.5 mt-1">
                    <IconStarFilled size={10} className="text-amber-500" />
                    <span className="text-[10px] text-gray-600 font-semibold">
                      {pro.ratingStr}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {/* Selector de Día */}
      {selectedProfesional && (
        <div className="mb-6 animate-fade-in mt-4 border-t border-gray-100 pt-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
              3
            </span>
            Selecciona un día
          </label>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {upcomingDates.map((dia) => (
              <button
                key={dia.dateString}
                onClick={() => onSelectDate(dia.dateString)}
                className={`px-4 py-3 rounded-2xl text-sm font-medium flex flex-col items-center justify-center min-w-[75px] whitespace-nowrap transition-all border-2 ${
                  selectedDate === dia.dateString
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md transform scale-105"
                    : "bg-white text-gray-700 border-gray-100 hover:border-[var(--primary)]/30 hover:bg-gray-50"
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider mb-1 opacity-80">
                  {dia.displayDay}
                </span>
                <span className="text-xl font-bold leading-none mb-1">
                  {dia.displayNum}
                </span>
                <span className="text-[10px] opacity-80">{dia.displayMonth}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selector de Horario */}
      {selectedDate && (
        <div className="mb-6 animate-fade-in mt-4 border-t border-gray-100 pt-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
              4
            </span>
            Selecciona un horario
            {loadingSlots && (
              <span className="ml-auto text-[10px] text-gray-400 font-normal flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-gray-300 border-t-[var(--primary)] rounded-full animate-spin inline-block" />
                Verificando...
              </span>
            )}
          </label>

          {isMobile ? (
            <select
              value={selectedTime}
              onChange={(e) => onSelectTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] appearance-none font-medium text-gray-800"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem",
              }}
            >
              <option value="">Seleccionar hora disponible</option>
              {slotsForSelectedDate.map(({ hora, ocupado }) => (
                <option key={hora} value={hora} disabled={ocupado}>
                  {hora} {ocupado ? "(Ocupado)" : ""}
                </option>
              ))}
            </select>
          ) : (
            <div>
              {slotsForSelectedDate.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-500 font-medium">
                    No hay horarios disponibles
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Intenta con otro estilista o fecha
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slotsForSelectedDate.map(({ hora, ocupado, bloqueado }) => (
                    <button
                      key={hora}
                      disabled={bloqueado}
                      onClick={() => !bloqueado && onSelectTime(hora)}
                      className={`relative px-2 py-2.5 text-xs font-bold border-2 rounded-xl transition-all ${
                        bloqueado
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60 line-through"
                          : selectedTime === hora
                            ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md scale-105"
                            : "bg-white border-gray-100 hover:border-[var(--primary)]/40 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {hora}
                      {!loadingSlots && ocupado && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedTime && (
                <p className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                  <IconCheck size={14} /> Horario asegurado: {selectedTime}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Botón de reserva */}
      <button
        onClick={onReserva}
        disabled={!selectedService || !selectedTime}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          selectedService && selectedTime
            ? "bg-[var(--primary)] text-white hover:opacity-90 cursor-pointer"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        {!selectedService
          ? "Selecciona un servicio"
          : !selectedTime
            ? "Selecciona un horario"
            : "Confirmar reserva"}
      </button>

      {/* Info adicional */}
      <div className="mt-4 text-xs text-gray-500 text-center space-y-0.5">
        <p>100% reembolso si cancelas 24h antes</p>
        <p>50% reembolso si cancelas 2h antes</p>
      </div>
    </div>
  );
}
