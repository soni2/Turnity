"use client";

import { useState } from "react";
import {
  IconX,
  IconCreditCard,
  IconLock,
  IconShieldCheck,
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconCalendar,
} from "@tabler/icons-react";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  negocio: string;
  servicio: string;
  precio: number;
  fecha: string;
  hora: string;
};

type Step = "summary" | "payment" | "processing" | "success";

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  negocio,
  servicio,
  precio,
  fecha,
  hora,
}: PaymentModalProps) {
  const [step, setStep] = useState<Step>("summary");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fechaDisplay = fecha
    ? new Date(fecha + "T12:00:00").toLocaleDateString("es-DO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const validate = () => {
    const e: Record<string, string> = {};
    if (cardNumber.replace(/\s/g, "").length < 16)
      e.cardNumber = "Número de tarjeta inválido";
    if (!cardName.trim()) e.cardName = "Ingresa el nombre del titular";
    if (expiry.length < 5) e.expiry = "Fecha inválida";
    if (cvv.length < 3) e.cvv = "CVV inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;
    setStep("processing");
    // Simulate payment processing delay
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        onPaymentSuccess();
        handleClose();
      }, 2000);
    }, 2000);
  };

  const handleClose = () => {
    setStep("summary");
    setCardNumber("");
    setCardName("");
    setExpiry("");
    setCvv("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--primary)] to-purple-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <IconLock size={18} />
            <span className="font-semibold text-sm">Pago seguro · Turnity</span>
          </div>
          {step !== "processing" && step !== "success" && (
            <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors">
              <IconX size={20} />
            </button>
          )}
        </div>

        {/* Step: Summary */}
        {step === "summary" && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Resumen de tu reserva</h2>
            <p className="text-sm text-gray-500 mb-5">
              Revisa los detalles antes de continuar al pago
            </p>

            {/* Booking details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-500">Negocio</span>
                <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{negocio}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-500">Servicio</span>
                <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{servicio}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <IconCalendar size={15} />
                  <span>Fecha</span>
                </div>
                <span className="text-sm font-medium text-gray-900 capitalize">{fechaDisplay}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <IconClock size={15} />
                  <span>Hora</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{hora}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total a pagar</span>
                <span className="text-xl font-bold text-[var(--primary)]">
                  RD${precio.toLocaleString("es-DO")}
                </span>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <IconAlertCircle size={18} className="text-amber-600 shrink-0" />
                <h3 className="font-semibold text-amber-900 text-sm">Política de cancelación</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <IconCheck size={12} className="text-green-600" />
                  </span>
                  <p className="text-xs text-gray-700">
                    <strong>100% de reembolso</strong> si cancelas con más de{" "}
                    <strong>24 horas</strong> de anticipación a tu cita.
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                    <IconCheck size={12} className="text-amber-600" />
                  </span>
                  <p className="text-xs text-gray-700">
                    <strong>50% de reembolso</strong> si cancelas dentro de las{" "}
                    <strong>2 horas previas</strong> a tu cita.
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <IconX size={12} className="text-red-500" />
                  </span>
                  <p className="text-xs text-gray-700">
                    <strong>Sin reembolso</strong> para cancelaciones a menos de{" "}
                    <strong>2 horas</strong> del turno.
                  </p>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setStep("payment")}
              className="w-full py-3.5 bg-[var(--primary)] hover:opacity-90 text-white font-semibold rounded-xl transition-opacity flex items-center justify-center gap-2"
            >
              <IconCreditCard size={18} />
              Continuar al pago
            </button>
          </div>
        )}

        {/* Step: Payment form */}
        {step === "payment" && (
          <div className="p-6">
            <button
              onClick={() => setStep("summary")}
              className="text-sm text-[var(--primary)] mb-4 flex items-center gap-1 hover:underline"
            >
              ← Volver al resumen
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Datos de pago</h2>
            <p className="text-sm text-gray-500 mb-5">
              Tu información está encriptada y es segura
            </p>

            {/* Total reminder */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2.5 flex justify-between items-center mb-5">
              <span className="text-sm text-purple-700">Total</span>
              <span className="font-bold text-[var(--primary)]">
                RD${precio.toLocaleString("es-DO")}
              </span>
            </div>

            <div className="space-y-4">
              {/* Card number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de tarjeta
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full border rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all ${
                      errors.cardNumber ? "border-red-400" : "border-gray-300"
                    }`}
                  />
                  <IconCreditCard
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
                {errors.cardNumber && (
                  <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
                )}
              </div>

              {/* Card name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre en la tarjeta
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  placeholder="JUAN PEREZ"
                  className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all ${
                    errors.cardName ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.cardName && (
                  <p className="text-xs text-red-500 mt-1">{errors.cardName}</p>
                )}
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vencimiento
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/AA"
                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all ${
                      errors.expiry ? "border-red-400" : "border-gray-300"
                    }`}
                  />
                  {errors.expiry && (
                    <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all ${
                      errors.cvv ? "border-red-400" : "border-gray-300"
                    }`}
                  />
                  {errors.cvv && (
                    <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 mt-5 mb-5 text-xs text-gray-500">
              <IconShieldCheck size={16} className="text-green-500 shrink-0" />
              <span>Pago 100% seguro. Tus datos están encriptados con SSL.</span>
            </div>

            <button
              onClick={handlePay}
              className="w-full py-3.5 bg-[var(--primary)] hover:opacity-90 text-white font-semibold rounded-xl transition-opacity flex items-center justify-center gap-2"
            >
              <IconLock size={16} />
              Pagar RD${precio.toLocaleString("es-DO")}
            </button>
          </div>
        )}

        {/* Step: Processing */}
        {step === "processing" && (
          <div className="p-10 flex flex-col items-center justify-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
              <div className="absolute inset-0 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <IconCreditCard size={28} className="text-[var(--primary)]" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Procesando pago...</h3>
            <p className="text-sm text-gray-500 text-center">
              No cierres esta ventana. Esto tomará solo un momento.
            </p>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="p-10 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
              <IconCheck size={36} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">¡Pago exitoso!</h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              Tu cita ha sido confirmada y pagada.
            </p>
            <p className="text-xs text-gray-400 text-center">
              Recibirás una confirmación con todos los detalles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
