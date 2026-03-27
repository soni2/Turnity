import useRegistrationBusiness from "../Hooks/useRegistrationBusiness";
import { FormData } from "../types/registroNegocio";

export default function Paso7Pagos({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Métodos de pago</h2>
        <p className="text-gray-600">¿Qué formas de pago aceptas?</p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.metodosPago.efectivo}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                metodosPago: {
                  ...prev.metodosPago,
                  efectivo: e.target.checked,
                },
              }))
            }
            className="rounded border-gray-300 text-black focus:ring-black mr-3"
          />
          <div>
            <p className="font-medium">Efectivo</p>
            <p className="text-sm text-gray-500">
              Pago en efectivo en el local
            </p>
          </div>
        </label>

        <label className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.metodosPago.tarjeta}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                metodosPago: {
                  ...prev.metodosPago,
                  tarjeta: e.target.checked,
                },
              }))
            }
            className="rounded border-gray-300 text-black focus:ring-black mr-3"
          />
          <div>
            <p className="font-medium">Tarjeta de crédito/débito</p>
            <p className="text-sm text-gray-500">
              Visa, Mastercard, American Express
            </p>
          </div>
        </label>

        <label className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.metodosPago.transferencia}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                metodosPago: {
                  ...prev.metodosPago,
                  transferencia: e.target.checked,
                },
              }))
            }
            className="rounded border-gray-300 text-black focus:ring-black mr-3"
          />
          <div>
            <p className="font-medium">Transferencia bancaria</p>
            <p className="text-sm text-gray-500">
              Pago por adelantado o depósito
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
